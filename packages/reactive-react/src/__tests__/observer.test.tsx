import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { signal, action } from '@eficy/reactive'
import { observer } from '../observer'

describe('observer', () => {
  it('should re-render when observable changes', async () => {
    const count = signal(0)
    
    const Counter = observer(() => (
      <div data-testid="counter">Count: {count()}</div>
    ))
    
    render(<Counter />)
    expect(screen.getByTestId('counter')).toHaveTextContent('Count: 0')
    
    act(() => {
      count(1)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('counter')).toHaveTextContent('Count: 1')
    })
  })

  it('should work with action', async () => {
    const count = signal(0)
    
    const increment = action(() => {
      count(count() + 1)
    })
    
    const Counter = observer(() => (
      <div>
        <span data-testid="counter">Count: {count()}</span>
        <button data-testid="increment" onClick={increment}>+1</button>
      </div>
    ))
    
    render(<Counter />)
    expect(screen.getByTestId('counter')).toHaveTextContent('Count: 0')
    
    act(() => {
      fireEvent.click(screen.getByTestId('increment'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('counter')).toHaveTextContent('Count: 1')
    })
  })
  
  it('should handle props correctly', async () => {
    const count = signal(0)
    
    const Counter = observer<{ prefix: string }>((props) => (
      <div data-testid="counter">{props.prefix}: {count()}</div>
    ))
    
    const { rerender } = render(<Counter prefix="Count" />)
    expect(screen.getByTestId('counter')).toHaveTextContent('Count: 0')
    
    // 改变 props
    rerender(<Counter prefix="Value" />)
    expect(screen.getByTestId('counter')).toHaveTextContent('Value: 0')
    
    // 改变 observable
    act(() => {
      count(5)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('counter')).toHaveTextContent('Value: 5')
    })
  })
  
  it('should not re-render when non-observable value changes', () => {
    let renderCount = 0
    let nonObservableValue = 0
    
    const Component = observer(() => {
      renderCount++
      return <div>Render count: {renderCount}, Value: {nonObservableValue}</div>
    })
    
    render(<Component />)
    
    // 允许初始的多次渲染（React Strict Mode）
    const initialRenderCount = renderCount
    expect(initialRenderCount).toBeGreaterThanOrEqual(1)
    
    // 更改非响应式值不应该触发重新渲染
    nonObservableValue = 100
    
    // 等待一小段时间确保没有额外渲染
    setTimeout(() => {
      expect(renderCount).toBe(initialRenderCount)
    }, 50)
  })
  
  it('should handle displayName option', () => {
    const Component = observer(() => <div>Test</div>, {
      displayName: 'TestComponent'
    })
    
    expect(Component.displayName).toBe('TestComponent')
  })
}) 