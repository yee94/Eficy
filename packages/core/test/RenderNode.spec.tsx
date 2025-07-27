import 'reflect-metadata';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import RenderNode from '../src/components/RenderNode';
import EficyNode from '../src/models/EficyNode';
import EficyModelTree from '../src/models/EficyModelTree';
import DomTree from '../src/models/DomTree';
import Eficy from '../src/core/Eficy';
import ComponentRegistry from '../src/services/ComponentRegistry';

// 测试用的组件
const TestButton = ({ children, onClick, className }: any) => (
  <button className={className} onClick={onClick}>
    {children}
  </button>
);

const TestDiv = ({ children, style, className }: any) => (
  <div className={className} style={style}>
    {children}
  </div>
);

const testComponentMap = {
  TestButton,
  TestDiv,
  button: 'button',
  div: 'div',
  span: 'span',
};

// 创建 RenderNode 的辅助函数，使用 DomTree
const createRenderNode = async (eficyNode: EficyNode, componentMap: any) => {
  const componentRegistry = container.resolve(ComponentRegistry);
  componentRegistry.extend(componentMap);
  const domTree = container.resolve(DomTree);
  return await domTree.createElement(eficyNode);
};

// 设置测试容器
beforeEach(() => {
  container.clearInstances();
  // 注册必要的服务
  if (!container.isRegistered(ComponentRegistry)) {
    container.registerSingleton(ComponentRegistry);
  }
  if (!container.isRegistered(EficyModelTree)) {
    container.registerSingleton(EficyModelTree);
  }
  if (!container.isRegistered(DomTree)) {
    container.registerSingleton(DomTree);
  }

  // 配置组件映射
  const componentRegistry = container.resolve(ComponentRegistry);
  componentRegistry.extend(testComponentMap);
});

describe('RenderNode', () => {
  describe('基础渲染', () => {
    it('应该渲染简单组件', async () => {
      const eficyNode = new EficyNode({
        '#': 'test',
        '#view': 'div',
        className: 'test-class',
        '#content': 'Hello World',
      });

      const renderNode = await createRenderNode(eficyNode, testComponentMap);
      render(renderNode!);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toHaveClass('test-class');
    });

    it('应该渲染自定义组件', async () => {
      const eficyNode = new EficyNode({
        '#': 'button',
        '#view': 'TestButton',
        className: 'test-button',
        '#content': 'Click Me',
      });

      const renderNode = await createRenderNode(eficyNode, testComponentMap);
      render(renderNode!);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('test-button');
      expect(button).toHaveTextContent('Click Me');
    });

    it('应该处理样式属性', async () => {
      const eficyNode = new EficyNode({
        '#': 'styled',
        '#view': 'div',
        style: { color: 'red', fontSize: '16px' },
        '#content': 'Styled content',
      });

      const renderNode = await createRenderNode(eficyNode, testComponentMap);
      render(renderNode!);

      const element = screen.getByText('Styled content');
      expect(element).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '16px' });
    });
  });

  describe('子节点渲染', () => {
    it('应该渲染嵌套子节点', async () => {
      // 使用 EficyModelTree 来正确构建包含子节点的树
      const nodeTree = container.resolve(EficyModelTree);
      await nodeTree.build({
        '#': 'parent',
        '#view': 'div',
        className: 'parent',
        '#children': [
          {
            '#': 'child1',
            '#view': 'span',
            '#content': 'Child 1',
          },
          {
            '#': 'child2',
            '#view': 'span',
            '#content': 'Child 2',
          },
        ],
      });

      const parentNode = nodeTree.root!;
      const renderNode = await createRenderNode(parentNode, testComponentMap);
      render(renderNode!);

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();

      const parent = screen.getByText('Child 1').parentElement;
      expect(parent).toHaveClass('parent');
    });

    it('应该支持深层嵌套', async () => {
      // 使用 EficyModelTree 来正确构建深层嵌套的树
      const nodeTree = container.resolve(EficyModelTree);
      await nodeTree.build({
        '#': 'root',
        '#view': 'div',
        '#children': [
          {
            '#': 'level1',
            '#view': 'div',
            className: 'level-1',
            '#children': [
              {
                '#': 'level2',
                '#view': 'span',
                className: 'level-2',
                '#content': 'Deep content',
              },
            ],
          },
        ],
      });

      const deepNode = nodeTree.root!;
      const renderNode = await createRenderNode(deepNode, testComponentMap);
      render(renderNode!);

      const deepElement = screen.getByText('Deep content');
      expect(deepElement).toBeInTheDocument();
      expect(deepElement).toHaveClass('level-2');
      expect(deepElement.parentElement).toHaveClass('level-1');
    });
  });

  describe('条件渲染', () => {
    it('当 #if 为 false 时不应该渲染', async () => {
      const eficyNode = new EficyNode({
        '#': 'conditional',
        '#view': 'div',
        '#if': false,
        '#content': 'Should not render',
      });

      const renderNode = await createRenderNode(eficyNode, testComponentMap);
      const { container: renderContainer } = render(renderNode!);
      expect(renderContainer.firstChild).toBeNull();
    });

    it('当 #if 为 true 时应该渲染', async () => {
      const eficyNode = new EficyNode({
        '#': 'conditional',
        '#view': 'div',
        '#if': true,
        '#content': 'Should render',
      });

      const renderNode = await createRenderNode(eficyNode, testComponentMap);
      render(renderNode!);
      expect(screen.getByText('Should render')).toBeInTheDocument();
    });

    it('默认情况下应该渲染（没有 #if）', async () => {
      const eficyNode = new EficyNode({
        '#': 'default',
        '#view': 'div',
        '#content': 'Default render',
      });

      const renderNode = await createRenderNode(eficyNode, testComponentMap);
      render(renderNode!);
      expect(screen.getByText('Default render')).toBeInTheDocument();
    });
  });

  describe('组件错误处理', () => {
    it('组件不存在时应该显示错误信息', async () => {
      const eficyNode = new EficyNode({
        '#': 'missing',
        '#view': 'NonExistentComponent',
        '#content': 'This should show error',
      });

      // 捕获控制台错误
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const renderNode = await createRenderNode(eficyNode, testComponentMap);
      render(renderNode!);

      // 应该渲染错误信息或占位符
      expect(screen.getByText(/Component.*not found/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('组件渲染错误时应该有错误边界', async () => {
      const ErrorComponent = () => {
        throw new Error('Component error');
      };

      const errorComponentMap = {
        ...testComponentMap,
        ErrorComponent,
      };

      const eficyNode = new EficyNode({
        '#': 'error',
        '#view': 'ErrorComponent',
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const renderNode = await createRenderNode(eficyNode, errorComponentMap);
      render(renderNode!);

      // 应该显示错误边界信息
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('性能优化', () => {
    it('应该使用 React.memo 避免不必要的重渲染', async () => {
      const renderSpy = vi.fn();

      const SpyComponent = vi.fn(({ children }) => {
        renderSpy();
        return <div>{children}</div>;
      });

      const spyComponentMap = {
        ...testComponentMap,
        SpyComponent,
      };

      const eficyNode = new EficyNode({
        '#': 'memo-test',
        '#view': 'SpyComponent',
        '#content': 'Memo test',
      });

      const renderNode = await createRenderNode(eficyNode, spyComponentMap);
      const { rerender } = render(renderNode!);

      // 由于增加了 useEffect，初始渲染可能会触发额外的渲染
      expect(renderSpy).toHaveBeenCalledTimes(2);

      // 重新渲染但 eficyNode 没有变化
      const newRenderNode = await createRenderNode(eficyNode, spyComponentMap);
      rerender(newRenderNode!);

      // 由于 memo，不应该有额外的渲染
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('DomTree 独立管理', () => {
    it('应该能够独立构建RenderNode映射', async () => {
      const eficyModelTree = container.resolve(EficyModelTree);
      await eficyModelTree.build({
        '#': 'parent',
        '#view': 'div',
        className: 'parent',
        '#children': [
          {
            '#': 'child1',
            '#view': 'span',
            '#content': 'Child 1',
          },
          {
            '#': 'child2',
            '#view': 'span',
            '#content': 'Child 2',
          },
        ],
      });

      const domTree = container.resolve(DomTree);
      const rootNode = eficyModelTree.root;

      expect(rootNode).toBeTruthy();

      // 构建 RenderNode 映射
      await domTree.createElement(rootNode!);

      // 验证映射关系
      expect(domTree.stats.totalRenderNodes).toBe(4); // parent + 2 children

      // 验证能够通过 nodeId 找到对应的 RenderNode
      const parentRenderNode = domTree.findRenderNode('parent');
      expect(parentRenderNode).toBeTruthy();

      const child1RenderNode = domTree.findRenderNode('child1');
      expect(child1RenderNode).toBeTruthy();
    });

    it('应该支持单独的RenderNode操作', async () => {
      const eficyModelTree = container.resolve(EficyModelTree);
      await eficyModelTree.build({
        '#': 'test',
        '#view': 'div',
        '#content': 'Test content',
      });

      const domTree = container.resolve(DomTree);
      const rootNode = eficyModelTree.root!;

      await domTree.createElement(rootNode);

      const renderNode = domTree.findRenderNode('test');
      expect(renderNode).toBeTruthy();

      // 测试清空功能
      domTree.clear();
      expect(domTree.stats.totalRenderNodes).toBe(0);
    });
  });

  describe('Eficy 主类集成管理', () => {
    it('应该能够通过Eficy主类管理两个树', async () => {
      const eficy = new Eficy();
      eficy.config({ componentMap: testComponentMap });

      const schema = {
        views: [
          {
            '#': 'main',
            '#view': 'div',
            className: 'main',
            '#children': [
              {
                '#': 'title',
                '#view': 'span',
                '#content': 'Title',
              },
            ],
          },
        ],
      };

      // 创建元素会自动构建两个树
      const element = await eficy.createElement(schema);
      expect(element).toBeTruthy();

      // 验证两个树都已创建
      expect(eficy.nodeTree).toBeTruthy();
      expect(eficy.renderTree).toBeTruthy();

      // 验证可以通过Eficy查找节点
      const mainNode = eficy.findNode('main');
      expect(mainNode).toBeTruthy();
      expect(mainNode?.['#']).toBe('main');

      const titleRenderNode = eficy.findRenderNode('title');
      expect(titleRenderNode).toBeTruthy();

      // 验证统计信息 (包含自动创建的root容器，所以是3个节点)
      const stats = eficy.stats;
      expect(stats.nodeTree?.totalNodes).toBe(3); // root + main + title
      expect(stats.renderTree?.totalRenderNodes).toBe(3);
    });

    it('应该支持通过Eficy同步更新两个树', async () => {
      const eficy = new Eficy();
      eficy.config({ componentMap: testComponentMap });

      const schema = {
        views: [
          {
            '#': 'container',
            '#view': 'div',
            '#children': [],
          },
        ],
      };

      await eficy.createElement(schema);

      // 添加子节点
      const newChild = eficy.addChild('container', {
        '#': 'newChild',
        '#view': 'span',
        '#content': 'New child',
      });

      expect(newChild).toBeTruthy();
      expect(newChild?.['#']).toBe('newChild');

      // 等待异步更新完成
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 验证两个树都已更新
      expect(eficy.findNode('newChild')).toBeTruthy();
      expect(eficy.findRenderNode('newChild')).toBeTruthy();

      // 移除子节点
      eficy.removeChild('container', 'newChild');

      // 验证两个树都已清理
      expect(eficy.findNode('newChild')).toBeNull();
      expect(eficy.findRenderNode('newChild')).toBeNull();
    });
  });
});
