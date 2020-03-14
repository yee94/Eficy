import EficyModel from '../src/components/EficyComponent/EficyModel';
import { ViewNode } from '../src/models';
import test from 'ava';
import EficyController from '../src/core/Controller';

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const basicData = {
  '#': 'form',
  '#view': 'div',
  className: 'test',
  '#children': [
    {
      '#': 'formItem',
      '#view': 'span',
    },
    {
      '#': 'eficyComponent',
      '#view': 'Eficy',
      views: [
        {
          '#': 'message',
          '#view': 'span',
          value: 'spanContent',
        },
        {
          '#': 'message2',
          '#view': 'span',
        },
      ],
    },
  ],
};

const viewNode = new ViewNode(basicData, { Eficy: EficyModel });

test('view Schema has Eficy child', t => {
  t.true(Object.keys(viewNode.viewDataMap).includes('eficyComponent'));
});

test('view Schema did not has child of Eficy', t => {
  t.false(Object.keys(viewNode.viewDataMap).includes('message'));
});

test('special model', t => {
  t.true(viewNode.viewDataMap.eficyComponent instanceof EficyModel);
});

test('eficy scope viewDataMap', t => {
  t.is(Object.keys(viewNode.viewDataMap.eficyComponent.viewDataMap).length, 1);
});

const controller = new EficyController({
  views: [basicData],
});

mount(controller.resolver());

test('children controller whether loaded', t => {
  const eficyModel = controller.models.eficyComponent;
  t.true(eficyModel instanceof EficyModel);

  const childrenController = eficyModel.controller;
  t.true(childrenController instanceof EficyController);
  t.true(childrenController.parentController === controller);
});

test('parent get children models', t => {
  t.is(controller.models.eficyComponent.models.message.value, 'spanContent');
});

test('children get parent models', t => {
  const eficyModel = controller.models.eficyComponent;
  t.is(eficyModel.parentModels.formItem['#view'], 'span');
});
