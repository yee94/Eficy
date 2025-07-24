import { ReactElement, ReactNode, CSSProperties } from 'react';
import { DependencyContainer } from 'tsyringe';

/**
 * 视图配置接口
 */
export interface IViewConfig {
  /** 组件类型 */
  '#view': string;
  /** 唯一标识 */
  '#'?: string;
  /** 子组件 */
  '#children'?: IViewConfig[];
  /** 条件渲染 */
  '#if'?: boolean;
  /** 文本内容 */
  '#content'?: string;
  /** 静态属性 */
  '#staticProps'?: Record<string, any>;
  /** 样式 */
  style?: CSSProperties;
  /** CSS类名 */
  className?: string;
  /** React key */
  key?: string | number;
  /** 其他属性 */
  [key: string]: any;
}

/**
 * Schema配置接口
 */
export interface IEficySchema {
  /** 视图配置 */
  views?: IViewConfig[];
  /** 插件配置 */
  plugins?: IPluginConfig[];
  /** 请求配置 */
  requests?: IRequestConfig[];
  /** 全局数据 */
  data?: Record<string, any>;
  /** 组件映射 */
  componentMap?: Record<string, any>;
}

/**
 * 插件配置接口
 */
export interface IPluginConfig {
  /** 插件名称 */
  name: string;
  /** 插件选项 */
  options?: Record<string, any>;
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 请求配置接口
 */
export interface IRequestConfig {
  /** 请求标识 */
  '#'?: string;
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** 请求参数 */
  params?: Record<string, any>;
  /** 请求数据 */
  data?: any;
  /** 是否立即执行 */
  immediately?: boolean;
  /** 响应格式化函数 */
  format?: (response: any) => any;
}

/**
 * 动作配置接口
 */
export interface IActionConfig {
  /** 动作名称 */
  action: string;
  /** 动作数据 */
  data?: unknown;
  /** 其他选项 */
  [key: string]: unknown;
}

/**
 * 组件注册表接口
 */
export interface IComponentRegistry {
  /** 注册组件 */
  register(name: string, component: any): void;
  /** 获取组件 */
  get(name: string): any;
  /** 检查组件是否存在 */
  has(name: string): boolean;
  /** 移除组件 */
  remove(name: string): boolean;
  /** 获取所有组件 */
  getAll(): Record<string, any>;
  /** 扩展组件库 */
  extend(componentMap: Record<string, any>): void;
}

/**
 * 信号管理器接口
 */
export interface ISignalManager {
  /** 创建信号 */
  createSignal<T>(initialValue: T): ISignal<T>;
  /** 创建计算信号 */
  createComputed<T>(fn: () => T): ISignal<T>;
  /** 创建effect */
  createEffect(fn: () => void | (() => void)): () => void;
}

/**
 * 信号接口
 */
export interface ISignal<T> {
  /** 获取值 */
  get(): T;
  /** 设置值 */
  set(value: T): void;
  /** 更新值 */
  update(fn: (prev: T) => T): void;
  /** 订阅变化 */
  subscribe(listener: (value: T) => void): () => void;
}

/**
 * 插件基类接口
 */
export interface IPlugin {
  /** 插件名称 */
  readonly name: string;
  /** 插件版本 */
  readonly version: string;
  /** 是否为单例 */
  readonly singleton?: boolean;
  
  /** 安装插件 */
  install(container: DependencyContainer, options?: any): void;
  /** 卸载插件 */
  uninstall?(container: DependencyContainer): void;
  /** 配置插件 */
  configure?(options: any): void;
}

/**
 * 生命周期钩子接口
 */
export interface ILifecycleHooks {
  /** 组件创建前 */
  beforeCreate?(viewNode: any): void;
  /** 组件创建后 */
  afterCreate?(viewNode: any): void;
  /** 组件渲染前 */
  beforeRender?(viewNode: any): void;
  /** 组件渲染后 */
  afterRender?(element: ReactElement): ReactElement;
  /** 组件更新前 */
  beforeUpdate?(viewNode: any): void;
  /** 组件更新后 */
  afterUpdate?(viewNode: any): void;
  /** 组件销毁前 */
  beforeDestroy?(viewNode: any): void;
  /** 组件销毁后 */
  afterDestroy?(viewNode: any): void;
}

/**
 * 解析器选项接口
 */
export interface IResolverOptions {
  /** 组件映射 */
  componentMap?: Record<string, any>;
  /** 容器实例 */
  container?: DependencyContainer;
  /** 生命周期钩子 */
  hooks?: ILifecycleHooks;
}

/**
 * 配置服务接口
 */
export interface IConfigService {
  /** 获取配置 */
  get<T>(key: string, defaultValue?: T): T;
  /** 设置配置 */
  set(key: string, value: any): void;
  /** 批量设置配置 */
  setMany(config: Record<string, any>): void;
  /** 扩展配置 */
  extend(config: Record<string, any>): void;
  /** 检查配置是否存在 */
  has(key: string): boolean;
}

/**
 * Eficy核心类接口
 */
export interface IEficyCore {
  /** 配置框架 */
  config(options: Record<string, any>): this;
  /** 扩展组件库 */
  extend(options: { componentMap?: Record<string, any>; [key: string]: any }): this;
  /** 创建元素 */
  createElement(schema: IViewConfig | IEficySchema): ReactElement;
  /** 渲染到DOM */
  render(schema: IViewConfig | IEficySchema, container: string | HTMLElement): void;
  /** 获取容器 */
  getContainer(): DependencyContainer;
  /** 销毁实例 */
  destroy(): void;
} 