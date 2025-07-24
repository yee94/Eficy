/**
 * 依赖注入标识符
 * 定义框架中各种服务的注入令牌
 */

// 核心服务tokens
export const TOKENS = {
  // 核心框架服务
  EFICY_CORE: Symbol('EficyCore'),
  CONFIG_SERVICE: Symbol('ConfigService'),
  COMPONENT_REGISTRY: Symbol('ComponentRegistry'),
  
  // 数据和状态管理
  SIGNAL_MANAGER: Symbol('SignalManager'),
  MODEL_FACTORY: Symbol('ModelFactory'),
  VIEW_NODE_FACTORY: Symbol('ViewNodeFactory'),
  
  // 渲染和解析
  RESOLVER_SERVICE: Symbol('ResolverService'),
  RENDER_SERVICE: Symbol('RenderService'),
  
  // 插件系统
  PLUGIN_MANAGER: Symbol('PluginManager'),
  LIFECYCLE_MANAGER: Symbol('LifecycleManager'),
  
  // 请求和动作
  REQUEST_SERVICE: Symbol('RequestService'),
  ACTION_SERVICE: Symbol('ActionService'),
  
  // 事件系统
  EVENT_EMITTER: Symbol('EventEmitter'),
  
  // 工具服务
  LOGGER_SERVICE: Symbol('LoggerService'),
  UTILS_SERVICE: Symbol('UtilsService'),
} as const;

export type TokenType = typeof TOKENS[keyof typeof TOKENS]; 