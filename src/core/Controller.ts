import { IEficySchema } from '../interface';
import resolver from './resolver';
import EficySchema from '../models/EficySchema';
import Config from '../constants/Config';
import ViewSchema from '../models/ViewSchema';
import { IReactComponent, observer } from 'mobx-react';
import { action } from 'mobx';
import { makePlugin } from '../plugins';
import BasePlugin from '../plugins/base';
import { Hook } from '../utils';
import React from 'react';

export default class EficyController {
  public model: EficySchema;
  public componentLibrary: Record<string, any>;
  public componentMap: Map<ViewSchema, IReactComponent> = new Map();

  constructor(model: IEficySchema, componentMap?: Record<string, any>) {
    this.model = new EficySchema(model);
    this.initPlugins();

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
  protected componentWrap<T>(component: T, schema: ViewSchema): T {
    return component;
  }

  @Hook
  protected componentRenderWrap<T>(component: T, props: any): T {
    return component;
  }

  public resolver(view?: ViewSchema | ViewSchema[]) {
    return React.createElement(
      observer(() =>
        resolver(view || this.model.views, {
          componentMap: this.componentLibrary,
          onRegister: this.onRegister,
          componentWrap: this.componentWrap,
        }),
      ),
    );
  }

  private initPlugins() {
    const pluginItemVO = this.model.plugins;

    if (pluginItemVO) {
      pluginItemVO.map(makePlugin).forEach(this.install);
    }
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
