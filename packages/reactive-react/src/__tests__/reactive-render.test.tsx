import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Observable, Computed, Action, ObservableClass } from '@eficy/reactive'
import { useObserver } from '../hooks'

/**
 * 这些测试用例记录了从 core-v3 RenderNode.reactive.spec.tsx 中发现的响应式系统问题
 * 
 * 使用新的 @preact/signals-react 的 useSignals 实现后，应该解决大部分问题：
 * 1. ViewNode 的响应式更新现在应该正确触发 UI 重新渲染
 * 2. observer() 包装的组件现在应该正确响应 ObservableClass 的变化
 * 3. 无限渲染循环问题应该得到解决
 */

// 模拟 ViewNode 类
class MockViewNode extends ObservableClass {
  @Observable
  public '#' = ''

  @Observable
  public '#view' = 'div'

  @Observable
  public '#content'?: string

  @Observable
  private dynamicProps: Record<string, any> = {}

  constructor(data: any) {
    super()
    this.load(data)
  }

  @Action
  private load(data: any): void {
    this['#'] = data['#'] || this['#']
    this['#view'] = data['#view'] || 'div'
    this['#content'] = data['#content']
    
    const { '#': _id, '#view': _view, '#content': _content, ...otherProps } = data
    this.dynamicProps = { ...otherProps }
  }

  @Computed
  get props(): Record<string, any> {
    const props: Record<string, any> = { ...this.dynamicProps }
    
    if (this['#content'] !== undefined) {
      props.children = this['#content']
    }
    
    return props
  }

  @Action
  updateField(key: string, value: any): void {
    if (key === '#content') {
      this[key] = value
    } else if (key === '#view') {
      this[key] = value
    } else {
      this.dynamicProps = {
        ...this.dynamicProps,
        [key]: value,
      }
    }
  }
}

// 模拟组件映射
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

// 模拟 RenderNode 组件 - 使用新的 useObserver
const MockRenderNode = ({ viewNode, componentMap = {} }: { viewNode: MockViewNode, componentMap?: any }) => {
  // 使用新的 useObserver() - 类似 useSignals() 的使用方式
  useObserver()
  
  const componentName = viewNode['#view']
  const Component = componentMap[componentName] as any
  
  if (!Component) {
    return (
      <div style={{ color: 'red', background: '#ffe6e6', padding: '8px', border: '1px solid red' }}>
        Component "{componentName}" not found
      </div>
    )
  }
  
  const props = viewNode.props
  
  if (typeof Component === 'string') {
    return React.createElement(Component, props)
  }
  
  return React.createElement(Component, props)
}

describe('Reactive Rendering Tests - Using New useObserver Implementation', () => {
  describe('Property Updates (SHOULD NOW WORK)', () => {
    it('should reactively update when ViewNode properties change', async () => {
      const viewData = {
        '#': 'test-node',
        '#view': 'div',
        className: 'initial-class',
        '#content': 'Initial Content'
      }

      const viewNode = new MockViewNode(viewData)
      
      render(<MockRenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
      // 验证初始渲染
      expect(screen.getByText('Initial Content')).toBeInTheDocument()
      expect(screen.getByText('Initial Content')).toHaveClass('initial-class')
      
      // 响应式更新属性
      viewNode.updateField('className', 'updated-class')
      viewNode.updateField('#content', 'Updated Content')
      
      // 现在应该能正确触发 UI 重新渲染
      await waitFor(() => {
        expect(screen.getByText('Updated Content')).toBeInTheDocument()
        expect(screen.getByText('Updated Content')).toHaveClass('updated-class')
      })
    })

    it('should reactively update component type', async () => {
      const viewData = {
        '#': 'dynamic-component',
        '#view': 'div',
        '#content': 'Content'
      }

      const viewNode = new MockViewNode(viewData)
      
      render(<MockRenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
      // 验证初始为 div
      expect(screen.getByText('Content').tagName).toBe('DIV')
      
      // 更新组件类型
      viewNode.updateField('#view', 'span')
      
      // 现在应该能正确触发重新渲染
      await waitFor(() => {
        expect(screen.getByText('Content').tagName).toBe('SPAN')
      })
    })

    it('should reactively update custom component props', async () => {
      const viewData = {
        '#': 'custom-node',
        '#view': 'CustomComponent',
        'data-value': 'initial',
        '#content': 'Custom Content'
      }

      const viewNode = new MockViewNode(viewData)
      
      render(<MockRenderNode viewNode={viewNode} componentMap={mockComponentMap} />)
      
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

  describe('useObserver Hook Integration', () => {
    it('should work with computed values', async () => {
      class TestStore extends ObservableClass {
        @Observable count = 0
        @Observable multiplier = 2

        @Computed
        get result() {
          return this.count * this.multiplier
        }

        @Action
        increment() {
          this.count++
        }

        @Action
        setMultiplier(value: number) {
          this.multiplier = value
        }
      }

      const store = new TestStore()

      const TestComponent = () => {
        useObserver()
        return (
          <div data-testid="result">
            Count: {store.count}, Result: {store.result}
          </div>
        )
      }

      render(<TestComponent />)

      // 验证初始值
      expect(screen.getByTestId('result')).toHaveTextContent('Count: 0, Result: 0')

      // 更新count
      store.increment()

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('Count: 1, Result: 2')
      })

      // 更新multiplier
      store.setMultiplier(3)

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent('Count: 1, Result: 3')
      })
    })

    it('should handle multiple observable updates in single action', async () => {
      class MultiStore extends ObservableClass {
        @Observable name = 'initial'
        @Observable age = 0
        @Observable email = 'initial@example.com'

        @Computed
        get fullInfo() {
          return `${this.name} (${this.age}) - ${this.email}`
        }

        @Action
        updateProfile(name: string, age: number, email: string) {
          this.name = name
          this.age = age
          this.email = email
        }
      }

      const store = new MultiStore()

      const ProfileComponent = () => {
        useObserver()
        return <div data-testid="profile">{store.fullInfo}</div>
      }

      render(<ProfileComponent />)

      // 验证初始值
      expect(screen.getByTestId('profile')).toHaveTextContent('initial (0) - initial@example.com')

      // 批量更新
      store.updateProfile('John', 30, 'john@example.com')

      await waitFor(() => {
        expect(screen.getByTestId('profile')).toHaveTextContent('John (30) - john@example.com')
      })
    })
  })

  describe('Performance Tests', () => {
    it('should only re-render when observables change', async () => {
      const renderSpy = vi.fn()

      class CountStore extends ObservableClass {
        @Observable count = 0
        @Observable ignored = 'static'

        @Action
        increment() {
          this.count++
        }

        updateIgnored(value: string) {
          // 不使用@action，应该不会触发更新
          this.ignored = value
        }
      }

      const store = new CountStore()

      const TestComponent = () => {
        useObserver()
        renderSpy()
        return <div data-testid="count">{store.count}</div>
      }

      render(<TestComponent />)

      // 检查初始渲染
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('count')).toHaveTextContent('0')

      // 更新observable
      store.increment()

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('1')
      })

      // 应该重新渲染
      expect(renderSpy).toHaveBeenCalledTimes(2)

      // 更新non-observable（不应该触发重新渲染）
      store.updateIgnored('changed')

      // 等待一段时间确保没有额外的渲染
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })
  })
})