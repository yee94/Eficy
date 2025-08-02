/**
 * PluginManager 测试 - 简化版本
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

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  describe('基础功能', () => {
    it('应该能够注册和获取插件', () => {
      const plugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);
      expect(manager.getPlugin('test-plugin')).toBe(plugin);
      expect(manager.isInstalled('test-plugin')).toBe(true);
    });

    it('应该能够卸载插件', () => {
      const plugin: IEficyPlugin = {
        name: 'test-plugin',
        version: '1.0.0'
      };

      manager.register(plugin);
      manager.unregister('test-plugin');

      expect(manager.getPlugin('test-plugin')).toBeUndefined();
      expect(manager.isInstalled('test-plugin')).toBe(false);
    });
  });

  describe('渲染钩子', () => {
    it('应该执行渲染钩子', () => {
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => React.createElement('div', { 'data-testid': 'plugin-wrapper' },
            React.createElement(OriginalComponent, props)
          );
        }
      }

      manager.register(new TestPlugin());

      const TestComponent = () => React.createElement('div', null, 'Content');
      const context: IRenderContext = { props: {} };

      const ModifiedComponent = manager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });

    it('应该按 enforce 顺序执行插件', () => {
      const executionOrder: string[] = [];

      class PrePlugin implements ILifecyclePlugin {
        name = 'pre-plugin';
        version = '1.0.0';
        enforce = 'pre' as const;

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          executionOrder.push('pre');
          return next();
        }
      }

      class PostPlugin implements ILifecyclePlugin {
        name = 'post-plugin';
        version = '1.0.0';
        enforce = 'post' as const;

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          executionOrder.push('post');
          return next();
        }
      }

      manager.register(new PostPlugin());
      manager.register(new PrePlugin());

      const TestComponent = () => React.createElement('div', null, 'Content');
      const context: IRenderContext = { props: {} };

      manager.executeRenderHooks(TestComponent, context);
      expect(executionOrder).toEqual(['pre', 'post']);
    });
  });

  describe('错误处理', () => {
    it('应该处理插件错误', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      class ErrorPlugin implements ILifecyclePlugin {
        name = 'error-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(): React.ComponentType<any> {
          throw new Error('Plugin error');
        }
      }

      manager.register(new ErrorPlugin());

      const TestComponent = () => React.createElement('div', null, 'Content');
      const context: IRenderContext = { props: {} };

      expect(() => {
        manager.executeRenderHooks(TestComponent, context);
      }).not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('查询方法', () => {
    it('应该返回所有插件', () => {
      const plugin1: IEficyPlugin = { name: 'plugin1', version: '1.0.0' };
      const plugin2: IEficyPlugin = { name: 'plugin2', version: '1.0.0' };

      manager.register(plugin1);
      manager.register(plugin2);

      const plugins = manager.getAllPlugins();
      expect(plugins).toHaveLength(2);
    });

    it('应该返回钩子统计', () => {
      class TestPlugin implements ILifecyclePlugin {
        name = 'test-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          return next();
        }
      }

      manager.register(new TestPlugin());
      const hookStats = manager.getHookStats();
      expect(hookStats.render).toBe(1);
    });
  });

  describe('清理', () => {
    it('应该能够清理所有插件', () => {
      const plugin: IEficyPlugin = { name: 'test-plugin', version: '1.0.0' };
      manager.register(plugin);

      manager.dispose();
      expect(manager.getAllPlugins()).toHaveLength(0);
    });
  });
});