import test from 'ava';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import resolver from '../src/core/resolver';
import React from 'react';

configure({ adapter: new Adapter() });

const testComponents = { testComponent1: props => <div>{props.render && props.render()}</div> };

const basicData = {
  '#': 'form',
  '#view': 'testComponent1',
  className: 'test',
  render: text => ({
    '#view': 'a',
    className: 'test-item1',
    '#content': text,
  }),
};

const wrapper = mount(resolver(basicData, { componentMap: testComponents }));

test('transformFunctionResult test', t => {
  t.is(wrapper.find(`a.test-item1`).length, 1);
});
