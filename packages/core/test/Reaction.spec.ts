import EficyController from '../src/core/Controller';
import { expect } from 'vitest';

const basicData = {
  views: [
    {
      '#': 'alert',
      '#view': 'Alert',
      message: 'Hello this is a Login demo ',
      type: 'info',
      showIcon: true,
    },
    {
      '#': 'alert2',
      '#view': 'Alert',
      message: 'Hello ${models.input.value}',
      type: 'info',
      showIcon: true,
    },
    {
      '#': 'input',
      '#view': 'Input',
      value: 'value',
    },
  ],
  reactions: [
    {
      expression: (ctrl) => ctrl.models.input.value,
      effect: (effectResult, ctrl) => (ctrl.models.alert.message = effectResult),
    },
  ],
};

const controller = new EficyController(basicData);

test('init reaction', (t) => {
  expect(controller.models.alert.message).toBe('value');
  expect(controller.models.alert2.message).toBe('Hello value');
});

test('basic reaction', (t) => {
  controller.models.input.value = 'test1';

  expect(controller.models.alert.message).toBe('test1');
  expect(controller.models.alert2.message).toBe('Hello test1');
});
