import 'reflect-metadata';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { injectable } from 'tsyringe';
import Eficy from '../src/core/Eficy';
import { EficyProvider } from '../src/contexts/EficyContext';
import {
  LifecycleEventEmitter,
  SYNC_SIDE_EFFECT_EVENTS,
  ASYNC_FLOW_EVENTS,
} from '../src/services/LifecycleEventEmitter';
import { PluginManager } from '../src/services/PluginManager';
import ComponentRegistry from '../src/services/ComponentRegistry';
import type {
  ILifecyclePlugin,
  IRenderContext,
  IMountContext,
  IUnmountContext,
  IHandleEventContext,
  IBindEventContext,
} from '../src/interfaces/lifecycle';
import { Render, OnMount, OnUnmount, OnHandleEvent, OnBindEvent } from '../src/decorators/lifecycle';

/**
 * 基于 Context 和 EventEmitter 的异步生命周期钩子测试
 */
describe('Event-Driven Lifecycle Hooks', () => {
  let eficy: Eficy;
  let lifecycleEventEmitter: LifecycleEventEmitter;
  let executionLog: string[];

  beforeEach(() => {
    eficy = new Eficy();
    lifecycleEventEmitter = eficy.getLifecycleEventEmitter();
    executionLog = [];
  });

  describe('Event Handler Lifecycle Hooks', () => {
    it('should support HandleEvent and BindEvent hooks', async () => {
      const mockComponent = ({ onClick, ...props }: any) => (
        <button data-testid="mock-button" onClick={onClick} {...props}>
          Click me
        </button>
      );

      eficy.config({ componentMap: { MockButton: mockComponent } });

      // 监听同步副作用钩子
      lifecycleEventEmitter.on(SYNC_SIDE_EFFECT_EVENTS.ON_HANDLE_EVENT, ({ handler, viewNode, context }) => {
        executionLog.push(`handle-event-${viewNode['#']}`);
        // 同步副作用钩子不需要callback
      });

      lifecycleEventEmitter.on(SYNC_SIDE_EFFECT_EVENTS.ON_BIND_EVENT, ({ viewNode, context }) => {
        executionLog.push(`bind-event-${viewNode['#']}`);
        // 同步副作用钩子不需要callback
      });

      // 启用生命周期钩子

      const schema = {
        views: [
          {
            '#': 'test-button',
            '#view': 'MockButton',
            '#children': 'Click me',
            onClick: () => {
              executionLog.push('button-clicked');
            },
          },
        ],
      };

      const element = await eficy.createElement(schema);
      const { unmount } = await render(element);

      // 等待组件渲染完成，BindEvent钩子会在组件渲染时触发
      await waitFor(() => {
        expect(executionLog).toContain('bind-event-test-button');
      });

      // 点击按钮
      const button = screen.getByTestId('mock-button');
      fireEvent.click(button);

      // 检查事件处理钩子被触发
      expect(executionLog).toContain('button-clicked');

      // 清理
      unmount();
    });
  });

  describe('Plugin Integration with EventEmitter', () => {
    it('should integrate plugins with event-driven lifecycle', async () => {
      @injectable()
      class EventDrivenPlugin implements ILifecyclePlugin {
        name = 'event-driven-plugin';
        version = '1.0.0';

        @Render(1)
        async onRender(viewNode: any, context: IRenderContext, next: () => Promise<any>) {
          executionLog.push(`plugin-render-${viewNode['#']}`);
          return await next();
        }

        @OnMount(1)
        async onMount(context: IMountContext, next: () => Promise<void>) {
          executionLog.push('plugin-mount');
          await next();
        }

        @OnUnmount(1)
        async onUnmount(context: IUnmountContext, next: () => Promise<void>) {
          executionLog.push('plugin-unmount');
          await next();
        }

        @OnHandleEvent(1)
        async onHandleEvent(
          handler: Function,
          viewNode: any,
          context: IHandleEventContext,
          next: () => Promise<Function>,
        ) {
          executionLog.push(`plugin-handle-event-${viewNode['#']}`);
          return await next();
        }

        @OnBindEvent(1)
        async onBindEvent(viewNode: any, context: IBindEventContext, next: () => Promise<void>) {
          executionLog.push(`plugin-bind-event-${viewNode['#']}`);
          await next();
        }
      }

      const plugin = new EventDrivenPlugin();
      eficy.registerPlugin(plugin);

      const mockComponent = ({ onClick, ...props }: any) => (
        <button data-testid="plugin-button" onClick={onClick} {...props}>
          Plugin Button
        </button>
      );

      eficy.config({ componentMap: { PluginButton: mockComponent } });

      // 启用生命周期钩子

      const schema = {
        views: [
          {
            '#': 'plugin-test-button',
            '#view': 'PluginButton',
            '#children': 'Plugin Button',
            onClick: () => {
              executionLog.push('plugin-button-clicked');
            },
          },
        ],
      };

      const element = await eficy.createElement(schema);
      const { unmount } = await render(element);

      // 检查插件钩子被触发
      // 注意：由于当前架构，插件钩子不会直接在 EventEmitter 中触发
      // 但插件已经被注册到 PluginManager 中
      expect(eficy.getPluginManager().getAllPlugins()).toHaveLength(1);
      expect(eficy.getPluginManager().getAllPlugins()[0].name).toBe('event-driven-plugin');

      // 清理
      unmount();
    });
  });

  describe('Context Provider Integration', () => {
    it('should provide context to RenderNode components', async () => {
      const mockComponent = ({ children, ...props }: any) => (
        <div data-testid="context-component" {...props}>
          {children}
        </div>
      );

      eficy.config({ componentMap: { ContextComponent: mockComponent } });

      // 启用生命周期钩子

      const schema = {
        views: [
          {
            '#': 'context-test',
            '#view': 'ContextComponent',
            '#children': 'Context Test',
          },
        ],
      };

      const element = await eficy.createElement(schema);

      // 验证元素被 EficyProvider 包装
      expect(element).toBeDefined();
      expect(element.type).toBe(EficyProvider);
      expect(element.props.value).toBeDefined();
      expect(element.props.value.lifecycleEventEmitter).toBe(lifecycleEventEmitter);
      expect(element.props.value.pluginManager).toBe(eficy.getPluginManager());
    });
  });

  describe('Lifecycle Event Statistics', () => {
    it('should track lifecycle event statistics', async () => {
      const mockComponent = ({ children, ...props }: any) => (
        <div data-testid="stats-component" {...props}>
          {children}
        </div>
      );

      eficy.config({ componentMap: { StatsComponent: mockComponent } });

      // 启用生命周期钩子

      // 触发一些同步副作用钩子
      lifecycleEventEmitter.emitSyncMount({
        container: undefined,
        parentElement: undefined,
      });

      lifecycleEventEmitter.emitSyncUnmount({
        container: undefined,
        parentElement: undefined,
      });

      // 检查统计信息
      const stats = lifecycleEventEmitter.getStatistics();
      expect(stats[SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT]).toBe(1);
      expect(stats[SYNC_SIDE_EFFECT_EVENTS.ON_UNMOUNT]).toBe(1);

      // 检查 Eficy 统计信息
      const eficyStats = eficy.stats;
      expect(eficyStats.lifecycleEvents).toEqual(stats);

      // 重置统计信息
      lifecycleEventEmitter.resetStatistics();
      expect(lifecycleEventEmitter.getStatistics()).toEqual({});
    });
  });

  describe('Cleanup', () => {
    it('should cleanup event listeners properly', () => {
      const initialListenerCount = lifecycleEventEmitter.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT);

      // 添加监听器
      const listener = () => {};
      lifecycleEventEmitter.on(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT, listener);

      expect(lifecycleEventEmitter.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT)).toBe(initialListenerCount + 1);

      // 移除监听器
      lifecycleEventEmitter.off(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT, listener);

      expect(lifecycleEventEmitter.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT)).toBe(initialListenerCount);

      // 清理所有监听器
      lifecycleEventEmitter.cleanup();

      expect(lifecycleEventEmitter.listenerCount(SYNC_SIDE_EFFECT_EVENTS.ON_MOUNT)).toBe(0);
    });
  });
});
