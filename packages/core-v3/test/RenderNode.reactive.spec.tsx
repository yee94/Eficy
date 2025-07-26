import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { signal } from '@eficy/reactive'
import RenderNode from '../src/components/RenderNode'
import ViewNode from '../src/models/ViewNode'
import type { IViewData } from '../src/interfaces'

describe('RenderNode - Reactive Capabilities', () => {
  const mockComponentMap = {
    div: 'div',
    span: 'span',
    button: 'button',
    h1: 'h1',
    CustomComponent: ({ children, ...props }: any) => (
      <div data-testid="custom-component" {...props}>
        {children}
      </div>
    )
  }

  describe('Reactive Property Updates', () => {
    it('should reactively update when ViewNode properties change', async () => {
      const viewData: IViewData = {
        '#': 'test-node',
        '#view': 'div',
        className: 'initial-class',
        '#content': 'Initial Content'
      }

      const viewNode = new ViewNode(viewData)
      
      render(<RenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
      // 验证初始渲染
      expect(screen.getByText('Initial Content')).toBeInTheDocument()
      expect(screen.getByText('Initial Content')).toHaveClass('initial-class')
      
      // 响应式更新属性
      viewNode.updateField('className', 'updated-class')
      viewNode.updateField('#content', 'Updated Content')
      
      // 验证响应式更新
      await waitFor(() => {
        expect(screen.getByText('Updated Content')).toBeInTheDocument()
        expect(screen.getByText('Updated Content')).toHaveClass('updated-class')
      })
    })

    it('should reactively update component type', async () => {
      const viewData: IViewData = {
        '#': 'dynamic-component',
        '#view': 'div',
        '#content': 'Content'
      }

      const viewNode = new ViewNode(viewData)
      
      render(<RenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
      // 验证初始为 div
      expect(screen.getByText('Content').tagName).toBe('DIV')
      
      // 更新组件类型
      viewNode.updateField('#view', 'span')
      
      // 验证响应式更新为 span
      await waitFor(() => {
        expect(screen.getByText('Content').tagName).toBe('SPAN')
      })
    })

    it('should reactively update custom component props', async () => {
      const viewData: IViewData = {
        '#': 'custom-node',
        '#view': 'CustomComponent',
        'data-value': 'initial',
        '#content': 'Custom Content'
      }

      const viewNode = new ViewNode(viewData)
      
      render(<RenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
      // 验证初始渲染
      const customComponent = screen.getByTestId('custom-component')
      expect(customComponent).toHaveAttribute('data-value', 'initial')
      expect(customComponent).toHaveTextContent('Custom Content')
      
      // 响应式更新属性
      viewNode.updateField('data-value', 'updated')
      viewNode.updateField('#content', 'Updated Custom Content')
      
      // 验证响应式更新
      await waitFor(() => {
        expect(customComponent).toHaveAttribute('data-value', 'updated')
        expect(customComponent).toHaveTextContent('Updated Custom Content')
      })
    })
  })

  describe('Reactive Children Updates', () => {
    it('should reactively update when children are added', async () => {
      const parentData: IViewData = {
        '#': 'parent',
        '#view': 'div',
        '#children': [
          {
            '#': 'child1',
            '#view': 'span',
            '#content': 'Child 1'
          }
        ]
      }

      const parentNode = new ViewNode(parentData)
      
      render(<RenderNode viewNode={parentNode} componentMap={mockComponentMap} />)
      
      // 验证初始子节点
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.queryByText('Child 2')).not.toBeInTheDocument()
      
      // 添加新子节点
      const newChild = new ViewNode({
        '#': 'child2',
        '#view': 'span',
        '#content': 'Child 2'
      })
      
      parentNode.addChild(newChild)
      
      // 验证响应式添加
      await waitFor(() => {
        expect(screen.getByText('Child 2')).toBeInTheDocument()
      })
    })

    it('should reactively update when children are removed', async () => {
      const parentData: IViewData = {
        '#': 'parent',
        '#view': 'div',
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
      }

      const parentNode = new ViewNode(parentData)
      
      render(<RenderNode viewNode={parentNode} componentMap={mockComponentMap} />)
      
      // 验证初始子节点
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      
      // 移除子节点
      parentNode.removeChild('child1')
      
      // 验证响应式移除
      await waitFor(() => {
        expect(screen.queryByText('Child 1')).not.toBeInTheDocument()
        expect(screen.getByText('Child 2')).toBeInTheDocument()
      })
    })

    it('should reactively update nested children', async () => {
      const rootData: IViewData = {
        '#': 'root',
        '#view': 'div',
        '#children': [
          {
            '#': 'level1',
            '#view': 'div',
            '#children': [
              {
                '#': 'level2',
                '#view': 'span',
                '#content': 'Deep Content'
              }
            ]
          }
        ]
      }

      const rootNode = new ViewNode(rootData)
      
      render(<RenderNode viewNode={rootNode} componentMap={mockComponentMap} />)
      
      // 验证深层内容
      expect(screen.getByText('Deep Content')).toBeInTheDocument()
      
      // 更新深层子节点
      const level1Node = rootNode.findChild('level1')
      const level2Node = level1Node?.findChild('level2')
      level2Node?.updateField('#content', 'Updated Deep Content')
      
      // 验证响应式更新
      await waitFor(() => {
        expect(screen.getByText('Updated Deep Content')).toBeInTheDocument()
        expect(screen.queryByText('Deep Content')).not.toBeInTheDocument()
      })
    })
  })

  describe('Conditional Rendering Reactivity', () => {
    it('should reactively show/hide based on #if condition', async () => {
      const viewData: IViewData = {
        '#': 'conditional',
        '#view': 'div',
        '#content': 'Conditional Content',
        '#if': true
      }

      const viewNode = new ViewNode(viewData)
      
      render(<RenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
      // 验证初始显示
      expect(screen.getByText('Conditional Content')).toBeInTheDocument()
      
      // 隐藏元素
      viewNode.updateField('#if', false)
      
      // 验证响应式隐藏
      await waitFor(() => {
        expect(screen.queryByText('Conditional Content')).not.toBeInTheDocument()
      })
      
      // 重新显示元素
      viewNode.updateField('#if', true)
      
      // 验证响应式显示
      await waitFor(() => {
        expect(screen.getByText('Conditional Content')).toBeInTheDocument()
      })
    })

    it('should reactively update with function-based #if condition', async () => {
      const showCondition = signal(true)
      
      const viewData: IViewData = {
        '#': 'functional-conditional',
        '#view': 'div',
        '#content': 'Function Conditional',
        '#if': () => showCondition()
      }

      const viewNode = new ViewNode(viewData)
      
      render(<RenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
      // 验证初始显示
      expect(screen.getByText('Function Conditional')).toBeInTheDocument()
      
      // 通过 signal 改变条件
      showCondition(false)
      
      // 验证响应式隐藏
      await waitFor(() => {
        expect(screen.queryByText('Function Conditional')).not.toBeInTheDocument()
      })
      
      // 重新显示
      showCondition(true)
      
      // 验证响应式显示
      await waitFor(() => {
        expect(screen.getByText('Function Conditional')).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Optimization', () => {
    it('should only re-render affected components', async () => {
      const renderSpy = vi.fn()
      
      const SpyComponent = ({ children, ...props }: any) => {
        renderSpy()
        return <div data-testid="spy-component" {...props}>{children}</div>
      }
      
      const componentMapWithSpy = {
        ...mockComponentMap,
        SpyComponent
      }
      
      const parentData: IViewData = {
        '#': 'parent',
        '#view': 'div',
        '#children': [
          {
            '#': 'child1',
            '#view': 'SpyComponent',
            '#content': 'Child 1'
          },
          {
            '#': 'child2',
            '#view': 'span',
            '#content': 'Child 2'
          }
        ]
      }

      const parentNode = new ViewNode(parentData)
      
      render(<RenderNode viewNode={parentNode} componentMap={componentMapWithSpy} />)
      
      const initialRenderCount = renderSpy.mock.calls.length
      
      // 只更新 child2，不应该重新渲染 child1 的 SpyComponent
      const child2 = parentNode.findChild('child2')
      child2?.updateField('#content', 'Updated Child 2')
      
      await waitFor(() => {
        expect(screen.getByText('Updated Child 2')).toBeInTheDocument()
      })
      
      // SpyComponent 不应该重新渲染
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount)
    })

    it('should handle rapid updates efficiently', async () => {
      const viewData: IViewData = {
        '#': 'rapid-update',
        '#view': 'div',
        '#content': 'Initial'
      }

      const viewNode = new ViewNode(viewData)
      
      render(<RenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
      // 快速连续更新
      const updates = ['Update 1', 'Update 2', 'Update 3', 'Final Update']
      
      const startTime = performance.now()
      
      updates.forEach((update, index) => {
        setTimeout(() => {
          viewNode.updateField('#content', update)
        }, index * 10)
      })
      
      // 验证最终状态
      await waitFor(() => {
        expect(screen.getByText('Final Update')).toBeInTheDocument()
      }, { timeout: 1000 })
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(500) // 应该在合理时间内完成
    })
  })

  describe('Error Handling in Reactive Context', () => {
    it('should handle errors in reactive updates gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const ErrorComponent = () => {
        throw new Error('Component Error')
      }
      
      const errorComponentMap = {
        ...mockComponentMap,
        ErrorComponent
      }
      
      const viewData: IViewData = {
        '#': 'error-test',
        '#view': 'div',
        '#content': 'Safe Content'
      }

      const viewNode = new ViewNode(viewData)
      
      render(<RenderNode viewNode={viewNode} componentMap={errorComponentMap} />)
      
      // 验证正常渲染
      expect(screen.getByText('Safe Content')).toBeInTheDocument()
      
      // 更新为错误组件
      viewNode.updateField('#view', 'ErrorComponent')
      
      // 验证错误边界处理
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
      
      consoleSpy.mockRestore()
    })

    it('should recover from errors when component is fixed', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const ErrorComponent = () => {
        throw new Error('Component Error')
      }
      
      const errorComponentMap = {
        ...mockComponentMap,
        ErrorComponent
      }
      
      const viewData: IViewData = {
        '#': 'recovery-test',
        '#view': 'ErrorComponent'
      }

      const viewNode = new ViewNode(viewData)
      
      render(<RenderNode viewNode={viewNode} componentMap={errorComponentMap} />)
      
      // 验证错误状态
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      
      // 修复组件
      viewNode.updateField('#view', 'div')
      viewNode.updateField('#content', 'Recovered Content')
      
      // 点击 Try again 按钮
      const tryAgainButton = screen.getByText('Try again')
      tryAgainButton.click()
      
      // 验证恢复
      await waitFor(() => {
        expect(screen.getByText('Recovered Content')).toBeInTheDocument()
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
      })
      
      consoleSpy.mockRestore()
    })
  })
})