import { signal } from '@eficy/reactive';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../src/contexts/EficyContext', () => ({
  useEficyContext: () => null,
}));

import { EficyNode } from '../../src/components/EficyNode';

describe('EficyNode $ suffix resolution', () => {
  it('should resolve value$ to value with signal value', () => {
    const sig = signal('test-value');

    render(<EficyNode type="input" props={{ value$: sig, className: 'static' }} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test-value');
    expect(input).toHaveClass('static');
  });

  it('should resolve multiple $ suffix props', () => {
    const valueSig = signal('hello');
    const placeholderSig = signal('enter text');

    render(
      <EficyNode
        type="input"
        props={{
          value$: valueSig,
          placeholder$: placeholderSig,
          className: 'test-class',
        }}
      />,
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('hello');
    expect(input).toHaveAttribute('placeholder', 'enter text');
    expect(input).toHaveClass('test-class');
  });

  it('should update when $ suffix signal changes', async () => {
    const sig = signal('initial');

    render(<EficyNode type="div" props={{ 'data-testid': 'test', children: sig }} />);

    expect(screen.getByTestId('test')).toHaveTextContent('initial');

    await act(() => {
      sig.value = 'updated';
    });

    expect(screen.getByTestId('test')).toHaveTextContent('updated');
  });

  it('should handle mixed static and reactive props', () => {
    const sig = signal(true);

    render(
      <EficyNode
        type="button"
        props={{
          disabled$: sig,
          className: 'btn',
          type: 'submit',
          children: 'Click',
        }}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should preserve non-$ props unchanged', () => {
    render(
      <EficyNode
        type="div"
        props={{
          id: 'my-id',
          className: 'my-class',
          'data-custom': 'custom-value',
          children: 'content',
        }}
      />,
    );

    const div = screen.getByText('content');
    expect(div).toHaveAttribute('id', 'my-id');
    expect(div).toHaveClass('my-class');
    expect(div).toHaveAttribute('data-custom', 'custom-value');
  });
});
