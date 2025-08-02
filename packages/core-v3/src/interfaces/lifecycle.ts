import { ComponentType } from 'react';
import type { DependencyContainer } from 'tsyringe';

export type PluginEnforce = 'pre' | 'post' | undefined;

export interface IEficyPlugin {
  name: string;
  version: string;
  dependencies?: string[];
  enforce?: PluginEnforce;

  install?(container: DependencyContainer): void;
  uninstall?(container: DependencyContainer): void;
}

// 生命周期插件接口 - 支持装饰器
export interface ILifecyclePlugin extends IEficyPlugin {
  // 渲染钩子 - 用于处理渲染上下文
  onRender?(context: IRenderContext, next: () => ComponentType<any>): ComponentType<any>;
}

export interface IRenderContext {
  props: Record<string, any>;
}
