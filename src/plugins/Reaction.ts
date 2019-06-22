import BasePlugin from './base';
import { IReactionOptions, reaction } from 'mobx';
import { IActionProps, IEficySchema } from '../interface';
import EficyController from '../core/Controller';
import { forEachDeep, isEficyAction, set } from '../utils';
import { ViewSchema } from '../models';
import Config from '../constants/Config';

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
  private disposeArr: Array<() => void> = [];

  public loadOptions(data: IEficySchema & { reactions?: IReaction[] }) {
    const { reactions } = data;
    this.options.reactions = reactions || [];
  }

  public bindController(param: EficyController) {
    super.bindController(param);

    this.transformReactions();
    this.options.reactions.forEach(event => this.addReaction(event));
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
          if (ViewSchema.solidField.includes(key)) {
            return;
          }
          if (typeof itemValue === 'string') {
            const replaceValue = this.controller.replaceVariables(itemValue);
            if (replaceValue !== itemValue) {
              this.addReaction({
                expression: controller => controller.replaceVariables(itemValue),
                effect: result => set(models, `${path}.${key}`, result),
              });
            }
          }
        });
      },
      {
        exceptFns: Config.loopExceptFns,
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

  public destroyPlugin() {
    while (this.disposeArr.length) {
      const disposeFn = this.disposeArr.pop();
      disposeFn && disposeFn();
    }
  }
}
