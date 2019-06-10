import { IEficySchema } from '../interface';
import resolver from './resolver';
import EficySchema from '../models/EficySchema';
import Config from '../constants/Config';
import ViewSchema from '../models/ViewSchema';
import { IReactComponent } from 'mobx-react';
import { action } from 'mobx';
import { buildInPlugins, pluginFactory } from '../plugins';
import BasePlugin from '../plugins/base';
import { Hook } from '../utils';

export default class EficyController {
  public model: EficySchema;
  public componentLibrary: Record<string, any>;
  public componentMap: Map<ViewSchema, IReactComponent> = new Map();
  public plugins: BasePlugin[] = [];

  constructor(model: IEficySchema, componentMap?: Record<string, any>) {
    this.model = new EficySchema(model);
    this.initPlugins(model);

    this.componentLibrary = componentMap || window[Config.defaultComponentMapName];
  }

  @action.bound
  protected onRegister(model: ViewSchema, ref: IReactComponent) {
    if (!this.componentMap.get(model)) {
      console.log(`register "${model['#']}" component`);
      this.componentMap.set(model, ref);
    } else {
      console.warn(`"${model['#']}" component already register `);
      this.componentMap.set(model, ref);
    }
  }

  @Hook
  protected loadData(data: IEficySchema & any) {
    return data;
  }

  /**
   * add some component wrap at plugins
   * @param component
   * @param schema
   * @returns {T}
   */
  @Hook
  protected componentWrap<T>(component: T, schema: ViewSchema): T {
    return component;
  }

  /**
   * get resolver when component render
   * @param resolverNext
   * @param schema
   * @returns {any}
   */
  @Hook
  public getResolver(resolverNext: any = resolver, schema?: ViewSchema): any {
    return resolverNext;
  }

  public resolver(view?: ViewSchema | ViewSchema[]) {
    return this.getResolver()(view || this.model.views, {
      componentMap: this.componentLibrary,
      onRegister: this.onRegister,
      componentWrap: this.componentWrap,
      getResolver: this.getResolver,
    });
  }

  private initPlugins(data: IEficySchema) {
    const pluginItemVO = [...(this.model.plugins || []), ...buildInPlugins];

    pluginItemVO.map(pluginFactory).forEach(plugin => {
      plugin.loadOptions(data);
      this.install(plugin);
    });
  }

  @action.bound
  public install(plugin: BasePlugin) {
    plugin.bindController(this);
    // tslint:disable-next-line:no-unused-expression
    plugin.pluginHooks &&
      plugin.pluginHooks.forEach(methodName => {
        if (this[methodName] && this[methodName].addHook) {
          this[methodName].addHook(plugin[methodName]);
        }
      });
  }
}
