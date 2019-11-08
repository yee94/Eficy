import BasePlugin from './base';
import EficyController from '../core/Controller';
import { ExtendsViewSchema, IEficySchema } from '../interface';
import { forEachDeep, isArray, isFunction, isPlainObject } from '../utils';
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
    Object.values(this.controller.model.viewDataMap).forEach(this.wrapEvent.bind(this));
  }

  /**
   * wrap schema @xxx functions
   * @param schema
   */
  private wrapEvent(schema: ExtendsViewSchema) {
    forEachDeep(
      schema['#restProps'],
      obj => {
        Object.keys(obj).forEach(objKey => {
          const value = obj[objKey];
          if (typeof value === 'function') {
            obj[objKey] = this.makeEventWrapFn(obj[objKey]);
          }
        });
        return obj;
      },
      {
        isIncludeArray: true,
        exceptFns: [obj => !isPlainObject(obj)],
      },
    );
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
      [, id, action] = publisher.match(/(.+?)@(.+)/) || ([] as any);
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
    schema[action] = this.makeEventWrapFn(schema[action], fns);
  }

  /**
   * build controller wrap function
   * @param originFunction
   * @param fns
   * @returns {(...args) => void}
   */
  private makeEventWrapFn(originFunction: (...args: any) => any, fns?: IListenerFn[]): IListenerFn {
    let targetFn: IListenerFn;
    if (isFunction(originFunction)) {
      targetFn = originFunction;
    }
    return (...args) => {
      fns && fns.forEach(fn => fn(this.controller, ...args));
      // console.log(targetFn.toString(), targetFn.caller);
      const fnStr = targetFn.toString();
      // TODO:: 定义一种好用的格式
      // if(has)
      // if(/ck/)

      // console.log(path);
      // this.controller,
      return targetFn && targetFn(...args);
    };
  }
}
