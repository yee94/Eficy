import BasePlugin from './base';
import EficyController from '../core/Controller';
import { IEficySchema } from '../interface';
import { Bind } from 'lodash-decorators';
import { Inject } from 'plugin-decorator';
import { IAction } from '../constants/defaultActions';

type IListenerFn = (controller: EficyController, ...args: any) => void;

export type IActions = {
  [key in string]: IListenerFn;
};

export default class Action extends BasePlugin {
  public static pluginName: string = 'actions';
  protected actions: Record<string, IAction> = {};

  public loadOptions(data: IEficySchema & { actions?: IActions }) {
    const { actions } = data;
    this.options.actions = actions || ({} as IActions);
  }

  public bindController(param: EficyController) {
    super.bindController(param);
    if (this.controller.plugins.some(plugin => plugin instanceof Action && plugin !== this)) {
      console.warn('There are too many actions plugin at EficyController!');
    }
    this.addAction(this.options.actions);
  }

  /**
   * addAction to Controller
   * @param event
   */
  private addAction(event: IActions) {
    Object.entries(event).forEach(([key, fn]) => {
      this.actions[key] = fn.bind(this.controller);
    });
  }

  @Bind
  @Inject
  public getActions(next) {
    const actions = next();
    return Object.assign({}, actions, this.actions);
  }
}
