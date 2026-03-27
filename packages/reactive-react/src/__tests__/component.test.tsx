import { signal } from '@eficy/reactive';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { component } from '../component';

describe('component() helper', () => {
  it('should return a reactive component', () => {
    const TestComponent = component(() => {
      return <div data-testid="test">Hello</div>;
    });

    render(<TestComponent />);
    expect(screen.getByTestId('test')).toHaveTextContent('Hello');
  });

  it('should re-render when signal changes', async () => {
    const count = signal(0);

    const Counter = component(() => {
      return <div data-testid="count">{count.value}</div>;
    });

    render(<Counter />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');

    act(() => {
      count.value = 5;
    });

    expect(screen.getByTestId('count')).toHaveTextContent('5');
  });

  it('should accept and pass props correctly', () => {
    interface Props {
      name: string;
      age: number;
    }

    const Greeting = component<Props>(({ name, age }) => {
      return (
        <div data-testid="greeting">
          Hello {name}, you are {age} years old
        </div>
      );
    });

    render(<Greeting name="Alice" age={25} />);
    expect(screen.getByTestId('greeting')).toHaveTextContent('Hello Alice, you are 25 years old');
  });

  it('should set displayName correctly', () => {
    function MyComponent() {
      return <div>Named</div>;
    }
    const NamedComponent = component(MyComponent);

    expect(NamedComponent.displayName).toBe('Observer(MyComponent)');
  });

  it('should work with external signals', async () => {
    const localCount = signal(0);

    const Counter = component(() => {
      return (
        <div>
          <span data-testid="local-count">{localCount.value}</span>
          <button
            data-testid="increment"
            onClick={() => {
              localCount.value = localCount.value + 1;
            }}
          >
            +
          </button>
        </div>
      );
    });

    render(<Counter />);
    expect(screen.getByTestId('local-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('increment'));
    expect(screen.getByTestId('local-count')).toHaveTextContent('1');
  });

  it('should be equivalent to observer()', async () => {
    const sharedSignal = signal('initial');

    const ComponentA = component(() => {
      return <div data-testid="a">{sharedSignal.value}</div>;
    });

    render(<ComponentA />);
    expect(screen.getByTestId('a')).toHaveTextContent('initial');

    act(() => {
      sharedSignal.value = 'updated';
    });

    expect(screen.getByTestId('a')).toHaveTextContent('updated');
  });
});
