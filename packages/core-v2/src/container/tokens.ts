export const TOKENS = {
  // Core services
  EFICY_CONTROLLER: Symbol('EficyController'),
  SCHEMA_PARSER: Symbol('SchemaParser'),
  RENDERER: Symbol('Renderer'),
  COMPONENT_REGISTRY: Symbol('ComponentRegistry'),
  PLUGIN_MANAGER: Symbol('PluginManager'),
  
  // Configuration
  EFICY_CONFIG: Symbol('EficyConfig'),
  COMPONENT_MAP: Symbol('ComponentMap'),
  
  // Data and State
  SIGNAL_STORE: Symbol('SignalStore'),
  ACTION_HANDLER: Symbol('ActionHandler'),
  VARIABLE_REPLACER: Symbol('VariableReplacer'),
  
  // Plugins
  REQUEST_PLUGIN: Symbol('RequestPlugin'),
  TWO_WAY_BIND_PLUGIN: Symbol('TwoWayBindPlugin'),
  EVENTS_PLUGIN: Symbol('EventsPlugin'),
  ACTIONS_PLUGIN: Symbol('ActionsPlugin'),
  REACTION_PLUGIN: Symbol('ReactionPlugin'),
  
  // Lifecycle hooks
  BEFORE_RENDER_HOOK: Symbol('BeforeRenderHook'),
  AFTER_RENDER_HOOK: Symbol('AfterRenderHook'),
  BEFORE_UPDATE_HOOK: Symbol('BeforeUpdateHook'),
  AFTER_UPDATE_HOOK: Symbol('AfterUpdateHook'),
} as const;

export type TokenKey = keyof typeof TOKENS;
export type Token = typeof TOKENS[TokenKey];