import BasePlugin from './base';
import { action, IReactionOptions, reaction } from 'mobx';
import { IActionProps, IEficySchema } from '../interface';
import EficyController from '../core/Controller';
import { forEachDeep, isEficyAction, set } from '../utils';
import { ViewNode } from '../models';
import Config from '../constants/Config';
import { Inject } from 'plugin-decorator';

declare module '../core/Controller' {
  export default interface EficyController {
    reactions: IReaction[];
  }
}

interface IReaction {
  expression: (controller: EficyController) => any;
  effect: (effectResult: any, controller: EficyController) => IActionProps | void;
  options?: IReactionOptions;
}

export default class Reaction extends BasePlugin {
  public static pluginName: string = 'reaction';
  protected disposeArr: Array<() => void> = [];

  public loadOptions(data: IEficySchema & { reactions?: IReaction[] }) {
    const { reactions } = data;
    this.options.reactions = reactions || [];
  }

  public bindController(param: EficyController) {
    super.bindController(param);

    this.transformReactions();
    this.options.reactions.forEach(event => this.addReaction(event));
  }

  @Inject
  @action.bound
  public run(next, actionProps: IActionProps) {
    next(actionProps, { needReplaceVariable: !/^refresh|reload$/.test(actionProps.action) });
    if (actionProps.action === 'refresh') {
      this.transformReactions();
    }
  }

  /**
   * transform schema ${xxxx} to reaction event
   */
  protected transformReactions() {
    const models = this.controller.models;
    forEachDeep(
      models,
      (value: any, path) => {
        Object.entries(value).forEach(([key, itemValue]) => {
          if (ViewNode.solidField.includes(key)) {
            return;
          }
          if (typeof itemValue === 'string') {
            const replaceValue = this.controller.replaceVariables(itemValue, { keepExpression: false });
            if (replaceValue !== itemValue) {
              this.addReaction({
                expression: controller => controller.replaceVariables(itemValue, { keepExpression: false }),
                effect: result => set(models, `${path}.${key}`, result),
              });
            }
          }
        });
      },
      {
        exceptFns: [
          schema => schema['#view'] === 'Eficy',
          (schema, path) => /#request/.test(path),
          ...Config.loopExceptFns,
        ],
      },
    );
  }

  private addReaction(reactionOpt: IReaction) {
    const { expression, effect, options = {} } = reactionOpt;
    this.disposeArr.push(
      reaction(
        () => expression(this.controller),
        effectResult => {
          const actionResult = effect(effectResult, this.controller);
          if (isEficyAction(actionResult)) {
            this.controller.run(actionResult as IActionProps);
          }
        },
        {
          fireImmediately: true,
          onError: error => {
            // if store modules didn't ready ,skip warning
            console.warn('[plugin][watchReaction] run script error \n', error);
          },
          ...options,
        },
      ),
    );
  }
}
