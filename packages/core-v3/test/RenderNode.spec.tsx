import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RenderNode from '../src/components/RenderNode'
import ViewNode from '../src/models/ViewNode'

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

describe('RenderNode', () => {
  describe('基础渲染', () => {
    it('应该渲染简单组件', () => {
      const viewNode = new ViewNode({
        '#': 'test',
        '#view': 'div',
        className: 'test-class',
        '#content': 'Hello World'
      })

      render(<RenderNode viewNode={viewNode} componentMap={testComponentMap} />)
      
      expect(screen.getByText('Hello World')).toBeInTheDocument()
      expect(screen.getByText('Hello World')).toHaveClass('test-class')
    })

    it('应该渲染自定义组件', () => {
      const viewNode = new ViewNode({
        '#': 'button',
        '#view': 'TestButton',
        className: 'test-button',
        '#content': 'Click Me'
      })

      render(<RenderNode viewNode={viewNode} componentMap={testComponentMap} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('test-button')
      expect(button).toHaveTextContent('Click Me')
    })

    it('应该处理样式属性', () => {
      const viewNode = new ViewNode({
        '#': 'styled',
        '#view': 'div',
        style: { color: 'red', fontSize: '16px' },
        '#content': 'Styled content'
      })

      render(<RenderNode viewNode={viewNode} componentMap={testComponentMap} />)
      
      const element = screen.getByText('Styled content')
      expect(element).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '16px' })
    })
  })

  describe('子节点渲染', () => {
    it('应该渲染嵌套子节点', () => {
      const parentNode = new ViewNode({
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

      render(<RenderNode viewNode={parentNode} componentMap={testComponentMap} />)
      
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      
      const parent = screen.getByText('Child 1').parentElement
      expect(parent).toHaveClass('parent')
    })

    it('应该支持深层嵌套', () => {
      const deepNode = new ViewNode({
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

      render(<RenderNode viewNode={deepNode} componentMap={testComponentMap} />)
      
      const deepElement = screen.getByText('Deep content')
      expect(deepElement).toBeInTheDocument()
      expect(deepElement).toHaveClass('level-2')
      expect(deepElement.parentElement).toHaveClass('level-1')
    })
  })

  describe('条件渲染', () => {
    it('当 #if 为 false 时不应该渲染', () => {
      const viewNode = new ViewNode({
        '#': 'conditional',
        '#view': 'div',
        '#if': false,
        '#content': 'Should not render'
      })

      const { container } = render(<RenderNode viewNode={viewNode} componentMap={testComponentMap} />)
      expect(container.firstChild).toBeNull()
    })

    it('当 #if 为 true 时应该渲染', () => {
      const viewNode = new ViewNode({
        '#': 'conditional',
        '#view': 'div', 
        '#if': true,
        '#content': 'Should render'
      })

      render(<RenderNode viewNode={viewNode} componentMap={testComponentMap} />)
      expect(screen.getByText('Should render')).toBeInTheDocument()
    })

    it('默认情况下应该渲染（没有 #if）', () => {
      const viewNode = new ViewNode({
        '#': 'default',
        '#view': 'div',
        '#content': 'Default render'
      })

      render(<RenderNode viewNode={viewNode} componentMap={testComponentMap} />)
      expect(screen.getByText('Default render')).toBeInTheDocument()
    })
  })

  describe('组件错误处理', () => {
    it('组件不存在时应该显示错误信息', () => {
      const viewNode = new ViewNode({
        '#': 'missing',
        '#view': 'NonExistentComponent',
        '#content': 'This should show error'
      })

      // 捕获控制台错误
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<RenderNode viewNode={viewNode} componentMap={testComponentMap} />)
      
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

      const viewNode = new ViewNode({
        '#': 'error',
        '#view': 'ErrorComponent'
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<RenderNode viewNode={viewNode} componentMap={errorComponentMap} />)
      
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

      const viewNode = new ViewNode({
        '#': 'memo-test',
        '#view': 'SpyComponent',
        '#content': 'Memo test'
      })

      const { rerender } = render(<RenderNode viewNode={viewNode} componentMap={spyComponentMap} />)
      
      expect(renderSpy).toHaveBeenCalledTimes(1)

      // 重新渲染但 viewNode 没有变化
      rerender(<RenderNode viewNode={viewNode} componentMap={spyComponentMap} />)
      
      // 由于 memo，不应该重新渲染
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })
  })
}) 