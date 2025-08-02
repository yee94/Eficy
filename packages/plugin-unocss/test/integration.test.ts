import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnocssPlugin } from '../src/UnocssPlugin';
import { Eficy } from '../../core-v3/src';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('UnocssPlugin Integration', () => {
  let eficy: Eficy;
  let plugin: UnocssPlugin;

  beforeEach(async () => {
    // Create fresh instances
    eficy = new Eficy();

    // Register plugin
    await eficy.pluginManager.register(UnocssPlugin);
  });

  afterEach(() => {
    // plugin.destroy();
    vi.clearAllMocks();
  });

  describe('基础功能', () => {
    it('应该能够注册插件', () => {
      expect(eficy.pluginManager.getPlugin('unocss-plugin')?.constructor).toBe(UnocssPlugin);
    });

    it.only('应该能够收集 className', () => {
      const TestComponent = (props: any) => React.createElement('div', props, 'Test');

      const context = {
        props: { className: 'text-red-500 p-4 bg-blue-500' },
      };

      const ModifiedComponent = eficy.pluginManager.executeRenderHooks(TestComponent, context);

      expect(ModifiedComponent).not.toBe(TestComponent);
      expect(plugin.getCollectedClasses().size).toBeGreaterThan(0);
    });

    it('应该处理数组形式的 className', () => {
      const TestComponent = (props: any) => React.createElement('div', props, 'Test');

      const context = {
        props: { className: ['text-red-500', 'p-4', 'bg-blue-500'] },
      };

      const ModifiedComponent = eficy.pluginManager.executeRenderHooks(TestComponent, context);

      expect(ModifiedComponent).not.toBe(TestComponent);
      expect(plugin.getCollectedClasses().size).toBeGreaterThan(0);
    });

    it('应该忽略空的或无效的 className', () => {
      const TestComponent = (props: any) => React.createElement('div', props, 'Test');

      const context = {
        props: { className: '' },
      };

      const ModifiedComponent = eficy.pluginManager.executeRenderHooks(TestComponent, context);

      expect(ModifiedComponent).not.toBe(TestComponent);
      expect(plugin.getCollectedClasses().size).toBe(0);
    });
  });

  describe('样式注入', () => {
    beforeEach(() => {
      // 设置 DOM 环境
      document.body.innerHTML = '<div id="root"></div>';
    });

    afterEach(() => {
      // 清理 DOM
      document.body.innerHTML = '';
    });

    it('应该在根组件时注入样式', async () => {
      const TestComponent = (props: any) => React.createElement('div', props, 'Root Component');

      const context = {
        props: { className: 'text-red-500 p-4' },
      };

      const ModifiedComponent = eficy.pluginManager.executeRenderHooks(TestComponent, context);

      // 渲染根组件
      render(React.createElement(ModifiedComponent, { 'data-eficy-root': true }));

      // 等待异步样式注入
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 检查样式是否被注入
      const styleElement = document.getElementById('unocss-styles');
      expect(styleElement).toBeTruthy();
    });

    it('应该只注入一次样式', async () => {
      const TestComponent = (props: any) => React.createElement('div', props, 'Test');

      const context = {
        props: { className: 'text-red-500' },
      };

      const ModifiedComponent = eficy.pluginManager.executeRenderHooks(TestComponent, context);

      // 第一次渲染
      render(React.createElement(ModifiedComponent, { 'data-eficy-root': true }));

      // 等待异步样式注入
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 第二次渲染
      render(React.createElement(ModifiedComponent, { 'data-eficy-root': true }));

      // 等待异步样式注入
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 应该只有一个样式标签
      const styleElements = document.querySelectorAll('#unocss-styles');
      expect(styleElements.length).toBe(1);
    });
  });

  describe('错误处理', () => {
    it('应该优雅地处理生成器初始化错误', () => {
      // 不进行 mock，让插件正常初始化
      expect(() => {
        new UnocssPlugin();
      }).not.toThrow();
    });

    it('应该处理无效的 className', () => {
      const TestComponent = (props: any) => React.createElement('div', props, 'Test');

      const context = {
        props: { className: null },
      };

      const ModifiedComponent = eficy.pluginManager.executeRenderHooks(TestComponent, context);

      expect(ModifiedComponent).not.toBe(TestComponent);
      expect(plugin.getCollectedClasses().size).toBe(0);
    });
  });

  describe('插件配置', () => {
    it('应该支持自定义 UnoCSS 配置', async () => {
      const customPlugin = await eficy.pluginManager.register(UnocssPlugin, {
        config: {
          rules: [['custom-rule', { color: 'red' }]],
        },
      });

      // 等待生成器初始化
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(customPlugin.getGenerator()).toBeTruthy();
    });

    it('应该能够清理资源', async () => {
      const TestComponent = (props: any) => React.createElement('div', props, 'Test');

      const context = {
        props: { className: 'text-red-500' },
      };

      const ModifiedComponent = eficy.pluginManager.executeRenderHooks(TestComponent, context);

      // 渲染组件
      render(React.createElement(ModifiedComponent, { 'data-eficy-root': true }));

      // 等待异步样式注入
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 清理插件
      plugin.destroy();

      // 检查样式标签是否被移除
      const styleElement = document.getElementById('unocss-styles');
      expect(styleElement).toBeNull();
    });
  });

  describe('缓存机制', () => {
    it('应该缓存生成的 CSS', async () => {
      const TestComponent = (props: any) => React.createElement('div', props, 'Test');

      const context = {
        props: { className: 'text-red-500 p-4' },
      };

      const ModifiedComponent = eficy.pluginManager.executeRenderHooks(TestComponent, context);

      // 第一次渲染
      render(React.createElement(ModifiedComponent, { 'data-eficy-root': true }));

      // 等待异步样式注入
      await new Promise((resolve) => setTimeout(resolve, 10));

      const firstStyle = document.getElementById('unocss-styles')?.textContent;

      // 第二次渲染相同样式
      render(React.createElement(ModifiedComponent, { 'data-eficy-root': true }));

      // 等待异步样式注入
      await new Promise((resolve) => setTimeout(resolve, 10));

      const secondStyle = document.getElementById('unocss-styles')?.textContent;

      // 样式应该相同（缓存生效）
      expect(firstStyle).toBe(secondStyle);
    });
  });
});
