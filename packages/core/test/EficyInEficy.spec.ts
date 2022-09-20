import EficyModel from '../src/components/EficyComponent/EficyModel';
import { ViewNode } from '../src/models';
import EficyController from '../src/core/Controller';
import { beforeEach, describe } from 'vitest';
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

test('view Schema has Eficy child', () => {
  expect(Object.keys(viewNode.viewDataMap).includes('eficyComponent')).toBeTruthy();
});

test('view Schema did not has child of Eficy', (t) => {
  expect(Object.keys(viewNode.viewDataMap).includes('message')).toBeFalsy();
});

test('special model', (t) => {
  expect(viewNode.viewDataMap.eficyComponent instanceof EficyModel).toBeTruthy();
});

test('eficy scope viewDataMap', (t) => {
  expect(Object.keys(viewNode.viewDataMap.eficyComponent.viewDataMap).length).toBe(1);
});

const controller = new EficyController({
  views: [basicData],
});

describe('render resolver', () => {
  beforeEach(() => {
    mount(controller.resolver());
  });

  test('children controller whether loaded', (t) => {
    const eficyModel = controller.models.eficyComponent;
    expect(eficyModel instanceof EficyModel).toBeTruthy();

    const childrenController = eficyModel.controller;
    expect(childrenController instanceof EficyController).toBeTruthy();
    expect(childrenController.parentController === controller).toBeTruthy();
  });

  test('parent get children models', (t) => {
    expect(controller.models.eficyComponent.models.message.value).toBe('spanContent');
  });

  test('children get parent models', (t) => {
    const eficyModel = controller.models.eficyComponent;
    expect(eficyModel.parentModels.formItem['#view']).toBe('span');
  });
});
