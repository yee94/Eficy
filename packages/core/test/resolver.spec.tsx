import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import resolver from '../src/core/resolver';
import React from 'react';
import { expect } from 'vitest';

configure({ adapter: new Adapter() });

const testComponents = { testComponent1: (props) => <div>{props.render && props.render()}</div> };

const basicData = {
  '#': 'form',
  '#view': 'testComponent1',
  className: 'test',
  render: (text) => ({
    '#view': 'a',
    className: 'test-item1',
    '#content': text,
  }),
};

const wrapper = mount(resolver(basicData, { componentMap: testComponents }));

test('transformFunctionResult test', (t) => {
  expect(wrapper.find(`a.test-item1`).length).toBe(1);
});

test('test #if', (t) => {
  const data = Object.assign(basicData, { '#if': false });
  expect(resolver(data, { componentMap: testComponents })).toBe(null);
});
