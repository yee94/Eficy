import BasePlugin from './base';
import EficyController from '../core/Controller';
import { IEficySchema } from '../interface';
import { isArray, isFunction } from '../utils';
import { ViewSchema } from '../models';

type IListenerFn = (controller: EficyController, ...args: any) => void;

export interface IEvent {
  publisher:
    | string // form@onSubmit
    | {
        '#': string;
        action: string;
      };
  listeners: IListenerFn | IListenerFn[];
}

export default class Events extends BasePlugin {
  public static pluginName: string = 'events';

  public loadOptions(data: IEficySchema & { events?: IEvent[] }) {
    const { events } = data;
    this.options.events = events || [];
  }

  public bindController(param: EficyController) {
    super.bindController(param);
    if (this.controller.plugins.some(plugin => plugin instanceof Events && plugin !== this)) {
      console.warn('There are too many events plugin at EficyController!');
    }
    this.options.events.forEach(event => this.addEvent(event));
  }

  /**
   * resolver event and add to ViewSchema
   * @param event
   */
  private addEvent(event: IEvent) {
    const { publisher } = event;
    let { listeners } = event;
    let id;
    let action;
    if (typeof publisher === 'string') {
      // @ts-ignore
      let input = null;
      [input, id, action] = publisher.match(/(.+?)@(.+)/) || ([] as any);
    } else {
      id = publisher['#'];
      action = publisher.action;
    }
    if (!isArray(listeners) && !(listeners instanceof Array)) {
      listeners = [listeners];
    }

    const viewDataMap = this.controller.model.viewDataMap;
    const viewSchema = viewDataMap[id] as ViewSchema;
    if (viewSchema) {
      this.addActionsToSchema(listeners as IListenerFn[], action, viewSchema);
    }
  }

  /**
   * keep origin method and add hook methods
   * @param fns
   * @param action
   * @param schema
   */
  private addActionsToSchema(fns: IListenerFn[], action, schema: ViewSchema) {
    let targetFn: (...args: any) => void;
    if (isFunction(schema[action])) {
      targetFn = schema[action];
    }
    schema[action] = (...args) => {
      fns.forEach(fn => fn(this.controller, ...args));
      targetFn && targetFn(...args);
    };
  }
}
