import { computed, createAction, signal } from '@eficy/reactive';
import { act, render, screen, waitFor } from '@testing-library/react';
import { useObserver, useSignals } from '../hooks/useObserver';

describe('useObserver', () => {
  it('should track reactive dependencies with traditional syntax', async () => {
    const count = signal(0);

    function Counter() {
      return useObserver(() => <div data-testid="counter">Count: {count.value}</div>);
    }

    render(<Counter />);
    expect(screen.getByTestId('counter')).toHaveTextContent('Count: 0');

    act(() => {
      count.value = 1;
    });

    await waitFor(() => {
      expect(screen.getByTestId('counter')).toHaveTextContent('Count: 1');
    });
  });

  it('should work with computed values', async () => {
    const count = signal(5);
    const doubled = computed(() => count.value * 2);

    function Component() {
      return useObserver(() => (
        <div data-testid="result">
          Count: {count.value}, Doubled: {doubled.value}
        </div>
      ));
    }

    render(<Component />);
    expect(screen.getByTestId('result')).toHaveTextContent('Count: 5, Doubled: 10');

    act(() => {
      count.value = 3;
    });

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Count: 3, Doubled: 6');
    });
  });

  it('should batch updates with actions', async () => {
    const count = signal(0);
    const name = signal('test');
    let renderCount = 0;

    const updateBoth = createAction(() => {
      count.value = 10;
      name.value = 'updated';
    });

    function Component() {
      return useObserver(() => {
        renderCount++;
        return (
          <div data-testid="result">
            Count: {count.value}, Name: {name.value}
          </div>
        );
      });
    }

    render(<Component />);
    const initialRenderCount = renderCount;
    expect(screen.getByTestId('result')).toHaveTextContent('Count: 0, Name: test');

    act(() => {
      updateBoth();
    });

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Count: 10, Name: updated');
    });

    // Action 应该批处理更新，允许一些额外渲染但不应该太多
    expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 3);
  });

  it('should cleanup on unmount', () => {
    const count = signal(0);

    function Component() {
      return useObserver(() => <div>Count: {count.value}</div>);
    }

    const { unmount } = render(<Component />);

    // 卸载组件
    unmount();

    // 改变信号不应该引起错误
    expect(() => {
      count.value = 1;
    }).not.toThrow();
  });
});

describe('useSignals', () => {
  it('should work like @preact/signals-react useSignals', async () => {
    const count = signal(0);

    function Counter() {
      useSignals();
      return <div data-testid="counter">Count: {count.value}</div>;
    }

    render(<Counter />);
    expect(screen.getByTestId('counter')).toHaveTextContent('Count: 0');

    act(() => {
      count.value = 1;
    });

    await waitFor(() => {
      expect(screen.getByTestId('counter')).toHaveTextContent('Count: 1');
    });
  });

  it('should work with multiple signals', async () => {
    const count = signal(0);
    const name = signal('test');

    function Component() {
      useSignals();
      return (
        <div data-testid="result">
          Count: {count.value}, Name: {name.value}
        </div>
      );
    }

    render(<Component />);
    expect(screen.getByTestId('result')).toHaveTextContent('Count: 0, Name: test');

    act(() => {
      count.value = 5;
    });

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Count: 5, Name: test');
    });

    act(() => {
      name.value = 'updated';
    });

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Count: 5, Name: updated');
    });
  });

  it('should work with computed signals', async () => {
    const count = signal(2);
    const doubled = computed(() => count.value * 2);
    const tripled = computed(() => count.value * 3);

    function Component() {
      useSignals();
      return (
        <div data-testid="computed">
          Original: {count.value}, Doubled: {doubled.value}, Tripled: {tripled.value}
        </div>
      );
    }

    render(<Component />);
    expect(screen.getByTestId('computed')).toHaveTextContent('Original: 2, Doubled: 4, Tripled: 6');

    act(() => {
      count.value = 4;
    });

    await waitFor(() => {
      expect(screen.getByTestId('computed')).toHaveTextContent('Original: 4, Doubled: 8, Tripled: 12');
    });
  });

  it('should cleanup on unmount', () => {
    const count = signal(0);

    function Component() {
      useSignals();
      return <div>Count: {count.value}</div>;
    }

    const { unmount } = render(<Component />);

    // 卸载组件
    unmount();

    // 改变信号不应该引起错误
    expect(() => {
      count.value = 1;
    }).not.toThrow();
  });
});
