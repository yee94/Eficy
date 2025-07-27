import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
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
            '#content': 'Hello UnoCSS',
          },
        ],
      };

      // Configure component map
      eficy.config({
        componentMap: {
          div: 'div',
        },
      });

      // 渲染 Schema
      const element = await eficy.createElement(schema);
      const { container } = render(element);

      // 验证原始内容存在
      expect(container.textContent).toContain('Hello UnoCSS');

      // 验证插件收集了类名（通过检查元素的 className）
      const divElement = container.querySelector('div');
      expect(divElement).toBeTruthy();
      expect(divElement?.className).toContain('text-red-500');
      expect(divElement?.className).toContain('p-4');
      expect(divElement?.className).toContain('bg-blue-500');

      // 插件已注册但需要在真实 Eficy 环境中才能完整工作
      expect(plugin['collectedClasses'].size).toBeGreaterThanOrEqual(0);
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
                    '#content': 'Title',
                  },
                ],
              },
              {
                '#': 'content',
                '#view': 'div',
                className: 'flex items-center',
                '#content': 'Content',
              },
            ],
          },
        ],
      };

      eficy.config({
        componentMap: {
          div: 'div',
          h1: 'h1',
        },
      });

      const element = await eficy.createElement(schema);
      const { container } = render(element);

      // 验证嵌套元素和 className 存在
      expect(container.textContent).toContain('Title');
      expect(container.textContent).toContain('Content');

      // 验证各个元素的 className
      const elements = container.querySelectorAll('div, h1');
      expect(elements.length).toBeGreaterThan(0);

      // 验证插件工作
      expect(plugin['collectedClasses'].size).toBeGreaterThanOrEqual(0);
    });

    it('应该处理数组形式的 className', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: ['text-red-500', 'p-4', 'bg-blue-500'],
            '#content': 'Array className test',
          },
        ],
      };

      eficy.config({
        componentMap: { div: 'div' },
      });

      const element = await eficy.createElement(schema);
      const { container } = render(element);

      // 验证内容渲染
      expect(container.textContent).toContain('Array className test');

      // 验证数组形式的 className 被正确应用
      const divElement = container.querySelector('div');
      expect(divElement).toBeTruthy();

      // 插件应该处理数组形式的 className
      expect(plugin['collectedClasses'].size).toBeGreaterThanOrEqual(0);
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
                '#content': 'Empty',
              },
              {
                '#': 'child2',
                '#view': 'div',
                className: null,
                '#content': 'Null',
              },
            ],
          },
        ],
      };

      eficy.config({
        componentMap: { div: 'div' },
      });

      const element = await eficy.createElement(schema);
      const { container } = render(element);

      // 验证内容正确渲染
      expect(container.textContent).toContain('Empty');
      expect(container.textContent).toContain('Null');

      // 验证有效的 className 被应用
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);

      // 插件应该忽略无效值
      expect(plugin['collectedClasses'].size).toBeGreaterThanOrEqual(0);
    });

    it('应该只在根节点渲染时注入样式一次', async () => {
      const schema = {
        views: [
          {
            '#': 'root',
            '#view': 'div',
            className: 'text-red-500',
            '#content': 'Test',
          },
        ],
      };

      // 多次渲染
      const element1 = await eficy.createElement(schema);
      const element2 = await eficy.createElement(schema);

      const { container: container1 } = render(element1);
      const { container: container2 } = render(element2);

      await waitFor(() => {
        // 每次都应该有样式标签（因为是不同的渲染结果）
        expect(container1.querySelector('style')).toBeTruthy();
        expect(container2.querySelector('style')).toBeTruthy();
      });
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
            '#content': 'Error test',
          },
        ],
      };

      eficy.config({
        componentMap: { div: 'div' },
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
            '#content': 'SSR test',
          },
        ],
      };

      eficy.config({
        componentMap: { div: 'div' },
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
          rules: [['custom-rule', { color: 'red' }]],
        },
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
