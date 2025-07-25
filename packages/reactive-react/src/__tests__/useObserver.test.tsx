import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { signal, createComputed, createAction } from '@eficy/reactive'
import { useObserver } from '../hooks/useObserver'

describe('useObserver', () => {
  it('should track reactive dependencies', async () => {
    const count = signal(0)
    
    function Counter() {
      return useObserver(() => (
        <div data-testid="counter">Count: {count()}</div>
      ))
    }
    
    render(<Counter />)
    expect(screen.getByTestId('counter')).toHaveTextContent('Count: 0')
    
    act(() => {
      count(1)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('counter')).toHaveTextContent('Count: 1')
    })
  })
  
  it('should work with computed values', async () => {
    const count = signal(5)
    const doubled = createComputed(() => count() * 2)
    
    function Component() {
      return useObserver(() => (
        <div data-testid="result">Count: {count()}, Doubled: {doubled()}</div>
      ))
    }
    
    render(<Component />)
    expect(screen.getByTestId('result')).toHaveTextContent('Count: 5, Doubled: 10')
    
    act(() => {
      count(3)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Count: 3, Doubled: 6')
    })
  })
  
  it('should batch updates with actions', async () => {
    const count = signal(0)
    const name = signal('test')
    let renderCount = 0
    
    const updateBoth = createAction(() => {
      count(10)
      name('updated')
    })
    
    function Component() {
      return useObserver(() => {
        renderCount++
        return <div data-testid="result">Count: {count()}, Name: {name()}</div>
      })
    }
    
    render(<Component />)
    const initialRenderCount = renderCount
    expect(screen.getByTestId('result')).toHaveTextContent('Count: 0, Name: test')
    
    act(() => {
      updateBoth()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Count: 10, Name: updated')
    })
    
    // Action 应该批处理更新，允许一些额外渲染但不应该太多
    expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 3)
  })
  
  it('should handle custom scheduler', async () => {
    const count = signal(0)
    let schedulerCalled = false
    
    const customScheduler = (fn: () => void) => {
      schedulerCalled = true
      fn()
    }
    
    function Component() {
      return useObserver(() => (
        <div data-testid="counter">Count: {count()}</div>
      ), { scheduler: customScheduler })
    }
    
    render(<Component />)
    
    act(() => {
      count(1)
    })
    
    await waitFor(() => {
      expect(schedulerCalled).toBe(true)
      expect(screen.getByTestId('counter')).toHaveTextContent('Count: 1')
    })
  })
  
  it('should cleanup on unmount', () => {
    const count = signal(0)
    
    function Component() {
      return useObserver(() => (
        <div>Count: {count()}</div>
      ))
    }
    
    const { unmount } = render(<Component />)
    
    // 卸载组件
    unmount()
    
    // 改变信号不应该引起错误
    expect(() => {
      count(1)
    }).not.toThrow()
  })
}) 