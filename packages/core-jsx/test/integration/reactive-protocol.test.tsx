import { bind, signal } from '@eficy/reactive';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../src/contexts/EficyContext', () => ({
  useEficyContext: () => null,
}));

import { EficyNode } from '../../src/components/EficyNode';
import { jsx, jsxs } from '../../src/jsx-runtime';

describe('Reactive $ Protocol Integration', () => {
  describe('Smart bypass - static nodes', () => {
    it('static elements should not use EficyNode wrapper', () => {
      const element = jsx('div', { className: 'test', id: 'static' });

      expect(element.type).toBe('div');
      expect(element.props.className).toBe('test');
    });

    it('static nested structure renders correctly', () => {
      const TestComponent = () =>
        jsx('div', {
          'data-testid': 'parent',
          children: [jsx('span', { children: 'child1', key: '1' }), jsx('span', { children: 'child2', key: '2' })],
        });

      render(<TestComponent />);

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByText('child1')).toBeInTheDocument();
      expect(screen.getByText('child2')).toBeInTheDocument();
    });
  });

  describe('Reactive nodes with $ suffix', () => {
    it('$ suffix props trigger EficyNode wrapper', () => {
      const sig = signal('reactive');
      const element = jsx('div', { title$: sig });

      expect(element.type).toBe(EficyNode);
    });

    it('$ suffix props are resolved to actual values', () => {
      const titleSig = signal('Dynamic Title');

      render(<EficyNode type="div" props={{ 'data-testid': 'test', title$: titleSig }} />);

      expect(screen.getByTestId('test')).toHaveAttribute('title', 'Dynamic Title');
    });

    it('Signal changes trigger re-render', async () => {
      const textSig = signal('initial');

      render(<EficyNode type="div" props={{ 'data-testid': 'reactive', children: textSig }} />);

      expect(screen.getByTestId('reactive')).toHaveTextContent('initial');

      await act(() => {
        textSig.value = 'updated';
      });

      expect(screen.getByTestId('reactive')).toHaveTextContent('updated');
    });
  });

  describe('bind() integration', () => {
    it('bind() generates value$ for reactive protocol', () => {
      const nameSig = signal('test');
      const props = bind(nameSig);

      expect(props).toHaveProperty('value$');
      expect(props.value$).toBe(nameSig);
    });

    it('bind() with EficyNode creates working input', async () => {
      const valueSig = signal('initial');
      const bindProps = bind(valueSig);

      render(<EficyNode type="input" props={{ 'data-testid': 'input', ...bindProps }} />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('initial');

      fireEvent.change(input, { target: { value: 'changed' } });
      expect(valueSig.value).toBe('changed');
    });

    it('bind() with custom keys works correctly', () => {
      const selectedSig = signal('option1');
      const props = bind(selectedSig, { valueKey: 'selected', eventKey: 'onSelect' });

      expect(props).toHaveProperty('selected$');
      expect(props).toHaveProperty('onSelect');
      expect(props.selected$).toBe(selectedSig);
    });
  });

  describe('e- prefix components', () => {
    it('e- prefix always uses EficyNode', () => {
      const element = jsx('e-Button', { label: 'Click' });

      expect(element.type).toBe(EficyNode);
      expect(element.props.type).toBe('e-Button');
    });
  });

  describe('Mixed static and reactive', () => {
    it('handles mixed props correctly', () => {
      const dynamicSig = signal('dynamic');

      render(
        <EficyNode
          type="div"
          props={{
            'data-testid': 'mixed',
            className: 'static-class',
            title$: dynamicSig,
            children: 'content',
          }}
        />,
      );

      const div = screen.getByTestId('mixed');
      expect(div).toHaveClass('static-class');
      expect(div).toHaveAttribute('title', 'dynamic');
      expect(div).toHaveTextContent('content');
    });
  });

  describe('Children with Signals', () => {
    it('Signal children trigger EficyNode wrapper', () => {
      const childSig = signal('signal child');
      const element = jsx('div', { children: childSig });

      expect(element.type).toBe(EficyNode);
    });

    it('Array children with Signal trigger EficyNode wrapper', () => {
      const sig = signal('dynamic');
      const element = jsxs('div', { children: ['static', sig] });

      expect(element.type).toBe(EficyNode);
    });
  });
});
