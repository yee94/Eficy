import { Hook, PluginTarget } from 'plugin-decorator';
import { IActionProps, IEficySchema } from '../interface';
import resolver from './resolver';
import EficySchema from '../models/EficySchema';
import Config from '../constants/Config';
import ViewSchema from '../models/ViewSchema';
import { IReactComponent } from 'mobx-react';
import { action } from 'mobx';
import { buildInPlugins, pluginFactory } from '../plugins';
import BasePlugin from '../plugins/base';
import defaultActions, { IAction } from '../constants/defaultActions';
import createReplacer from '../utils/relaceVariable';

export default class EficyController extends PluginTarget {
  public model: EficySchema;
  public componentLibrary: Record<string, any>;
  public componentMap: Map<ViewSchema, IReactComponent> = new Map();
  protected actions: Record<string, IAction>;
  public replaceVariables: <T>(target: T) => T;

  constructor(model: IEficySchema, componentMap?: Record<string, any>) {
    super();
    this.model = new EficySchema(model);
    this.replaceVariables = this.createReplacer();
    this.bindActions();

    this.initPlugins(model);

    this.componentLibrary = componentMap || global[Config.defaultComponentMapName];
  }

  public get models(): Record<string, ViewSchema> {
    return this.model.viewDataMap;
  }

  public getModel(id: string): ViewSchema {
    return this.model.viewDataMap[id];
  }

  public run(actionProps: IActionProps) {
    const { action: actionName, data } = actionProps;
    if (!actionName || !this.actions[actionName]) {
      throw new Error(`not found valid action for "${actionName}"`);
    }

    this.actions[actionName](this.replaceVariables(data), this);
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
  public bindActions(actions: Record<string, IAction> = defaultActions) {
    this.actions = Object.assign(this.actions || {}, actions);
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
    super.install(plugin);
  }

  private createReplacer() {
    const context = { model: this.model, run: this.run.bind(this) };
    Object.defineProperty(context, 'models', {
      enumerable: true,
      get: () => {
        return this.models;
      },
    });

    return createReplacer(context);
  }
}
