import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { UnocssPlugin } from '../src/UnocssPlugin';
import { Eficy } from '@eficy/core';
import React from 'react';

describe('UnocssPlugin Integration', () => {
  let eficy: Eficy;
  let plugin: UnocssPlugin;
  let mockDocument: any;

  beforeEach(async () => {
    // Create fresh instances
    eficy = new Eficy();
    plugin = new UnocssPlugin();

    // Initialize plugin
    const next = vi.fn().mockResolvedValue(undefined);
    await plugin.onInit({} as any, next);

    // Register plugin
    eficy.registerPlugin(plugin);
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
            '#content': 'Hello UnoCSS'
          }
        ]
      };

      // Configure component map
      eficy.config({
        componentMap: {
          div: 'div'
        }
      });

      // 渲染 Schema
      const element = await eficy.createElement(schema);
      const { container } = render(element);

      // 验证样式标签存在
      const styleElement = container.querySelector('style');
      expect(styleElement).toBeTruthy();
      
      // 验证生成的 CSS 内容
      const cssContent = styleElement?.innerHTML || '';
      expect(cssContent).toContain('text-red-500');
      expect(cssContent).toContain('p-4'); 
      expect(cssContent).toContain('bg-blue-500');

      // 验证原始内容仍然存在
      expect(container.textContent).toContain('Hello UnoCSS');
    });

    it('应该处理嵌套组件的 className 收集', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
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
                    className: 'bg-blue-500',
                    '#content': 'Title'
                  }
                ]
              },
              {
                '#': 'content',
                '#view': 'div',
                className: 'flex items-center',
                '#content': 'Content'
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

      const element = await eficy.createElement(schema);
      const { container } = render(element);

      // 验证样式标签存在
      const styleElement = container.querySelector('style');
      expect(styleElement).toBeTruthy();
      
      // 验证所有类名的样式都生成了
      const cssContent = styleElement?.innerHTML || '';
      expect(cssContent).toContain('text-red-500');
      expect(cssContent).toContain('p-4');
      expect(cssContent).toContain('bg-blue-500');
      expect(cssContent).toContain('flex');
      expect(cssContent).toContain('items-center');
    });

    it('应该处理数组形式的 className', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: ['text-red-500', 'p-4', 'bg-blue-500'],
            '#content': 'Array className test'
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      const element = await eficy.createElement(schema);
      const { container } = render(element);

      const styleElement = container.querySelector('style');
      expect(styleElement).toBeTruthy();
      
      const cssContent = styleElement?.innerHTML || '';
      expect(cssContent).toContain('text-red-500');
      expect(cssContent).toContain('p-4');
      expect(cssContent).toContain('bg-blue-500');
    });

    it('应该忽略空的或无效的 className', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'text-red-500 valid-class',
            '#children': [
              {
                '#': 'child1',
                '#view': 'div',
                className: '',
                '#content': 'Empty'
              },
              {
                '#': 'child2', 
                '#view': 'div',
                className: null,
                '#content': 'Null'
              }
            ]
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      const element = await eficy.createElement(schema);
      const { container } = render(element);

      const styleElement = container.querySelector('style');
      expect(styleElement).toBeTruthy();
      
      // 只有有效的类名应该生成样式
      const cssContent = styleElement?.innerHTML || '';
      expect(cssContent).toContain('text-red-500');
    });

    it('应该只在根节点渲染时注入样式一次', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'text-red-500',
            '#content': 'Test'
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      // 多次渲染
      const element1 = await eficy.createElement(schema);
      const element2 = await eficy.createElement(schema);
      
      const { container: container1 } = render(element1);
      const { container: container2 } = render(element2);

      // 每次都应该有样式标签（因为是不同的渲染结果）
      expect(container1.querySelector('style')).toBeTruthy();
      expect(container2.querySelector('style')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('应该优雅地处理 UnoCSS 生成错误', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'some-unknown-class',
            '#content': 'Error test'
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      // Should not throw even with unknown classes
      const element = await eficy.createElement(schema);
      const { container } = render(element);
      
      expect(element).toBeTruthy();
      expect(container.textContent).toContain('Error test');
    });

    it('应该在服务端渲染环境中工作', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'text-red-500',
            '#content': 'SSR test'
          }
        ]
      };

      eficy.config({
        componentMap: { div: 'div' }
      });

      // Should work without browser APIs
      const element = await eficy.createElement(schema);
      expect(element).toBeTruthy();
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

      // 初始化插件
      const next = vi.fn().mockResolvedValue(undefined);
      await customPlugin.onInit({} as any, next);

      // 验证插件被正确初始化
      expect(customPlugin.getGenerator()).toBeTruthy();
      expect(next).toHaveBeenCalled();
    });
  });
});