/**
 * @eficy/browser JSX Runtime Tests
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { jsx, jsxs, Fragment } from '../src/jsx-runtime.js';

describe('JSX Runtime', () => {
  it('should create JSX elements', () => {
    const element = jsx('div', { className: 'test' }, 'key1');
    
    expect(element).toBeDefined();
    expect(element.type).toBe('div');
    expect(element.props.className).toBe('test');
    expect(element.key).toBe('key1');
  });

  it('should create JSX elements with children', () => {
    const element = jsxs('div', { children: ['Hello', 'World'] }, 'key2');
    
    expect(element).toBeDefined();
    expect(element.type).toBe('div');
    expect(element.props.children).toEqual(['Hello', 'World']);
  });

  it('should create Fragment elements', () => {
    const element = Fragment({ children: ['Hello', 'World'] });
    
    expect(element).toBeDefined();
    expect(element.type).toBe(React.Fragment);
    expect(element.props.children).toEqual(['Hello', 'World']);
  });

  it('should handle signal props', () => {
    const mockSignal = () => 'signal-value';
    const element = jsx('div', { value: mockSignal }, 'key3');
    
    expect(element).toBeDefined();
    expect(element.props.value).toBe(mockSignal);
  });

  it('should handle component types', () => {
    const TestComponent = () => React.createElement('div', null, 'Test');
    const element = jsx(TestComponent, { prop: 'value' }, 'key4');
    
    expect(element).toBeDefined();
    expect(element.type).toBe(TestComponent);
    expect(element.props.prop).toBe('value');
  });
}); 