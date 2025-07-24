import 'reflect-metadata';

// 核心类
export { EficyCore } from './core/EficyCore';

// 响应式系统 - 全局信号管理器
export { SignalManager } from './reactive/SignalManager';

// 数据模型
export { ViewNode } from './models/ViewNode';

// 服务
export { ConfigService } from './services/ConfigService';
export { ComponentRegistry } from './services/ComponentRegistry';
export { ResolverService } from './resolver/ResolverService';

// 插件系统
export { PluginManager } from './plugins/PluginManager';
export { BasePlugin } from './plugins/BasePlugin';

// 内置插件
export { RequestPlugin } from './plugins/builtin/RequestPlugin';
export { EventPlugin } from './plugins/builtin/EventPlugin';
export { ActionPlugin } from './plugins/builtin/ActionPlugin';

// 容器和依赖注入
export { EficyContainer, eficyContainer } from './container/Container';
export { TOKENS } from './container/tokens';

// 接口和类型
export type * from './interfaces';

// 便捷函数
import { EficyCore } from './core/EficyCore';

/**
 * 创建Eficy实例
 */
export const createEficy = () => new EficyCore();

/**
 * 默认实例
 */
export const eficy = new EficyCore();

/**
 * 配置默认实例
 */
export const config = (options: Record<string, unknown>) => eficy.config(options);

/**
 * 扩展默认实例
 */
export const extend = (options: { componentMap?: Record<string, unknown>; [key: string]: unknown }) => 
  eficy.extend(options);

/**
 * 使用默认实例创建元素
 */
export const createElement = (schema: any) => eficy.createElement(schema);

/**
 * 使用默认实例渲染
 */
export const render = (schema: any, container: string | HTMLElement) => 
  eficy.render(schema, container);

// 兼容旧版本的导出
export default EficyCore; 