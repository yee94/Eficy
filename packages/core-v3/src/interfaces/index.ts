import type { ReactElement, ComponentType } from 'react'

// 基础视图节点接口
export interface IViewData {
  '#'?: string
  '#view': string
  '#children'?: IViewData[]
  '#content'?: string | ReactElement
  '#if'?: boolean | (() => boolean)
  [key: string]: any
}

// Schema 接口
export interface IEficySchema {
  views: IViewData[]
  plugins?: IPlugin[]
  [key: string]: any
}

// 配置接口
export interface IEficyConfig {
  componentMap?: Record<string, ComponentType<any> | string>
  plugins?: IPlugin[]
  defaultProps?: Record<string, any>
  errorBoundary?: ComponentType<any>
  [key: string]: any
}

// 扩展配置接口
export interface IExtendOptions {
  componentMap?: Record<string, ComponentType<any> | string>
  plugins?: IPlugin[]
  defaultProps?: Record<string, any>
  [key: string]: any
}

// 插件接口
export interface IPlugin {
  name: string
  version?: string
  install?: (eficy: any) => void
  [key: string]: any
}

// 生命周期上下文接口
export interface ILifecycleContext {
  [key: string]: any
}

export interface IInitContext extends ILifecycleContext {
  config: IEficyConfig
}

export interface IBuildViewNodeContext extends ILifecycleContext {
  viewData: IViewData
  parentNode?: any
}

// 组件Props接口
export interface IRenderNodeProps {
  viewNode: any
  componentMap?: Record<string, ComponentType<any> | string>
}

// 错误边界Props接口
export interface IErrorBoundaryProps {
  error: Error
  errorInfo: any
  children?: ReactElement
}

// 服务接口
export interface IConfigService {
  get<T = any>(key: string): T
  set(key: string, value: any): void
  extend(options: IExtendOptions): void
  getConfig(): IEficyConfig
}

export interface IComponentRegistry {
  register(name: string, component: ComponentType<any> | string): void
  unregister(name: string): void
  get(name: string): ComponentType<any> | string | null
  getAll(): Record<string, ComponentType<any> | string>
  extend(componentMap: Record<string, ComponentType<any> | string>): void
}

export interface ILifecycleManager {
  register(phase: string, target: any, method: string): void
  execute(phase: string, context: ILifecycleContext): Promise<void>
  hasHooks(phase: string): boolean
} 