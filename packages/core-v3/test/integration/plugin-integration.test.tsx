/**
 * Plugin 集成测试 - 专注于渲染行为验证
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import 'reflect-metadata';
import { 
  PluginManager,
  Render,
  type ILifecyclePlugin,
  type IRenderContext,
  type IEficyPlugin
} from '../../src';

describe('Plugin Integration - 渲染行为验证', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  describe('基础渲染场景', () => {
    it('应该能够通过插件修改渲染上下文', () => {
      class ThemePlugin implements ILifecyclePlugin {
        name = 'theme-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          // 修改 props，添加主题样式
          context.props = {
            ...context.props,
            className: 'theme-dark',
            style: { backgroundColor: '#333', color: '#fff' }
          };
          next();
        }
      }

      pluginManager.register(new ThemePlugin());

      // 测试组件
      const TestComponent = (props: any) => (
        <div data-testid="test-component" {...props}>
          Hello World
        </div>
      );

      // 模拟渲染过程
      const context: IRenderContext = {
        props: { className: 'original' }
      };

      pluginManager.executeRenderHooks(context);

      // 验证上下文被修改
      expect(context.props.className).toBe('theme-dark');
      expect(context.props.style).toEqual({ backgroundColor: '#333', color: '#fff' });
    });

    it('应该按 enforce 顺序执行插件', () => {
      const executionOrder: string[] = [];

      class PrePlugin implements ILifecyclePlugin {
        name = 'pre-plugin';
        version = '1.0.0';
        enforce = 'pre' as const;

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('pre');
          context.props = { ...context.props, pre: true };
          next();
        }
      }

      class NormalPlugin implements ILifecyclePlugin {
        name = 'normal-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('normal');
          context.props = { ...context.props, normal: true };
          next();
        }
      }

      class PostPlugin implements ILifecyclePlugin {
        name = 'post-plugin';
        version = '1.0.0';
        enforce = 'post' as const;

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          executionOrder.push('post');
          context.props = { ...context.props, post: true };
          next();
        }
      }

      // 乱序注册
      pluginManager.register(new PostPlugin());
      pluginManager.register(new NormalPlugin());
      pluginManager.register(new PrePlugin());

      const context: IRenderContext = {
        props: {}
      };

      pluginManager.executeRenderHooks(context);

      // 验证执行顺序
      expect(executionOrder).toEqual(['pre', 'normal', 'post']);
      // 验证所有插件都修改了 props
      expect(context.props).toEqual({ pre: true, normal: true, post: true });
    });
  });

  describe('条件渲染场景', () => {
    it('应该支持条件渲染插件', () => {
      class PermissionPlugin implements ILifecyclePlugin {
        name = 'permission-plugin';
        version = '1.0.0';
        private hasPermission: boolean;

        constructor(hasPermission: boolean = true) {
          this.hasPermission = hasPermission;
        }

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          if (!this.hasPermission) {
            // 无权限时修改 props 显示拒绝信息
            context.props = {
              ...context.props,
              className: 'access-denied',
              children: 'Access Denied'
            };
            return; // 不调用 next()
          }
          // 有权限时继续正常流程
          context.props = { ...context.props, authorized: true };
          next();
        }
      }

      // 测试有权限的情况
      const allowedPlugin = new PermissionPlugin(true);
      pluginManager.register(allowedPlugin);

      const context: IRenderContext = {
        props: { children: 'Original Content' }
      };

      pluginManager.executeRenderHooks(context);
      expect(context.props.authorized).toBe(true);
      expect(context.props.children).toBe('Original Content');

      // 测试无权限的情况
      pluginManager.dispose();
      pluginManager = new PluginManager();
      
      const deniedPlugin = new PermissionPlugin(false);
      pluginManager.register(deniedPlugin);

      const deniedContext: IRenderContext = {
        props: { children: 'Original Content' }
      };

      pluginManager.executeRenderHooks(deniedContext);
      expect(deniedContext.props.className).toBe('access-denied');
      expect(deniedContext.props.children).toBe('Access Denied');
    });
  });

  describe('样式修改场景', () => {
    it('应该能够通过插件修改组件样式', () => {
      class StylePlugin implements ILifecyclePlugin {
        name = 'style-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = {
            ...context.props,
            style: {
              ...context.props.style,
              backgroundColor: 'red',
              color: 'white',
              padding: '10px'
            }
          };
          next();
        }
      }

      pluginManager.register(new StylePlugin());

      const context: IRenderContext = {
        props: { style: { fontSize: '16px' } }
      };

      pluginManager.executeRenderHooks(context);

      expect(context.props.style).toEqual({
        fontSize: '16px',
        backgroundColor: 'red',
        color: 'white',
        padding: '10px'
      });
    });

    it('应该支持多个样式插件的叠加', () => {
      class ColorPlugin implements ILifecyclePlugin {
        name = 'color-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = {
            ...context.props,
            style: { ...context.props.style, color: 'blue' }
          };
          next();
        }
      }

      class SizePlugin implements ILifecyclePlugin {
        name = 'size-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = {
            ...context.props,
            style: { ...context.props.style, fontSize: '18px' }
          };
          next();
        }
      }

      pluginManager.register(new ColorPlugin());
      pluginManager.register(new SizePlugin());

      const context: IRenderContext = {
        props: { style: { backgroundColor: 'white' } }
      };

      pluginManager.executeRenderHooks(context);

      expect(context.props.style).toEqual({
        backgroundColor: 'white',
        color: 'blue',
        fontSize: '18px'
      });
    });
  });

  describe('属性修改场景', () => {
    it('应该能够通过插件修改组件属性', () => {
      class AttributePlugin implements ILifecyclePlugin {
        name = 'attribute-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = {
            ...context.props,
            'data-testid': 'modified-component',
            'aria-label': 'Plugin modified component',
            disabled: true
          };
          next();
        }
      }

      pluginManager.register(new AttributePlugin());

      const context: IRenderContext = {
        props: { className: 'original' }
      };

      pluginManager.executeRenderHooks(context);

      expect(context.props['data-testid']).toBe('modified-component');
      expect(context.props['aria-label']).toBe('Plugin modified component');
      expect(context.props.disabled).toBe(true);
      expect(context.props.className).toBe('original');
    });

    it('应该支持事件处理器的修改', () => {
      const originalClick = vi.fn();
      const pluginClick = vi.fn();

      class EventPlugin implements ILifecyclePlugin {
        name = 'event-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          const originalOnClick = context.props.onClick;
          context.props = {
            ...context.props,
            onClick: (event: any) => {
              pluginClick();
              if (originalOnClick) {
                originalOnClick(event);
              }
            }
          };
          next();
        }
      }

      pluginManager.register(new EventPlugin());

      const context: IRenderContext = {
        props: { onClick: originalClick }
      };

      pluginManager.executeRenderHooks(context);

      // 验证事件处理器被包装
      expect(context.props.onClick).toBeDefined();
      expect(typeof context.props.onClick).toBe('function');

      // 模拟点击事件
      context.props.onClick({});
      expect(pluginClick).toHaveBeenCalled();
      expect(originalClick).toHaveBeenCalled();
    });
  });

  describe('内容修改场景', () => {
    it('应该能够通过插件修改组件内容', () => {
      class ContentPlugin implements ILifecyclePlugin {
        name = 'content-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = {
            ...context.props,
            children: 'Modified by plugin'
          };
          next();
        }
      }

      pluginManager.register(new ContentPlugin());

      const context: IRenderContext = {
        props: { children: 'Original content' }
      };

      pluginManager.executeRenderHooks(context);

      expect(context.props.children).toBe('Modified by plugin');
    });

    it('应该支持复杂内容的修改', () => {
      class ComplexContentPlugin implements ILifecyclePlugin {
        name = 'complex-content-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          const originalChildren = context.props.children;
          context.props = {
            ...context.props,
            children: (
              <div className="wrapper">
                <span className="prefix">Prefix: </span>
                {originalChildren}
                <span className="suffix"> :Suffix</span>
              </div>
            )
          };
          next();
        }
      }

      pluginManager.register(new ComplexContentPlugin());

      const context: IRenderContext = {
        props: { children: 'Content' }
      };

      pluginManager.executeRenderHooks(context);

      expect(context.props.children).toBeDefined();
      expect(context.props.children.type).toBe('div');
      expect(context.props.children.props.className).toBe('wrapper');
    });
  });

  describe('错误处理场景', () => {
    it('应该处理插件错误而不影响渲染', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      class ErrorPlugin implements ILifecyclePlugin {
        name = 'error-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(): void {
          throw new Error('Plugin error');
        }
      }

      class GoodPlugin implements ILifecyclePlugin {
        name = 'good-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = { ...context.props, good: true };
          next();
        }
      }

      pluginManager.register(new ErrorPlugin());
      pluginManager.register(new GoodPlugin());

      const context: IRenderContext = {
        props: {}
      };

      // 错误插件不应该影响其他插件
      expect(() => {
        pluginManager.executeRenderHooks(context);
      }).not.toThrow();

      // 验证错误被记录
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('[PluginManager] Error in plugin "error-plugin"'),
        expect.any(Error)
      );

      // 验证好的插件仍然执行
      expect(context.props.good).toBe(true);

      consoleError.mockRestore();
    });
  });

  describe('插件组合场景', () => {
    it('应该支持多个插件的组合使用', () => {
      class ThemePlugin implements ILifecyclePlugin {
        name = 'theme-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = {
            ...context.props,
            className: 'theme-dark',
            style: { backgroundColor: '#333' }
          };
          next();
        }
      }

      class SizePlugin implements ILifecyclePlugin {
        name = 'size-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = {
            ...context.props,
            style: { ...context.props.style, fontSize: '16px' }
          };
          next();
        }
      }

      class ContentPlugin implements ILifecyclePlugin {
        name = 'content-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => void): void {
          context.props = {
            ...context.props,
            children: 'Combined content'
          };
          next();
        }
      }

      pluginManager.register(new ThemePlugin());
      pluginManager.register(new SizePlugin());
      pluginManager.register(new ContentPlugin());

      const context: IRenderContext = {
        props: {}
      };

      pluginManager.executeRenderHooks(context);

      // 验证所有插件的效果都被应用
      expect(context.props.className).toBe('theme-dark');
      expect(context.props.style).toEqual({
        backgroundColor: '#333',
        fontSize: '16px'
      });
      expect(context.props.children).toBe('Combined content');
    });
  });
});