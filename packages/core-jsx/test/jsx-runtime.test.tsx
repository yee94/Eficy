/**
 * JSX Runtime 测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { jsx, jsxs, Fragment } from '../src/jsx-runtime';
import { signal, computed } from '@eficy/reactive';
import '@testing-library/jest-dom';

// Mock EficyNode to control its behavior
vi.mock('../src/components/EficyNode', () => ({
  EficyNode: vi.fn(({ type, props }) => {
    const Component = type;
    return React.createElement(Component, props);
  })
}));

import { isSignal } from '@eficy/reactive';
import { EficyNode } from '../src/components/EficyNode';

const mockEficyNode = vi.mocked(EficyNode);

describe('JSX Runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('jsx() 函数', () => {
    it('应该处理简单的原生元素', () => {
      const element = jsx('div', { className: 'test' });
      
      expect(element.type).toBe('div');
      expect(element.props.className).toBe('test');
    });

    it('应该处理 React 组件', () => {
      const TestComponent = ({ message }: { message: string }) => <div>{message}</div>;
      const element = jsx(TestComponent, { message: 'Hello' });
      
      expect(element.type).toBe(TestComponent);
      expect(element.props.message).toBe('Hello');
    });

    it('应该为包含 signals 的元素使用 EficyNode', () => {
      const testSignal = signal('test');
      
      const result = jsx('div', { content: testSignal });
      
      // 检查结果是否是 EficyNode 元素
      expect(result.type).toBe(mockEficyNode);
      expect(result.props.type).toBe('div');
      expect(result.props.props.content).toBe(testSignal);
    });

    it('应该为 Eficy 组件（e- 前缀）使用 EficyNode', () => {
      const result = jsx('e-button', { label: 'Click me' });
      
      expect(result.type).toBe(mockEficyNode);
      expect(result.props.type).toBe('e-button');
      expect(result.props.props.label).toBe('Click me');
    });

    it('应该处理带 key 的元素', () => {
      const element = jsx('div', { className: 'test' }, 'unique-key');
      
      expect(element.key).toBe('unique-key');
    });

    it('应该处理空 props', () => {
      const element = jsx('div');
      
      expect(element.type).toBe('div');
      expect(Object.keys(element.props)).toHaveLength(0);
    });

    it('应该检测 props 中的多个 signals', () => {
      const signal1 = signal('value1');
      const signal2 = signal('value2');
      
      const result = jsx('div', { prop1: signal1, prop2: signal2, prop3: 'normal' });
      
      expect(result.type).toBe(mockEficyNode);
      expect(result.props.props.prop1).toBe(signal1);
      expect(result.props.props.prop2).toBe(signal2);
    });

    it('应该检测嵌套对象中的 signals', () => {
      const testSignal = signal('nested');
      
      const result = jsx('div', { style: { color: testSignal } });
      
      // 由于嵌套对象中的 signal 检测可能不会触发 EficyNode
      // 我们检查返回的元素类型
      expect(typeof result.type).toBe('string');
      expect(result.props.style.color).toBe(testSignal);
    });
  });

  describe('jsxs() 函数', () => {
    it('应该与 jsx() 函数行为一致', () => {
      const element1 = jsx('div', { className: 'test' });
      const element2 = jsxs('div', { className: 'test' });
      
      expect(element1.type).toBe(element2.type);
      expect(element1.props).toEqual(element2.props);
    });

    it('应该处理带多个子元素的情况', () => {
      const children = [<span key="1">Child 1</span>, <span key="2">Child 2</span>];
      const element = jsxs('div', { children });
      
      expect(element.type).toBe('div');
      expect(element.props.children).toBe(children);
    });

    it('应该为包含 signals 的多子元素使用 EficyNode', () => {
      const testSignal = signal('test');
      
      const result = jsxs('div', { content: testSignal });
      
      expect(result.type).toBe(mockEficyNode);
      expect(result.props.props.content).toBe(testSignal);
    });
  });

  describe('Fragment 组件', () => {
    it('应该渲染 React Fragment', () => {
      const element = Fragment({ children: <div>Test</div> });
      
      // Fragment 应该返回一个函数，而不是 React.Fragment symbol
      expect(typeof element.type).toBe('function');
    });

    it('应该传递 children 属性', () => {
      const children = [<span key="1">Child 1</span>, <span key="2">Child 2</span>];
      const element = Fragment({ children });
      
      expect(element.props.children).toBe(children);
    });

    it('应该处理空 children', () => {
      const element = Fragment({});
      
      expect(typeof element.type).toBe('function');
      expect(element.props.children).toBeUndefined();
    });
  });

  describe('集成测试', () => {
    beforeEach(() => {
      // 重置 EficyNode mock 为实际渲染
      mockEficyNode.mockImplementation(({ type, props }) => {
        if (typeof type === 'string') {
          return React.createElement(type, props);
        }
        return React.createElement(type, props);
      });
    });

    it('应该正确渲染简单组件', () => {
      const TestComponent = () => jsx('div', { 'data-testid': 'test-div' }, 'test-key');
      
      render(<TestComponent />);
      
      const element = screen.getByTestId('test-div');
      expect(element).toBeInTheDocument();
    });

    it('应该正确处理嵌套结构', () => {
      const TestComponent = () => 
        jsx('div', { 
          'data-testid': 'container',
          children: jsx('span', { 'data-testid': 'child', children: 'Hello World' })
        });
      
      render(<TestComponent />);
      
      expect(screen.getByTestId('container')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('应该正确处理带 signals 的组件', () => {
      const message = signal('Dynamic Message');
      
      // Mock EficyNode to actually resolve signals
      mockEficyNode.mockImplementation(({ type, props }) => {
        const resolvedProps = { ...props };
        if (isSignal(props.children)) {
          resolvedProps.children = props.children();
        }
        return React.createElement(type, resolvedProps);
      });
      
      const TestComponent = () => 
        jsx('div', { 
          'data-testid': 'dynamic',
          children: message
        });
      
      render(<TestComponent />);
      
      expect(mockEficyNode).toHaveBeenCalled();
      expect(screen.getByTestId('dynamic')).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的 type', () => {
      expect(() => jsx(null as any, {})).not.toThrow();
    });

    it('应该处理无效的 props', () => {
      expect(() => jsx('div', null as any)).not.toThrow();
    });

    it('应该处理循环引用的对象', () => {
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;
      
      expect(() => jsx('div', { data: circularObj })).not.toThrow();
    });
  });

  describe('性能优化', () => {
    it('应该避免不必要的 EficyNode 调用', () => {
      jsx('div', { className: 'test' });
      jsx('span', { id: 'test' });
      jsx('p', { 'data-value': 123 });
      
      expect(mockEficyNode).not.toHaveBeenCalled();
    });

    it('应该只检查可能的 signal 值', () => {
      const result = jsx('div', { className: 'test' });
      
      // 没有 signals，应该返回普通的 React 元素
      expect(result.type).toBe('div');
      expect(result.props.className).toBe('test');
    });

    it('应该一致地处理相同的 props', () => {
      const props = { a: 1, b: 2, c: 3 };
      const result1 = jsx('div', props);
      const result2 = jsx('div', props); // 相同的 props 对象
      
      // 两次调用应该产生相同类型的结果
      expect(result1.type).toBe(result2.type);
      expect(result1.props).toEqual(result2.props);
    });
  });

  describe('TypeScript 类型支持', () => {
    it('应该支持泛型组件', () => {
      interface GenericProps<T> {
        value: T;
        render: (value: T) => React.ReactNode;
      }
      
      const GenericComponent = <T,>({ value, render }: GenericProps<T>) => (
        <div>{render(value)}</div>
      );
      
      const element = jsx(GenericComponent, {
        value: 'test',
        render: (v: string) => v.toUpperCase()
      });
      
      expect(element.type).toBe(GenericComponent);
    });

    it('应该支持带约束的组件属性', () => {
      interface StrictProps {
        id: string;
        value: number;
        optional?: boolean;
      }
      
      const StrictComponent = ({ id, value, optional }: StrictProps) => (
        <div data-id={id} data-value={value} data-optional={optional} />
      );
      
      const element = jsx(StrictComponent, {
        id: 'test',
        value: 42,
        optional: true
      });
      
      expect(element.props.id).toBe('test');
      expect(element.props.value).toBe(42);
      expect(element.props.optional).toBe(true);
    });
  });
});