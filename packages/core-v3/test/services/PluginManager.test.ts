/**
 * PluginManager 测试 - 支持装饰器版本
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import 'reflect-metadata';
import { 
  PluginManager, 
  type IRenderContext,
  type IEficyPlugin,
  type ILifecyclePlugin,
  Render,
  HookType
} from '../../src';

describe('PluginManager - 支持装饰器版本', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe('基础插件功能', () => {
    it('应该能够注册基础插件', () => {
      const plugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);

      expect(manager.getPlugin('test-plugin')).toBe(plugin);
      expect(manager.isInstalled('test-plugin')).toBe(true);
    });

    it('重复注册应该覆盖并警告', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const plugin1: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      const plugin2: IEficyPlugin = {
        name: 'test-plugin',
        version: '2.0.0'
      };

      manager.register(plugin1);
      manager.register(plugin2);

      expect(manager.getPlugin('test-plugin')).toBe(plugin2);
      expect(consoleWarn).toHaveBeenCalledWith(
        '[PluginManager] Plugin "test-plugin" already registered, overwriting'
      );

      consoleWarn.mockRestore();
      consoleLog.mockRestore();
    });

    it('应该能够卸载插件', () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

      const plugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);
      expect(manager.isInstalled('test-plugin')).toBe(true);

      manager.unregister('test-plugin');

      expect(manager.getPlugin('test-plugin')).toBeUndefined();
      expect(manager.isInstalled('test-plugin')).toBe(false);
      expect(consoleLog).toHaveBeenCalledWith(
        '[PluginManager] Plugin "test-plugin" unregistered successfully'
      );

      consoleLog.mockRestore();
    });

    it('卸载不存在的插件应该警告', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.unregister('nonexistent');

      expect(consoleWarn).toHaveBeenCalledWith(
        '[PluginManager] Plugin "nonexistent" not found'
      );

      consoleWarn.mockRestore();
    });
  });

  describe('渲染钩子功能', () => {
    it('应该执行渲染钩子', () => {
      const executionOrder: string[] = [];

      class Plugin1 implements ILifecyclePlugin {
        name = 'plugin1';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('plugin1');
          next();
        }
      }

      class Plugin2 implements ILifecyclePlugin {
        name = 'plugin2';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('plugin2');
          next();
        }
      }

      manager.register(new Plugin1());
      manager.register(new Plugin2());

      const context: IRenderContext = {
        props: {}
      };

      manager.executeRenderHooks(context);

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('应该按 enforce 配置排序执行', () => {
      const executionOrder: string[] = [];

      class PrePlugin implements ILifecyclePlugin {
        name = 'pre-plugin';
        version = '1.0.0';
        enforce = 'pre' as const;

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('pre-plugin');
          next();
        }
      }

      class NormalPlugin implements ILifecyclePlugin {
        name = 'normal-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('normal-plugin');
          next();
        }
      }

      class PostPlugin implements ILifecyclePlugin {
        name = 'post-plugin';
        version = '1.0.0';
        enforce = 'post' as const;

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('post-plugin');
          next();
        }
      }

      // 故意乱序注册
      manager.register(new PostPlugin());
      manager.register(new NormalPlugin());
      manager.register(new PrePlugin());

      const context: IRenderContext = {
        props: {}
      };

      manager.executeRenderHooks(context);

      // 应该按 enforce 排序：pre < normal < post
      expect(executionOrder).toEqual(['pre-plugin', 'normal-plugin', 'post-plugin']);
    });

    it('应该处理插件中的错误', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      class ErrorPlugin implements ILifecyclePlugin {
        name = 'error-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(): void {
          throw new Error('Render error');
        }
      }

      class GoodPlugin implements ILifecyclePlugin {
        name = 'good-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          next();
        }
      }

      manager.register(new ErrorPlugin());
      manager.register(new GoodPlugin());

      const context: IRenderContext = {
        props: {}
      };

      // 错误插件不应该影响其他插件的执行
      expect(() => {
        manager.executeRenderHooks(context);
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('应该支持非装饰器插件', () => {
      const executionOrder: string[] = [];

      class DecoratorPlugin implements ILifecyclePlugin {
        name = 'decorator-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('decorator');
          next();
        }
      }

      const plainPlugin: IEficyPlugin = {
        name: 'plain-plugin',
        version: '1.0.0',
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('plain');
          next();
        }
      };

      manager.register(new DecoratorPlugin());
      manager.register(plainPlugin);

      const context: IRenderContext = {
        props: {}
      };

      manager.executeRenderHooks(context);

      expect(executionOrder).toEqual(['decorator', 'plain']);
    });
  });

  describe('查询方法', () => {
    it('应该返回所有已注册的插件', () => {
      const plugin1: IEficyPlugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: IEficyPlugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);

      const plugins = manager.getAllPlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(plugin1);
      expect(plugins).toContain(plugin2);
    });

    it('应该返回所有已安装的插件名称', () => {
      const plugin1: IEficyPlugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: IEficyPlugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);

      const names = manager.getInstalledPlugins();
      expect(names).toHaveLength(2);
      expect(names).toContain('plugin1');
      expect(names).toContain('plugin2');
    });

    it('应该返回正确的统计信息', () => {
      const plugin1: IEficyPlugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: IEficyPlugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);

      const stats = manager.getStats();
      expect(stats.total).toBe(2);
      expect(stats.installed).toBe(2);
    });

    it('应该返回钩子统计信息', () => {
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          next();
        }
      }

      manager.register(new TestPlugin());

      const hookStats = manager.getHookStats();
      expect(hookStats.render).toBe(1);
    });

    it('应该返回插件执行顺序', () => {
      class PrePlugin implements ILifecyclePlugin {
        name = 'pre-plugin';
        version = '1.0.0';
        enforce = 'pre' as const;

        @Render(0)
        onRender() {}
      }

      class PostPlugin implements ILifecyclePlugin {
        name = 'post-plugin';
        version = '1.0.0';
        enforce = 'post' as const;

        @Render(0)
        onRender() {}
      }

      manager.register(new PostPlugin());
      manager.register(new PrePlugin());

      const executionOrder = manager.getExecutionOrder();
      expect(executionOrder).toHaveLength(2);
      expect(executionOrder[0].name).toBe('pre-plugin');
      expect(executionOrder[0].enforce).toBe('pre');
      expect(executionOrder[1].name).toBe('post-plugin');
      expect(executionOrder[1].enforce).toBe('post');
    });
  });

  describe('清理', () => {
    it('应该能够清理所有插件', () => {
      const plugin1: IEficyPlugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: IEficyPlugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);

      expect(manager.getAllPlugins()).toHaveLength(2);

      manager.dispose();

      expect(manager.getAllPlugins()).toHaveLength(0);
      expect(manager.getHookStats().render).toBe(0);
    });
  });

  describe('向后兼容', () => {
    it('应该支持 executeHook 方法', () => {
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          next();
        }
      }

      manager.register(new TestPlugin());

      const context: IRenderContext = { props: {} };
      const result = manager.executeHook(HookType.RENDER, context, () => 'test');

      expect(result).toBe('test');
    });
  });
});