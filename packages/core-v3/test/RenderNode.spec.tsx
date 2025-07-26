import 'reflect-metadata'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { container } from 'tsyringe'
import RenderNode from '../src/components/RenderNode'
import EficyNode from '../src/models/EficyNode'
import EficyNodeStore from '../src/models/EficyNodeStore'
import RenderNodeTree from '../src/models/RenderNodeTree'
import Eficy from '../src/core/Eficy'
import ComponentRegistry from '../src/services/ComponentRegistry'

// 测试用的组件
const TestButton = ({ children, onClick, className }: any) => (
  <button className={className} onClick={onClick}>
    {children}
  </button>
)

const TestDiv = ({ children, style, className }: any) => (
  <div className={className} style={style}>
    {children}
  </div>
)

const testComponentMap = {
  TestButton,
  TestDiv,
  button: 'button',
  div: 'div',
  span: 'span'
}

// 设置测试容器
beforeEach(() => {
  container.clearInstances()
  // 注册必要的服务
  if (!container.isRegistered(ComponentRegistry)) {
    container.registerSingleton(ComponentRegistry)
  }
  if (!container.isRegistered(EficyNodeStore)) {
    container.registerSingleton(EficyNodeStore)
  }
  if (!container.isRegistered(RenderNodeTree)) {
    container.registerSingleton(RenderNodeTree)
  }
  
  // 配置组件映射
  const componentRegistry = container.resolve(ComponentRegistry)
  componentRegistry.extend(testComponentMap)
})

describe('RenderNode', () => {
  describe('基础渲染', () => {
    it('应该渲染简单组件', () => {
      const eficyNode = new EficyNode({
        '#': 'test',
        '#view': 'div',
        className: 'test-class',
        '#content': 'Hello World'
      })

      render(<RenderNode eficyNode={eficyNode} componentMap={testComponentMap} />)
      
      expect(screen.getByText('Hello World')).toBeInTheDocument()
      expect(screen.getByText('Hello World')).toHaveClass('test-class')
    })

    it('应该渲染自定义组件', () => {
      const eficyNode = new EficyNode({
        '#': 'button',
        '#view': 'TestButton',
        className: 'test-button',
        '#content': 'Click Me'
      })

      render(<RenderNode eficyNode={eficyNode} componentMap={testComponentMap} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('test-button')
      expect(button).toHaveTextContent('Click Me')
    })

    it('应该处理样式属性', () => {
      const eficyNode = new EficyNode({
        '#': 'styled',
        '#view': 'div',
        style: { color: 'red', fontSize: '16px' },
        '#content': 'Styled content'
      })

      render(<RenderNode eficyNode={eficyNode} componentMap={testComponentMap} />)
      
      const element = screen.getByText('Styled content')
      expect(element).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '16px' })
    })
  })

  describe('子节点渲染', () => {
    it('应该渲染嵌套子节点', () => {
      // 使用 EficyNodeStore 来正确构建包含子节点的树
      const nodeTree = container.resolve(EficyNodeStore)
      nodeTree.build({
        '#': 'parent',
        '#view': 'div',
        className: 'parent',
        '#children': [
          {
            '#': 'child1',
            '#view': 'span',
            '#content': 'Child 1'
          },
          {
            '#': 'child2', 
            '#view': 'span',
            '#content': 'Child 2'
          }
        ]
      })

      const parentNode = nodeTree.root!

      render(<RenderNode eficyNode={parentNode} componentMap={testComponentMap} />)
      
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      
      const parent = screen.getByText('Child 1').parentElement
      expect(parent).toHaveClass('parent')
    })

    it('应该支持深层嵌套', () => {
      // 使用 EficyNodeStore 来正确构建深层嵌套的树
      const nodeTree = container.resolve(EficyNodeStore)
      nodeTree.build({
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
                '#content': 'Deep content'
              }
            ]
          }
        ]
      })

      const deepNode = nodeTree.root!

      render(<RenderNode eficyNode={deepNode} componentMap={testComponentMap} />)
      
      const deepElement = screen.getByText('Deep content')
      expect(deepElement).toBeInTheDocument()
      expect(deepElement).toHaveClass('level-2')
      expect(deepElement.parentElement).toHaveClass('level-1')
    })
  })

  describe('条件渲染', () => {
    it('当 #if 为 false 时不应该渲染', () => {
      const eficyNode = new EficyNode({
        '#': 'conditional',
        '#view': 'div',
        '#if': false,
        '#content': 'Should not render'
      })

      const { container: renderContainer } = render(<RenderNode eficyNode={eficyNode} componentMap={testComponentMap} />)
      expect(renderContainer.firstChild).toBeNull()
    })

    it('当 #if 为 true 时应该渲染', () => {
      const eficyNode = new EficyNode({
        '#': 'conditional',
        '#view': 'div', 
        '#if': true,
        '#content': 'Should render'
      })

      render(<RenderNode eficyNode={eficyNode} componentMap={testComponentMap} />)
      expect(screen.getByText('Should render')).toBeInTheDocument()
    })

    it('默认情况下应该渲染（没有 #if）', () => {
      const eficyNode = new EficyNode({
        '#': 'default',
        '#view': 'div',
        '#content': 'Default render'
      })

      render(<RenderNode eficyNode={eficyNode} componentMap={testComponentMap} />)
      expect(screen.getByText('Default render')).toBeInTheDocument()
    })
  })

  describe('组件错误处理', () => {
    it('组件不存在时应该显示错误信息', () => {
      const eficyNode = new EficyNode({
        '#': 'missing',
        '#view': 'NonExistentComponent',
        '#content': 'This should show error'
      })

      // 捕获控制台错误
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<RenderNode eficyNode={eficyNode} componentMap={testComponentMap} />)
      
      // 应该渲染错误信息或占位符
      expect(screen.getByText(/Component.*not found/i)).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('组件渲染错误时应该有错误边界', () => {
      const ErrorComponent = () => {
        throw new Error('Component error')
      }
      
      const errorComponentMap = {
        ...testComponentMap,
        ErrorComponent
      }

      const eficyNode = new EficyNode({
        '#': 'error',
        '#view': 'ErrorComponent'
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<RenderNode eficyNode={eficyNode} componentMap={errorComponentMap} />)
      
      // 应该显示错误边界信息
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('性能优化', () => {
    it('应该使用 React.memo 避免不必要的重渲染', () => {
      const renderSpy = vi.fn()
      
      const SpyComponent = vi.fn(({ children }) => {
        renderSpy()
        return <div>{children}</div>
      })

      const spyComponentMap = {
        SpyComponent
      }

      const eficyNode = new EficyNode({
        '#': 'memo-test',
        '#view': 'SpyComponent',
        '#content': 'Memo test'
      })

      const { rerender } = render(<RenderNode eficyNode={eficyNode} componentMap={spyComponentMap} />)
      
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // 重新渲染但 eficyNode 没有变化
      rerender(<RenderNode eficyNode={eficyNode} componentMap={spyComponentMap} />)
      
      // 由于 memo，不应该重新渲染
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('RenderNodeTree 独立管理', () => {
    it('应该能够独立构建RenderNode映射', () => {
      const eficyNodeStore = container.resolve(EficyNodeStore)
      eficyNodeStore.build({
        '#': 'parent',
        '#view': 'div',
        className: 'parent',
        '#children': [
          {
            '#': 'child1',
            '#view': 'span',
            '#content': 'Child 1'
          },
          {
            '#': 'child2', 
            '#view': 'span',
            '#content': 'Child 2'
          }
        ]
      })

      const renderNodeTree = container.resolve(RenderNodeTree)
      const rootNode = eficyNodeStore.root
      
      expect(rootNode).toBeTruthy()
      
      // 构建 RenderNode 映射
      renderNodeTree.createElement(rootNode!, RenderNode)

      // 验证映射关系
      expect(renderNodeTree.stats.totalRenderNodes).toBe(3) // parent + 2 children
      expect(renderNodeTree.stats.hasComponentMap).toBe(true)
      expect(renderNodeTree.stats.hasRenderNodeComponent).toBe(true)

      // 验证能够通过 nodeId 找到对应的 RenderNode
      const parentRenderNode = renderNodeTree.findRenderNode('parent')
      expect(parentRenderNode).toBeTruthy()

      const child1RenderNode = renderNodeTree.findRenderNode('child1')
      expect(child1RenderNode).toBeTruthy()
    })

    it('应该支持单独的RenderNode操作', () => {
      const eficyNodeStore = container.resolve(EficyNodeStore)
      eficyNodeStore.build({
        '#': 'test',
        '#view': 'div',
        '#content': 'Test content'
      })

      const renderNodeTree = container.resolve(RenderNodeTree)
      const rootNode = eficyNodeStore.root!
      
      renderNodeTree.createElement(rootNode, RenderNode)

      const renderNode = renderNodeTree.findRenderNode('test')
      expect(renderNode).toBeTruthy()

      // 测试清空功能
      renderNodeTree.clear()
      expect(renderNodeTree.stats.totalRenderNodes).toBe(0)
    })
  })

  describe('Eficy 主类集成管理', () => {
    it('应该能够通过Eficy主类管理两个树', () => {
      const eficy = new Eficy()
      eficy.config({ componentMap: testComponentMap })

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
                '#content': 'Title'
              }
            ]
          }
        ]
      }

      // 创建元素会自动构建两个树
      const element = eficy.createElement(schema)
      expect(element).toBeTruthy()

      // 验证两个树都已创建
      expect(eficy.nodeTree).toBeTruthy()
      expect(eficy.renderTree).toBeTruthy()

      // 验证可以通过Eficy查找节点
      const mainNode = eficy.findNode('main')
      expect(mainNode).toBeTruthy()
      expect(mainNode?.['#']).toBe('main')

      const titleRenderNode = eficy.findRenderNode('title')
      expect(titleRenderNode).toBeTruthy()

      // 验证统计信息 (包含自动创建的root容器，所以是3个节点)
      const stats = eficy.stats
      expect(stats.nodeTree?.totalNodes).toBe(3) // root + main + title
      expect(stats.renderTree?.totalRenderNodes).toBe(3)
    })

    it('应该支持通过Eficy同步更新两个树', () => {
      const eficy = new Eficy()
      eficy.config({ componentMap: testComponentMap })

      const schema = {
        views: [
          {
            '#': 'container',
            '#view': 'div',
            '#children': []
          }
        ]
      }

      eficy.createElement(schema)

      // 添加子节点
      const newChild = eficy.addChild('container', {
        '#': 'newChild',
        '#view': 'span',
        '#content': 'New child'
      })

      expect(newChild).toBeTruthy()
      expect(newChild?.['#']).toBe('newChild')

      // 验证两个树都已更新
      expect(eficy.findNode('newChild')).toBeTruthy()
      expect(eficy.findRenderNode('newChild')).toBeTruthy()

      // 移除子节点
      eficy.removeChild('container', 'newChild')

      // 验证两个树都已清理
      expect(eficy.findNode('newChild')).toBeNull()
      expect(eficy.findRenderNode('newChild')).toBeNull()
    })
  })
}) 