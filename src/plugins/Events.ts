import BasePlugin from './base';
import EficyController from '../core/Controller';
import { ExtendsViewNode, IEficySchema } from '../interface';
import { forEachDeep, isArray, isFunction, isPlainObject } from '../utils';
import { ViewNode } from '../models';
import { Bind } from 'lodash-decorators';
import { Inject } from 'plugin-decorator';

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
    // Object.values(this.controller.model.viewDataMap).forEach(this.wrapSpecialFunction.bind(this));
  }

  @Bind
  @Inject
  public getResolver(next) {
    const originResolver = next();
    return (viewNode, ...args) => {
      return originResolver(this.wrapSpecialFunction(viewNode), ...args);
    };
  }

  /**
   * wrap schema @xxx functions
   * @param schema
   */
  private wrapSpecialFunction(schema: ExtendsViewNode) {
    const targetSchema = schema instanceof ViewNode ? schema['#restProps'] : schema;

    forEachDeep(
      targetSchema,
      obj => {
        Object.keys(obj).forEach(objKey => {
          const value = obj[objKey];
          if (typeof value === 'function' && /^@\w+/.test(objKey)) {
            delete obj[objKey];
            obj[objKey.replace('@', '')] = this.wrapController(value);
          }
        });
        return obj;
      },
      {
        isIncludeArray: true,
        exceptFns: [obj => !isPlainObject(obj)],
      },
    );

    return schema;
  }

  /**
   * resolver event and add to ViewNode
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
    const viewNode = viewDataMap[id] as ViewNode;
    if (viewNode) {
      this.addActionsToSchema(listeners as IListenerFn[], action, viewNode);
    }
  }

  /**
   * keep origin method and add hook methods
   * @param fns
   * @param action
   * @param schema
   */
  private addActionsToSchema(fns: IListenerFn[], action, schema: ViewNode) {
    const originFunction = schema[action];
    let targetFn;
    if (isFunction(originFunction)) {
      targetFn = originFunction;
    }
    schema[action] = (...args) => {
      fns && fns.map(this.wrapController.bind(this)).forEach((fn: any) => fn());
      return targetFn && targetFn(...args);
    };
  }

  /**
   * return a injected Controller function
   * @param fn
   * @returns {(...args) => any}
   */
  private wrapController(fn: (...args: any) => any): IListenerFn {
    return (...args) => fn(this.controller, ...args);
  }
}
