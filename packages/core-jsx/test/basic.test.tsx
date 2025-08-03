/** @jsxImportSource eficy */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { signal } from '@eficy/reactive';
import { Eficy, EficyProvider } from '@eficy/core-jsx';
import { SFragment } from '@eficy/reactive-react';

describe('Eficy Core V3 Basic Tests', () => {
  describe('EficyCore', () => {
    it('应该能够创建核心实例', () => {
      const core = new Eficy();

      expect(core).toBeDefined();
      expect(core.componentRegistry).toBeDefined();
      expect(core.pluginManager).toBeDefined();
      expect(core.eventEmitter).toBeDefined();
    });

    it('应该能够注册组件', () => {
      const core = new Eficy();
      const TestComponent = () => <div>Test</div>;

      core.registerComponent('TestComponent', TestComponent);

      expect(core.getComponent('TestComponent')).toBe(TestComponent);
    });

    it('应该能够批量注册组件', () => {
      const core = new Eficy();
      const Component1 = () => <div>1</div>;
      const Component2 = () => <div>2</div>;

      core.registerComponents({
        Component1,
        Component2,
      });

      expect(core.getComponent('Component1')).toBe(Component1);
      expect(core.getComponent('Component2')).toBe(Component2);
    });

    it('应该能够创建子实例', () => {
      const core = new Eficy();
      const TestComponent = () => <div>Test</div>;

      core.registerComponent('TestComponent', TestComponent);

      const child = core.createChild();

      expect(child).toBeDefined();
      expect(child.getComponent('TestComponent')).toBe(TestComponent);
    });
  });

  describe('EficyProvider', () => {
    it('应该能够渲染基本内容', () => {
      const core = new Eficy();

      render(
        <EficyProvider core={core}>
          <div data-testid="content">Hello World</div>
        </EficyProvider>,
      );

      expect(screen.getByTestId('content')).toHaveTextContent('Hello World');
    });

    it('应该能够处理组件映射', () => {
      const core = new Eficy();
      const CustomButton = ({ children, ...props }: any) => (
        <button data-testid="custom-button" {...props}>
          {children}
        </button>
      );

      render(
        <EficyProvider core={core}>
          <CustomButton>Click me</CustomButton>
        </EficyProvider>,
      );

      expect(screen.getByTestId('custom-button')).toHaveTextContent('Click me');
    });
  });

  describe('Signals Integration', () => {
    it('应该处理包含 signals 的简单场景', () => {
      const core = new Eficy();
      const count = signal(0);

      function TestComponent() {
        return <div data-testid="signal-content">Count: {count()}</div>;
      }

      render(
        <EficyProvider core={core}>
          <TestComponent />
        </EficyProvider>,
      );

      expect(screen.getByTestId('signal-content')).toHaveTextContent('Count: 0');
    });
    it('应该有响应式更新', async () => {
      const core = new Eficy();
      const count = signal(0);

      function TestComponent() {
        return (
          <div data-testid="signal-content" data-count={count}>
            Count: {count as any}
          </div>
        );
      }

      render(
        <EficyProvider core={core}>
          <TestComponent />
        </EficyProvider>,
      );

      expect(screen.getByTestId('signal-content')).toHaveTextContent('Count: 0');
      expect(screen.getByTestId('signal-content')).toHaveAttribute('data-count', '0');
      count(1);
      await waitFor(() => {
        expect(screen.getByTestId('signal-content')).toHaveTextContent('Count: 1');
        expect(screen.getByTestId('signal-content')).toHaveAttribute('data-count', '1');
      });
    });
  });

  describe('JSX Runtime', () => {
    it('应该正确处理普通的 JSX 元素', () => {
      const core = new Eficy();

      render(
        <EficyProvider core={core}>
          <div data-testid="jsx-test">
            <span>Normal JSX</span>
          </div>
        </EficyProvider>,
      );

      expect(screen.getByTestId('jsx-test')).toHaveTextContent('Normal JSX');
    });

    it('应该正确处理嵌套元素', async () => {
      const core = new Eficy();

      render(
        <EficyProvider core={core}>
          <div data-testid="nested">
            <header>
              <h1>Title</h1>
            </header>
            <main>
              <p>Content</p>
            </main>
          </div>
        </EficyProvider>,
      );

      const element = screen.getByTestId('nested');
      expect(element.querySelector('h1')).toHaveTextContent('Title');
      expect(element.querySelector('p')).toHaveTextContent('Content');
    });
  });
});
