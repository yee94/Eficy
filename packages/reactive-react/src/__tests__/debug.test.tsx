import { createAction, effect, signal } from '@eficy/reactive';
import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useObserver } from '../hooks/useObserver';

describe('Debug Tests', () => {
  it('should understand how signals and effects work', () => {
    const count = signal(0);
    let effectCallCount = 0;
    let lastValue: number;

    // 创建一个 effect 来监听 signal
    const dispose = effect(() => {
      effectCallCount++;
      lastValue = count.value;
      console.log(`Effect called ${effectCallCount}, value: ${lastValue}`);
    });

    console.log(`Initial: effectCallCount=${effectCallCount}, value=${lastValue}`);
    expect(effectCallCount).toBe(1); // effect 应该立即执行一次
    expect(lastValue!).toBe(0);

    // 直接修改 signal
    console.log('Directly modifying signal...');
    count.value = 1;

    console.log(`After direct modification: effectCallCount=${effectCallCount}, value=${lastValue}`);
    expect(effectCallCount).toBe(2); // effect 应该再次执行
    expect(lastValue!).toBe(1);

    // 通过 action 修改
    const increment = createAction(() => {
      console.log('Inside action, setting count to 2');
      count.value = 2;
    });

    console.log('Modifying through action...');
    increment();

    console.log(`After action: effectCallCount=${effectCallCount}, value=${lastValue}`);
    expect(effectCallCount).toBe(3); // effect 应该再次执行
    expect(lastValue!).toBe(2);

    dispose();
  });

  it('should make components reactive to signal changes', async () => {
    const count = signal(0);
    let renderCount = 0;

    function TestComponent() {
      return useObserver(() => {
        renderCount++;
        console.log(`Render ${renderCount}, count: ${count.value}`);
        return <div data-testid="count">{count.value}</div>;
      });
    }

    console.log('Initial render...');
    render(<TestComponent />);

    console.log(`After initial render: renderCount=${renderCount}`);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    // 允许多次初始渲染（React Strict Mode 或我们的实现可能导致这种情况）
    expect(renderCount).toBeGreaterThanOrEqual(1);

    const initialRenderCount = renderCount;

    console.log('Directly modifying signal...');
    act(() => {
      count.value = 1;
    });

    // 等待组件重新渲染和 DOM 更新
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    console.log(`After signal modification: renderCount=${renderCount}`);
    // 关键测试：组件应该重新渲染
    expect(renderCount).toBeGreaterThan(initialRenderCount);

    // 再次测试更新
    const secondRenderCount = renderCount;
    act(() => {
      count.value = 2;
    });

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });

    console.log(`After second signal modification: renderCount=${renderCount}`);
    expect(renderCount).toBeGreaterThan(secondRenderCount);
  });
});
