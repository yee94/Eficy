// Plugin system implementation
// Based on tsyringe dependency injection with lifecycle decorators

// Export builtin plugins
export { UnocssRuntimePlugin, createUnocssRuntimePlugin } from './builtin/UnocssRuntimePlugin'
export type { IUnocssRuntimeConfig } from './builtin/UnocssRuntimePlugin'

// Export plugin interfaces
export type {
  IEficyPlugin,
  ILifecyclePlugin,
  IHookRegistration,
  IPluginWeight,
  HookType,
  PluginEnforce,
  // Context interfaces
  IBaseContext,
  IInitContext,
  IBuildSchemaNodeContext,
  IRenderContext,
  IMountContext,
  IUnmountContext,
  IResolveComponentContext,
  IProcessPropsContext,
  IHandleEventContext,
  IBindEventContext,
  IErrorContext
} from '../interfaces/lifecycle'

// Export lifecycle decorators
export {
  Init,
  BuildSchemaNode,
  Render,
  OnMount,
  OnUnmount,
  ResolveComponent,
  ProcessProps,
  OnHandleEvent,
  OnBindEvent,
  OnError,
  getLifecycleHooks,
  hasLifecycleHook,
  getLifecycleHooksByType,
  sortHooksByPriority
} from '../decorators/lifecycle'