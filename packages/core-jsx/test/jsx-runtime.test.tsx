import { computed, signal } from '@eficy/reactive';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Fragment, jsx, jsxs } from '../src/jsx-runtime';
import '@testing-library/jest-dom';

import { EficyNode } from '../src/components/EficyNode';

vi.mock('../src/components/EficyNode', () => ({
  EficyNode: vi.fn(({ type, props }) => {
    const Component = type;
    return React.createElement(Component, props);
  }),
}));

const mockEficyNode = vi.mocked(EficyNode);

describe('JSX Runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Smart Bypass - Static nodes should NOT use EficyNode', () => {
    it('should bypass EficyNode for static native elements', () => {
      const element = jsx('div', { className: 'test', id: 'static' });

      expect(element.type).toBe('div');
      expect(element.props.className).toBe('test');
      expect(element.props.id).toBe('static');
      expect(mockEficyNode).not.toHaveBeenCalled();
    });

    it('should bypass EficyNode for static text children', () => {
      const element = jsx('span', { children: 'Hello World' });

      expect(element.type).toBe('span');
      expect(element.props.children).toBe('Hello World');
      expect(mockEficyNode).not.toHaveBeenCalled();
    });

    it('should bypass EficyNode for static array children', () => {
      const element = jsxs('div', { children: ['text1', 'text2', 123] });

      expect(element.type).toBe('div');
      expect(mockEficyNode).not.toHaveBeenCalled();
    });
  });

  describe('Smart Bypass - Reactive nodes SHOULD use EficyNode', () => {
    it('should use EficyNode when props have $ suffix', () => {
      const sig = signal('test');
      const element = jsx('div', { value$: sig, className: 'static' });

      expect(element.type).toBe(mockEficyNode);
      expect(element.props.props.value$).toBe(sig);
      expect(element.props.props.className).toBe('static');
    });

    it('should use EficyNode when children contain Signal', () => {
      const sig = signal('dynamic text');
      const element = jsx('div', { children: sig });

      expect(element.type).toBe(mockEficyNode);
      expect(element.props.props.children).toBe(sig);
    });

    it('should use EficyNode when children array contains Signal', () => {
      const sig = signal('dynamic');
      const element = jsxs('div', { children: ['static', sig, 'text'] });

      expect(element.type).toBe(mockEficyNode);
    });

    it('should use EficyNode for multiple $ suffix props', () => {
      const sig1 = signal('a');
      const sig2 = signal('b');
      const element = jsx('input', { value$: sig1, checked$: sig2 });

      expect(element.type).toBe(mockEficyNode);
    });
  });

  describe('e- prefix components should always use EficyNode', () => {
    it('should use EficyNode for e- prefixed components', () => {
      const element = jsx('e-Button', { label: 'Click me' });

      expect(element.type).toBe(mockEficyNode);
      expect(element.props.type).toBe('e-Button');
    });

    it('should use EficyNode for e- components even without reactive props', () => {
      const element = jsx('e-Input', { placeholder: 'Enter text' });

      expect(element.type).toBe(mockEficyNode);
    });
  });

  describe('jsx() function basic behavior', () => {
    it('should handle React components', () => {
      const TestComponent = ({ message }: { message: string }) => <div>{message}</div>;
      const element = jsx(TestComponent, { message: 'Hello' });

      expect(element.type).toBe(TestComponent);
      expect(element.props.message).toBe('Hello');
    });

    it('should handle key prop', () => {
      const element = jsx('div', { className: 'test' }, 'unique-key');
      expect(element.key).toBe('unique-key');
    });

    it('should handle empty props', () => {
      const element = jsx('div', {});
      expect(element.type).toBe('div');
    });

    it('should handle undefined props', () => {
      const element = jsx('div');
      expect(element.type).toBe('div');
    });
  });

  describe('jsxs() function', () => {
    it('should behave same as jsx for static content', () => {
      const element1 = jsx('div', { className: 'test' });
      const element2 = jsxs('div', { className: 'test' });

      expect(element1.type).toBe(element2.type);
    });

    it('should handle multiple static children', () => {
      const children = ['Child 1', 'Child 2', 'Child 3'];
      const element = jsxs('div', { children });

      expect(element.type).toBe('div');
      expect(element.props.children).toBe(children);
    });
  });

  describe('Integration tests', () => {
    it('should render static component correctly', () => {
      const TestComponent = () => jsx('div', { 'data-testid': 'test-div', children: 'content' });

      render(<TestComponent />);

      expect(screen.getByTestId('test-div')).toBeInTheDocument();
      expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('should render nested static structure', () => {
      const TestComponent = () =>
        jsx('div', {
          children: [jsx('h1', { children: 'Title', key: '1' }), jsx('p', { children: 'Content', key: '2' })],
        });

      render(<TestComponent />);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle null type', () => {
      expect(() => {
        jsx(null as any, {});
      }).not.toThrow();
    });

    it('should handle null props', () => {
      expect(() => {
        jsx('div', null as any);
      }).not.toThrow();
    });
  });
});
