import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnocssPlugin } from '../src/UnocssPlugin';
import { Eficy } from '@eficy/core';
import { createElement as reactCreateElement } from 'react';

describe('UnocssPlugin Integration', () => {
  let eficy: Eficy;
  let plugin: UnocssPlugin;
  let mockDocument: any;

  beforeEach(() => {
    // Mock complete DOM environment
    const mockStyle = {
      id: '',
      textContent: '',
      remove: vi.fn()
    };

    mockDocument = {
      createElement: vi.fn(() => mockStyle),
      head: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      },
      getElementById: vi.fn(() => null)
    };

    global.document = mockDocument;

    // Create fresh instances
    eficy = new Eficy();
    plugin = new UnocssPlugin();

    // Register plugin
    eficy.registerPlugin(plugin);
    eficy.enableLifecycleHooksFeature();
  });

  afterEach(() => {
    plugin.destroy();
    vi.clearAllMocks();
  });

  describe('Complete Workflow', () => {
    it('应该完整地处理简单 Schema 的 UnoCSS 样式', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'text-red-500 p-4 bg-blue-500',
            '#children': [
              {
                '#': 'title',
                '#view': 'h1',
                className: 'flex items-center justify-center',
                '#content': 'Hello World'
              }
            ]
          }
        ]
      };

      // Configure component map
      eficy.config({
        componentMap: {
          div: 'div',
          h1: 'h1'
        }
      });

      // Render schema
      const element = await eficy.createElement(schema);

      expect(element).toBeTruthy();

      // Verify CSS injection was called
      expect(mockDocument.createElement).toHaveBeenCalledWith('style');
      expect(mockDocument.head.appendChild).toHaveBeenCalled();

      // Verify generated CSS content
      const styleElement = mockDocument.createElement.mock.results[0].value;
      expect(styleElement.textContent).toContain('.text-red-500 { color: rgb(239 68 68); }');
      expect(styleElement.textContent).toContain('.p-4 { padding: 1rem; }');
      expect(styleElement.textContent).toContain('.bg-blue-500 { background-color: rgb(59 130 246); }');
      expect(styleElement.textContent).toContain('.flex { display: flex; }');
      expect(styleElement.textContent).toContain('.items-center { align-items: center; }');
      expect(styleElement.textContent).toContain('.justify-center { justify-content: center; }');
    });

    it('应该处理嵌套组件的 className 收集', async () => {
      const schema = {
        views: [
          {
            '#': 'container',
            '#view': 'div',
            className: 'text-red-500',
            '#children': [
              {
                '#': 'header',
                '#view': 'div',
                className: 'p-4',
                '#children': [
                  {
                    '#': 'title',
                    '#view': 'h1',
                    className: 'bg-blue-500'
                  }
                ]
              },
              {
                '#': 'content',
                '#view': 'div',
                className: 'flex items-center'
              }
            ]
          }
        ]
      };

      eficy.config({
        componentMap: {
          div: 'div',
          h1: 'h1'
        }
      });

      await eficy.createElement(schema);

      // Verify all classes were collected and CSS generated
      const styleElement = mockDocument.createElement.mock.results[0].value;
      expect(styleElement.textContent).toContain('.text-red-500');
      expect(styleElement.textContent).toContain('.p-4');
      expect(styleElement.textContent).toContain('.bg-blue-500');
      expect(styleElement.textContent).toContain('.flex');
      expect(styleElement.textContent).toContain('.items-center');
    });

    it('应该处理数组形式的 className', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: ['text-red-500', 'p-4', 'bg-blue-500']
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      await eficy.createElement(schema);

      const styleElement = mockDocument.createElement.mock.results[0].value;
      expect(styleElement.textContent).toContain('.text-red-500');
      expect(styleElement.textContent).toContain('.p-4');
      expect(styleElement.textContent).toContain('.bg-blue-500');
    });

    it('应该忽略空的或无效的 className', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: '',
            '#children': [
              {
                '#': 'child1',
                '#view': 'div',
                className: null
              },
              {
                '#': 'child2',
                '#view': 'div',
                className: undefined
              },
              {
                '#': 'child3',
                '#view': 'div',
                className: 'text-red-500'
              }
            ]
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      await eficy.createElement(schema);

      const styleElement = mockDocument.createElement.mock.results[0].value;
      expect(styleElement.textContent).toContain('.text-red-500');
      // Should not contain empty classes
      expect(styleElement.textContent).not.toContain('. {');
    });

    it('应该只在根节点渲染时注入样式一次', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'text-red-500'
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      // Render multiple times
      await eficy.createElement(schema);
      await eficy.createElement(schema);
      await eficy.createElement(schema);

      // Should only inject styles once
      expect(mockDocument.createElement).toHaveBeenCalledTimes(1);
      expect(mockDocument.head.appendChild).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('应该优雅地处理 UnoCSS 生成错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'invalid-unocss-class-that-should-not-exist-anywhere'
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      // Should not throw even with invalid classes
      const element = await eficy.createElement(schema);
      expect(element).toBeTruthy();

      consoleSpy.mockRestore();
    });

    it('应该在服务端渲染环境中工作', async () => {
      // Remove document to simulate SSR
      delete (global as any).document;

      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'text-red-500'
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      // Should not throw in SSR environment
      expect(async () => {
        await eficy.createElement(schema);
      }).not.toThrow();

      // Restore document
      global.document = mockDocument;
    });
  });

  describe('Plugin Configuration', () => {
    it('应该支持自定义 UnoCSS 配置', async () => {
      const customPlugin = new UnocssPlugin({
        config: {
          rules: [
            ['custom-rule', { color: 'red' }]
          ]
        }
      });

      eficy.unregisterPlugin('unocss-plugin');
      eficy.registerPlugin(customPlugin);

      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'custom-rule'
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      await eficy.createElement(schema);

      // Verify plugin was initialized with custom config
      expect(customPlugin.getGenerator()).toBeTruthy();
    });
  });
});