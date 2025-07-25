import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import resolver from '../src/core/resolver';
import React from 'react';
import { expect } from 'vitest';

const testComponents = {
  testComponent1: (props) => <div>{props.render?.()}</div>,
};

const basicData = {
  '#': 'form',
  '#view': 'testComponent1',
  className: 'test',
  render: () => ({
    '#view': 'a',
    className: 'test-item1',
    '#content': 'test',
  }),
};

test('transformFunctionResult test', (t) => {
  const { container } = render(resolver(basicData, { componentMap: testComponents }));
  
  // 断言渲染的 div 存在（testComponent1 渲染的容器）
  expect(container.firstChild).toBeTruthy();
  
  // 查找 a 标签（通过 className）
  const aElement = container.querySelector('a.test-item1');
  expect(aElement).toBeTruthy();
  expect(aElement.textContent).toBe('test');
});

test('test #if', (t) => {
  const data = Object.assign({}, basicData, { '#if': false });
  expect(resolver(data, { componentMap: testComponents })).toBe(null);
});
