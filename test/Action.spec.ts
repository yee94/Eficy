import test from 'ava';
import Controller from '../src/core/Controller';

const controller = new Controller({
  views: [
    {
      '#': 'alert',
      '#view': 'Alert',
      message: 'Hello this is a Login demo',
    },
  ],
});

test('base actions', t => {
  // @ts-ignore
  t.is(!!Object.keys(controller.actions).length, true);
});

let result: any = false;
test.serial('add base action', t => {
  const newAction = { testAction: () => (result = true) };
  controller.bindActions(newAction);

  // @ts-ignore
  t.is(!!controller.actions.testAction, true);
});

test('run action', t => {
  controller.run({ action: 'testAction', data: {} });

  t.is(result, true);
});

test('replace action result variable', t => {
  result = '';
  const newAction = { testUpdate: str => (result = str) };
  controller.bindActions(newAction);
  controller.run({ action: 'testUpdate', data: '${models.alert.message}' });

  t.is(result, 'Hello this is a Login demo');
});
