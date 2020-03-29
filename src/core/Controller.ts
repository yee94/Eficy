import { Hook, PluginTarget } from 'plugin-decorator';
import { ExtendsViewNode, IActionProps, IEficySchema, IView } from '../interface';
import resolver from './resolver';
import EficySchema from '../models/EficySchema';
import Config from '../constants/Config';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { buildInPlugins, pluginFactory } from '../plugins';
import BasePlugin from '../plugins/base';
import defaultActions, { IAction } from '../constants/defaultActions';
import { get, relaceVariable as createReplacer } from '../utils';
import * as insideComponents from '../components';
import * as React from 'react';
import { renderReact } from '../utils/renderHelper';
import { IReplaceOptions } from '../utils/relaceVariable';
import { IReactComponent } from 'mobx-react/dist/types/IReactComponent';

export default class EficyController extends PluginTarget {
  public plugins: BasePlugin[];
  public componentLibrary: Record<string, any>;
  public componentMap: Map<ExtendsViewNode, IReactComponent> = new Map();
  public replaceVariables: <T>(target: T, options?: IReplaceOptions) => T;
  protected actions: Record<string, IAction>;

  @observable.ref
  public model: EficySchema;
  @observable.ref
  public parentController?: EficyController;

  constructor(data: IEficySchema | IView, componentMap?: Record<string, any>) {
    super();
    this.componentLibrary = Object.assign({}, insideComponents, Config.defaultComponentMap, componentMap);
    this.replaceVariables = this.createReplacer();

    this.reload(data);
  }

  public reload(data: IEficySchema | IView) {
    if (!('views' in data) && '#view' in data) {
      data = { views: [data] };
    }
    this.clearPlugins();
    this.model = new EficySchema(data, this.componentLibrary);
    this.bindActions();
    this.initPlugins(data);
  }

  public get models(): Record<string, ExtendsViewNode> {
    return this.model.viewDataMap;
  }

  public getModel(id: string): ExtendsViewNode {
    return this.model.viewDataMap[id];
  }

  /**
   * run actions
   * @param actionProps
   * @param options
   */
  @Hook
  public run(actionProps: IActionProps, options: { needReplaceVariable?: boolean } = {}) {
    const needReplaceVariable = get(options, 'needReplaceVariable', true);
    const { action: actionName, data } = actionProps;
    if (!actionName || !this.actions[actionName]) {
      throw new Error(`not found valid action for "${actionName}"`);
    }

    this.actions[actionName](needReplaceVariable ? this.replaceVariables(data) : data, this);
  }

  @action.bound
  protected onRegister(model: ExtendsViewNode, ref: IReactComponent) {
    if (!model['#']) {
      return;
    }
    if (!this.componentMap.has(model)) {
      // console.log(`register "${model['#']}" component`);
      this.componentMap.set(model, ref);
    } else {
      // console.warn(`"${model['#']}" component already register `);
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
  protected componentWrap<T>(component: T, schema: ExtendsViewNode): T {
    return component;
  }

  /**
   * get resolver when component render
   * @param resolverNext
   * @param schema
   * @returns {any}
   */
  @Hook
  public getResolver(resolverNext: any = resolver, schema?: ExtendsViewNode): any {
    return resolverNext;
  }

  public resolver(view?: ExtendsViewNode | ExtendsViewNode[]) {
    return React.createElement(
      observer(() =>
        this.getResolver()(view || this.model.views, {
          componentMap: this.componentLibrary,
          onRegister: this.onRegister,
          componentWrap: this.componentWrap,
          getResolver: this.getResolver,
        }),
      ),
    );
  }

  private initPlugins(data: IEficySchema) {
    const pluginItemVO = [...(this.model.plugins || []), ...buildInPlugins];

    const runSet: Set<BasePlugin> = new Set();

    pluginItemVO
      .map(pluginItem => pluginFactory(pluginItem, runSet))
      .forEach(plugin => {
        if (plugin) {
          plugin.loadOptions(data);
          this.install(plugin);
        }
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

  public render(option: string | HTMLElement) {
    const dom = typeof option === 'string' ? document.querySelector(option) : option;

    return renderReact(this.resolver(), dom);
  }

  private clearPlugins() {
    [...this.plugins].forEach(plugin => {
      this.uninstall(plugin);
      plugin.destroyPlugin();
    });
  }

  public destroy() {
    this.clearPlugins();
    this.componentMap.clear();
    this.parentController = undefined;
  }
}
