import { DependencyContainer, inject, singleton } from 'tsyringe';
import { HookType } from '../constants';
import { getLifecycleHooks } from '../decorators/lifecycle';
import type {
  IEficyPlugin,
  IRenderContext,
  PluginEnforce,
  ILifecyclePlugin,
  EficyPlugin,
} from '../interfaces/lifecycle';
import type { ComponentType } from 'react';

/**
 * 简化的插件管理器 - 保留装饰器支持
 */
@singleton()
export class PluginManager {
  private plugins: Map<string, IEficyPlugin> = new Map();
  private hooks: Map<HookType, Array<{ plugin: IEficyPlugin; handler: Function; enforce?: PluginEnforce }>> = new Map();
  private container: DependencyContainer;

  constructor(@inject('Container') container: DependencyContainer) {
    this.container = container;
  }

  /**
   * 注册插件
   */
  register<T extends IEficyPlugin>(pluginInstance: new (...args: any[]) => T): T {
    const plugin = this.container.resolve(pluginInstance);

    if (this.plugins.has(plugin.name)) {
      console.warn(`[PluginManager] Plugin "${plugin.name}" already registered, overwriting`);
    }

    this.plugins.set(plugin.name, plugin);

    // 注册钩子
    if (this.isLifecyclePlugin(plugin)) {
      this.registerLifecycleHooks(plugin as ILifecyclePlugin);
    }

    plugin.initialize?.();

    console.log(`[PluginManager] Plugin "${plugin.name}" registered successfully`);

    return plugin;
  }

  /**
   * 卸载插件
   */
  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      console.warn(`[PluginManager] Plugin "${pluginName}" not found`);
      return;
    }

    // 移除所有钩子
    for (const [hookType, hooks] of this.hooks.entries()) {
      this.hooks.set(
        hookType,
        hooks.filter((hook) => hook.plugin !== plugin),
      );
    }

    // 执行插件卸载
    if (plugin.uninstall) {
      plugin.uninstall(container);
    }

    this.plugins.delete(pluginName);
    console.log(`[PluginManager] Plugin "${pluginName}" unregistered successfully`);
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): IEficyPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): IEficyPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取已安装的插件名称列表
   */
  getInstalledPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * 检查插件是否已安装
   */
  isInstalled(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  /**
   * 执行钩子链 - 洋葱式中间件模式
   */
  executeHook<T, Context>(hookType: HookType, context: Context, originalNext: () => T): T {
    const hooks = this.hooks.get(hookType) || [];

    if (hooks.length === 0) {
      // 如果没有钩子，执行原始的 next 函数
      return originalNext();
    }

    // 创建洋葱式中间件执行链
    const compose = (index: number): (() => T) => {
      if (index >= hooks.length) {
        // 到达链的末尾，执行原始的 next 函数
        return originalNext;
      }

      const hook = hooks[index];
      const next = compose(index + 1);

      return () => {
        try {
          // 调用钩子函数，传递 context 和 next
          return hook.handler(context, next);
        } catch (error) {
          console.error(`[PluginManager] Error in plugin "${hook.plugin.name}" ${hookType} hook:`, error);
          // 继续执行下一个钩子
          return next();
        }
      };
    };

    // 从第一个钩子开始执行
    return compose(0)();
  }

  /**
   * 执行渲染钩子 - 便捷方法
   */
  executeRenderHooks(Component: ComponentType<any>, context: IRenderContext): ComponentType<any> {
    return this.executeHook(HookType.RENDER, context, () => Component);
  }

  /**
   * 获取插件执行顺序
   */
  getExecutionOrder(): Array<{ name: string; enforce?: PluginEnforce }> {
    const renderHooks = this.hooks.get(HookType.RENDER) || [];
    return renderHooks.map((hook) => ({
      name: hook.plugin.name,
      enforce: hook.enforce,
    }));
  }

  /**
   * 清理所有插件
   */
  dispose(): void {
    for (const pluginName of this.plugins.keys()) {
      this.unregister(pluginName);
    }
    this.plugins.clear();
    this.hooks.clear();
  }

  /**
   * 获取统计信息
   */
  getStats(): { total: number; installed: number } {
    const total = this.plugins.size;
    return { total, installed: total };
  }

  /**
   * 获取钩子统计信息
   */
  getHookStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [hookType, hooks] of this.hooks.entries()) {
      stats[hookType] = hooks.length;
    }
    return stats;
  }

  /**
   * 检查是否为生命周期插件
   */
  private isLifecyclePlugin(plugin: IEficyPlugin): boolean {
    const proto = Object.getPrototypeOf(plugin);
    const hooks = getLifecycleHooks(proto);
    return hooks.length > 0;
  }

  /**
   * 注册生命周期钩子
   */
  private registerLifecycleHooks(plugin: ILifecyclePlugin): void {
    const proto = Object.getPrototypeOf(plugin);
    const hooks = getLifecycleHooks(proto);

    hooks.forEach((hookInfo: any) => {
      const { hookType, methodName } = hookInfo;

      const method = plugin[methodName as keyof ILifecyclePlugin];
      if (typeof method === 'function') {
        if (!this.hooks.has(hookType)) {
          this.hooks.set(hookType, []);
        }

        this.hooks.get(hookType)!.push({
          plugin,
          handler: method.bind(plugin),
          enforce: plugin.enforce,
        });
      }
    });

    // 按enforce重新排序所有钩子
    this.sortAllHooks();
  }

  /**
   * 按enforce配置排序所有钩子
   */
  private sortAllHooks(): void {
    for (const [hookType, hooks] of this.hooks.entries()) {
      hooks.sort((a, b) => {
        // enforce排序：pre < undefined < post
        const enforceOrder = { pre: 0, undefined: 1, post: 2 };
        const aEnforce = enforceOrder[a.enforce || undefined];
        const bEnforce = enforceOrder[b.enforce || undefined];

        if (aEnforce !== bEnforce) {
          return aEnforce - bEnforce;
        }

        // 如果enforce相同，按插件名称排序保证稳定性
        return a.plugin.name.localeCompare(b.plugin.name);
      });
    }
  }
}

// 向后兼容的类型导出
export type { IRenderContext, IEficyPlugin as Plugin };
