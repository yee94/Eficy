import { Hook, PluginTarget } from 'plugin-decorator';
import { IActionProps, IEficySchema, ExtendsViewSchema } from '../interface';
import resolver from './resolver';
import EficySchema from '../models/EficySchema';
import Config from '../constants/Config';
import { IReactComponent } from 'mobx-react';
import { action, observable } from 'mobx';
import { buildInPlugins, pluginFactory } from '../plugins';
import BasePlugin from '../plugins/base';
import defaultActions, { IAction } from '../constants/defaultActions';
import { relaceVariable as createReplacer } from '../utils';
import * as insideComponents from '../components';

export default class EficyController extends PluginTarget {
  public model: EficySchema;
  public plugins: BasePlugin[];
  public componentLibrary: Record<string, any>;
  public componentMap: Map<ExtendsViewSchema, IReactComponent> = new Map();
  public replaceVariables: <T>(target: T) => T;
  protected actions: Record<string, IAction>;

  @observable.ref
  public parentController?: EficyController;

  constructor(model: IEficySchema, componentMap?: Record<string, any>) {
    super();
    this.componentLibrary = Object.assign({}, insideComponents, componentMap || global[Config.defaultComponentMapName]);

    this.model = new EficySchema(model, this.componentLibrary);
    this.replaceVariables = this.createReplacer();
    this.bindActions();

    this.initPlugins(model);
  }

  public get models(): Record<string, ExtendsViewSchema> {
    return this.model.viewDataMap;
  }

  public getModel(id: string): ExtendsViewSchema {
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
  protected onRegister(model: ExtendsViewSchema, ref: IReactComponent) {
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
  protected componentWrap<T>(component: T, schema: ExtendsViewSchema): T {
    return component;
  }

  /**
   * get resolver when component render
   * @param resolverNext
   * @param schema
   * @returns {any}
   */
  @Hook
  public getResolver(resolverNext: any = resolver, schema?: ExtendsViewSchema): any {
    return resolverNext;
  }

  public resolver(view?: ExtendsViewSchema | ExtendsViewSchema[]) {
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
    Object.defineProperty(context, 'parent', {
      enumerable: true,
      get: () => {
        return this.parentController;
      },
    });

    return createReplacer(context);
  }

  public destroy() {
    [...this.plugins].forEach(plugin => {
      this.uninstall(plugin);
      plugin.destroyPlugin();
    });
    this.parentController = undefined;
  }
}
