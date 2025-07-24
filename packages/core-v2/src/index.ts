// Core exports
export { Eficy } from './core/Eficy';
export { EficyController } from './core/EficyController';
export { SignalStore } from './core/SignalStore';
export { ComponentRegistry } from './core/ComponentRegistry';
export { ActionHandler } from './core/ActionHandler';

// Models
export { EficySchema } from './models/EficySchema';
export { ViewNode } from './models/ViewNode';

// Components
export { EficyComponent } from './components/EficyComponent';
export { EficyRenderer } from './components/EficyRenderer';

// Plugins
export { BasePlugin } from './plugins/BasePlugin';
export { PluginManager } from './plugins/PluginManager';

// Utils
export { VariableReplacer } from './utils/VariableReplacer';

// Dependency Injection
export { DIContainer, inject, singleton, injectable } from './container/DIContainer';
export { TOKENS } from './container/tokens';

// Types
export type {
  IEficyConfig,
  IEficySchema,
  IView,
  IPlugin,
  IPluginConfig,
  IAction,
  IActionProps,
  IRequestConfig,
  IComponentProps,
  IReplaceOptions,
  LifecycleHook,
} from './types';

// Default export
import { Eficy } from './core/Eficy';
export default Eficy;