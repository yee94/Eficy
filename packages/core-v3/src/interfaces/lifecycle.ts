import type { ComponentType, ReactElement } from 'react'
import type { DependencyContainer } from 'tsyringe'
import type ViewNode from '../models/ViewNode'
import type { IViewData, IEficySchema } from './index'

// 基础上下文接口
export interface IBaseContext {
  eficy?: any // Eficy 实例
  timestamp: number
  requestId: string
  userId?: string
}

// 初始化上下文
export interface IInitContext extends IBaseContext {
  config: any
  componentMap: Record<string, ComponentType | string>
}

// Schema 节点构建上下文
export interface IBuildSchemaNodeContext extends IBaseContext {
  parent?: ViewNode
  schema: IEficySchema
  index: number
  path: string[]
}

// 渲染上下文
export interface IRenderContext extends IBaseContext {
  componentMap: Record<string, ComponentType | string>
  isSSR: boolean
  theme?: string
}

// 挂载上下文
export interface IMountContext extends IBaseContext {
  container?: Element
  parentElement?: Element
}

// 卸载上下文
export interface IUnmountContext extends IBaseContext {
  container?: Element
  parentElement?: Element
}

// 组件解析上下文
export interface IResolveComponentContext extends IBaseContext {
  componentMap: Record<string, ComponentType | string>
  fallbackComponent?: ComponentType
}

// 属性处理上下文
export interface IProcessPropsContext extends IBaseContext {
  component: ComponentType
  originalProps: Record<string, any>
}

// 事件处理上下文
export interface IHandleEventContext extends IBaseContext {
  target: Element
  currentTarget: Element
  originalEvent: Event
}

// 事件绑定上下文
export interface IBindEventContext extends IBaseContext {
  element: Element
  eventType: string
}

// 错误处理上下文
export interface IErrorContext extends IBaseContext {
  component?: string
  stack: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recoverable: boolean
}

// 插件执行顺序配置
export type PluginEnforce = 'pre' | 'post' | undefined

// 插件接口
export interface IEficyPlugin {
  name: string
  version: string
  dependencies?: string[]
  enforce?: PluginEnforce // 插件执行顺序：pre (最早), undefined (默认), post (最晚)
  
  install?(container: DependencyContainer): void
  uninstall?(container: DependencyContainer): void
}

// 生命周期插件接口
export interface ILifecyclePlugin extends IEficyPlugin {
  // 初始化钩子
  onInit?(context: IInitContext, next: () => Promise<void>): Promise<void>
  
  // Schema 节点构建钩子
  onBuildSchemaNode?(
    viewData: IViewData,
    context: IBuildSchemaNodeContext,
    next: () => Promise<ViewNode>
  ): Promise<ViewNode>
  
  // 渲染钩子
  onRender?(
    viewNode: ViewNode,
    context: IRenderContext,
    next: () => Promise<ReactElement>
  ): Promise<ReactElement>
  
  // 挂载钩子
  onMount?(
    element: Element,
    viewNode: ViewNode,
    context: IMountContext,
    next: () => Promise<void>
  ): Promise<void>
  
  // 卸载钩子
  onUnmount?(
    element: Element,
    viewNode: ViewNode,
    context: IUnmountContext,
    next: () => Promise<void>
  ): Promise<void>
  
  // 组件解析钩子
  onResolveComponent?(
    componentName: string,
    viewNode: ViewNode,
    context: IResolveComponentContext,
    next: () => Promise<ComponentType>
  ): Promise<ComponentType>
  
  // 属性处理钩子
  onProcessProps?(
    props: Record<string, any>,
    viewNode: ViewNode,
    context: IProcessPropsContext,
    next: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>>
  
  // 事件处理钩子
  onHandleEvent?(
    event: Event,
    viewNode: ViewNode,
    context: IHandleEventContext,
    next: () => Promise<any>
  ): Promise<any>
  
  // 事件绑定钩子
  onBindEvent?(
    eventName: string,
    handler: Function,
    viewNode: ViewNode,
    context: IBindEventContext,
    next: () => Promise<void>
  ): Promise<void>
  
  // 错误处理钩子
  onError?(
    error: Error,
    viewNode: ViewNode | null,
    context: IErrorContext,
    next: () => Promise<ReactElement | void>
  ): Promise<ReactElement | void>
}

// 异步流程钩子类型枚举 - 支持Promise，按序执行
export enum AsyncFlowHookType {
  INIT = 'init',
  BUILD_SCHEMA_NODE = 'buildSchemaNode',
  RESOLVE_COMPONENT = 'resolveComponent',
  PROCESS_PROPS = 'processProps',
  RENDER = 'render'
}

// 同步副作用钩子类型枚举 - fire and forget，并行执行
export enum SyncSideEffectHookType {
  ON_MOUNT = 'onMount',
  ON_UNMOUNT = 'onUnmount',
  ON_HANDLE_EVENT = 'onHandleEvent',
  ON_BIND_EVENT = 'onBindEvent',
  ON_ERROR = 'onError'
}

// 统一钩子类型枚举（向后兼容）
export enum HookType {
  // 异步流程钩子
  INIT = 'init',
  BUILD_SCHEMA_NODE = 'buildSchemaNode',
  RENDER = 'render',
  RESOLVE_COMPONENT = 'resolveComponent',
  PROCESS_PROPS = 'processProps',
  
  // 同步副作用钩子 (新命名)
  ON_MOUNT = 'onMount',
  ON_UNMOUNT = 'onUnmount',
  ON_HANDLE_EVENT = 'onHandleEvent',
  ON_BIND_EVENT = 'onBindEvent',
  ON_ERROR = 'onError',
  
  // 已弃用的旧命名（向后兼容）
  /** @deprecated 使用 ON_MOUNT */
  MOUNT = 'mount',
  /** @deprecated 使用 ON_UNMOUNT */
  UNMOUNT = 'unmount',
  /** @deprecated 使用 ON_HANDLE_EVENT */
  HANDLE_EVENT = 'handleEvent',
  /** @deprecated 使用 ON_BIND_EVENT */
  BIND_EVENT = 'bindEvent',
  /** @deprecated 使用 ON_ERROR */
  ERROR = 'error'
}

// 钩子注册信息
export interface IHookRegistration {
  hookType: HookType
  plugin: ILifecyclePlugin
  handler: Function
  priority?: number
  enforce?: PluginEnforce // 继承插件的enforce配置
}

// 插件排序权重
export interface IPluginWeight {
  plugin: ILifecyclePlugin
  weight: number // 权重值，越小越早执行
  enforce: PluginEnforce
  priority: number
}