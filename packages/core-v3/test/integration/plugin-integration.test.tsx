/**
 * Plugin 集成测试 - 专注于渲染行为验证
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import 'reflect-metadata';
import { PluginManager, Render, type ILifecyclePlugin, type IRenderContext, type IEficyPlugin, Eficy } from '../../src';

describe('Plugin Integration - 渲染行为验证', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    const eficy = new Eficy();
    pluginManager = eficy.pluginManager;
  });

  describe('基础渲染场景', () => {
    it.only('应该能够通过插件修改组件', () => {
      class ThemePlugin implements ILifecyclePlugin {
        name = 'theme-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();

          // 返回包装后的组件
          return (props: any) => (
            <div className="theme-dark" style={{ backgroundColor: '#333', color: '#fff' }}>
              <OriginalComponent {...props} />
            </div>
          );
        }
      }

      pluginManager.register(ThemePlugin);

      // 测试组件
      const TestComponent = (props: any) => (
        <div data-testid="test-component" {...props}>
          Hello World
        </div>
      );

      const context: IRenderContext = {
        props: { className: 'original' },
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);

      // 验证返回的是修改后的组件
      expect(ModifiedComponent).not.toBe(TestComponent);
      expect(typeof ModifiedComponent).toBe('function');
    });

    it.only('应该按 enforce 顺序执行插件', () => {
      const executionOrder: string[] = [];

      class PrePlugin implements ILifecyclePlugin {
        name = 'pre-plugin';
        version = '1.0.0';
        enforce = 'pre' as const;

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          executionOrder.push('pre');
          const OriginalComponent = next();
          return (props: any) => (
            <div data-pre="true">
              <OriginalComponent {...props} />
            </div>
          );
        }
      }

      class NormalPlugin implements ILifecyclePlugin {
        name = 'normal-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          executionOrder.push('normal');
          const OriginalComponent = next();
          return (props: any) => (
            <div data-normal="true">
              <OriginalComponent {...props} />
            </div>
          );
        }
      }

      class PostPlugin implements ILifecyclePlugin {
        name = 'post-plugin';
        version = '1.0.0';
        enforce = 'post' as const;

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          executionOrder.push('post');
          const OriginalComponent = next();
          return (props: any) => (
            <div data-post="true">
              <OriginalComponent {...props} />
            </div>
          );
        }
      }

      // 乱序注册
      pluginManager.register(PostPlugin);
      pluginManager.register(NormalPlugin);
      pluginManager.register(PrePlugin);

      const context: IRenderContext = {
        props: {},
      };

      const TestComponent = () => <div>Content</div>;
      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);

      // 验证执行顺序
      expect(executionOrder).toEqual(['pre', 'normal', 'post']);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });
  });

  describe('条件渲染场景', () => {
    it.only('应该支持条件渲染插件', () => {
      class PermissionPlugin implements ILifecyclePlugin {
        name = 'permission-plugin';
        version = '1.0.0';
        hasPermission: boolean = true;

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          if (!this.hasPermission) {
            // 无权限时返回拒绝组件
            return () => <div className="access-denied">Access Denied</div>;
          }
          // 有权限时继续正常流程
          return next();
        }
      }

      // 测试有权限的情况
      pluginManager.register(PermissionPlugin);

      const TestComponent = () => <div>Original Content</div>;
      const context: IRenderContext = {
        props: {},
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).toBe(TestComponent); // 应该返回原组件

      // 测试无权限的情况
      pluginManager.dispose();
      const eficy = new Eficy();
      pluginManager = eficy.pluginManager;

      const plugin = pluginManager.register(PermissionPlugin);

      plugin.hasPermission = false;

      const DeniedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(DeniedComponent).not.toBe(TestComponent); // 应该返回不同的组件
    });
  });

  describe('样式修改场景', () => {
    it.only('应该能够通过插件修改组件样式', () => {
      class StylePlugin implements ILifecyclePlugin {
        name = 'style-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => (
            <OriginalComponent
              {...props}
              style={{
                ...props.style,
                backgroundColor: 'red',
                color: 'white',
                padding: '10px',
              }}
            />
          );
        }
      }

      pluginManager.register(StylePlugin);

      const TestComponent = (props: any) => <div {...props}>Content</div>;
      const context: IRenderContext = {
        props: { style: { fontSize: '16px' } },
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });

    it.only('应该支持多个样式插件的叠加', () => {
      class ColorPlugin implements ILifecyclePlugin {
        name = 'color-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => <OriginalComponent {...props} style={{ ...props.style, color: 'blue' }} />;
        }
      }

      class SizePlugin implements ILifecyclePlugin {
        name = 'size-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => <OriginalComponent {...props} style={{ ...props.style, fontSize: '18px' }} />;
        }
      }

      pluginManager.register(ColorPlugin);
      pluginManager.register(SizePlugin);

      const TestComponent = (props: any) => <div {...props}>Content</div>;
      const context: IRenderContext = {
        props: { style: { backgroundColor: 'white' } },
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });
  });

  describe('属性修改场景', () => {
    it.only('应该能够通过插件修改组件属性', () => {
      class AttributePlugin implements ILifecyclePlugin {
        name = 'attribute-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => (
            <OriginalComponent
              {...props}
              data-testid="modified-component"
              aria-label="Plugin modified component"
              disabled={true}
            />
          );
        }
      }

      pluginManager.register(AttributePlugin);

      const TestComponent = (props: any) => <div {...props}>Content</div>;
      const context: IRenderContext = {
        props: { className: 'original' },
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });

    it.only('应该支持事件处理器的修改', () => {
      const originalClick = vi.fn();
      const pluginClick = vi.fn();

      class EventPlugin implements ILifecyclePlugin {
        name = 'event-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => {
            const originalOnClick = props.onClick;
            return (
              <OriginalComponent
                {...props}
                onClick={(event: any) => {
                  pluginClick();
                  if (originalOnClick) {
                    originalOnClick(event);
                  }
                }}
              />
            );
          };
        }
      }

      pluginManager.register(EventPlugin);

      const TestComponent = (props: any) => <button {...props}>Click me</button>;
      const context: IRenderContext = {
        props: {},
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });
  });

  describe('内容修改场景', () => {
    it.only('应该能够通过插件修改组件内容', () => {
      class ContentPlugin implements ILifecyclePlugin {
        name = 'content-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => <OriginalComponent {...props}>Modified by plugin</OriginalComponent>;
        }
      }

      pluginManager.register(ContentPlugin);

      const TestComponent = (props: any) => <div {...props}>Original content</div>;
      const context: IRenderContext = {
        props: {},
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });

    it.only('应该支持复杂内容的修改', () => {
      class ComplexContentPlugin implements ILifecyclePlugin {
        name = 'complex-content-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => (
            <div className="wrapper">
              <span className="prefix">Prefix: </span>
              <OriginalComponent {...props} />
              <span className="suffix"> :Suffix</span>
            </div>
          );
        }
      }

      pluginManager.register(ComplexContentPlugin);

      const TestComponent = (props: any) => <div {...props}>Content</div>;
      const context: IRenderContext = {
        props: {},
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });
  });

  describe('错误处理场景', () => {
    it.only('应该处理插件错误而不影响渲染', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      class ErrorPlugin implements ILifecyclePlugin {
        name = 'error-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(): React.ComponentType<any> {
          throw new Error('Plugin error');
        }
      }

      class GoodPlugin implements ILifecyclePlugin {
        name = 'good-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => (
            <div data-good="true">
              <OriginalComponent {...props} />
            </div>
          );
        }
      }

      pluginManager.register(ErrorPlugin);
      pluginManager.register(GoodPlugin);

      const TestComponent = () => <div>Test</div>;
      const context: IRenderContext = {
        props: {},
      };

      // 错误插件不应该影响其他插件
      expect(() => {
        pluginManager.executeRenderHooks(TestComponent, context);
      }).not.toThrow();

      // 验证错误被记录
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('[PluginManager] Error in plugin "error-plugin"'),
        expect.any(Error),
      );

      consoleError.mockRestore();
    });
  });

  describe('插件组合场景', () => {
    it.only('应该支持多个插件的组合使用', () => {
      class ThemePlugin implements ILifecyclePlugin {
        name = 'theme-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => (
            <div className="theme-dark" style={{ backgroundColor: '#333' }}>
              <OriginalComponent {...props} />
            </div>
          );
        }
      }

      class SizePlugin implements ILifecyclePlugin {
        name = 'size-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => <OriginalComponent {...props} style={{ ...props.style, fontSize: '16px' }} />;
        }
      }

      class ContentPlugin implements ILifecyclePlugin {
        name = 'content-plugin';
        version = '1.0.0';

        @Render(0)
        onRender(context: IRenderContext, next: () => React.ComponentType<any>): React.ComponentType<any> {
          const OriginalComponent = next();
          return (props: any) => <OriginalComponent {...props}>Combined content</OriginalComponent>;
        }
      }

      pluginManager.register(ThemePlugin);
      pluginManager.register(SizePlugin);
      pluginManager.register(ContentPlugin);

      const TestComponent = (props: any) => <div {...props}>Original</div>;
      const context: IRenderContext = {
        props: {},
      };

      const ModifiedComponent = pluginManager.executeRenderHooks(TestComponent, context);
      expect(ModifiedComponent).not.toBe(TestComponent);
    });
  });
});
