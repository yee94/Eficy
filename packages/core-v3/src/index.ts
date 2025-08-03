/**
 * @eficy/core-jsx - Modern React-based component system with signals reactivity
 */

// 导出核心类
export { Eficy } from './core/EficyCore';

// 导出组件
export { EficyNode } from './components/EficyNode';

// 导出上下文相关
export { EficyProvider, useEficyContext } from './contexts/EficyContext';

// 导出服务
export { ComponentRegistry } from './services/ComponentRegistry';
export { PluginManager, type Plugin, type IRenderContext as RenderContext } from './services/PluginManager';
export { EventEmitter, type EventListener } from './services/EventEmitter';

// 导出插件系统
export * from './interfaces/lifecycle';
export * from './decorators/lifecycle';
export { HookType } from './constants';

// 导出 JSX runtime（通过重新导出，支持直接导入）
export { jsx, jsxs, Fragment } from './jsx-runtime';

// 导出工具函数
export * from './utils';

export * from 'tsyringe';

// 导出类型定义
export * from './types';
