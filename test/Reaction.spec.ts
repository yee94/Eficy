import test from 'ava';
import EficyController from '../src/core/Controller';

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
      expression: ctrl => ctrl.models.input.value,
      effect: (effectResult, ctrl) => (ctrl.models.alert.message = effectResult),
    },
  ],
};

const controller = new EficyController(basicData);

test('init reaction', t => {
  // @ts-ignore
  t.is(controller.models.alert.message, 'value');
  // @ts-ignore
  t.is(controller.models.alert2.message, 'Hello value');
});

test('basic reaction', t => {
  // @ts-ignore
  controller.models.input.value = 'test1';

  // @ts-ignore
  t.is(controller.models.alert.message, 'test1');
  // @ts-ignore
  t.is(controller.models.alert2.message, 'Hello test1');
});
