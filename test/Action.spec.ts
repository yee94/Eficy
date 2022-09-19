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

test('base actions', (t) => {
  // @ts-ignore
  expect(!!Object.keys(controller.actions).length).toBe(true);
});

let result: any = false;

test('add base action', (t) => {
  const newAction = { testAction: () => (result = true) };
  controller.bindActions(newAction);

  // @ts-ignore
  expect(!!controller.actions.testAction).toBe(true);
});

test('run action', (t) => {
  controller.run({ action: 'testAction', data: {} });

  expect(result).toBe(true);
});

test('replace action result variable', (t) => {
  result = '';
  const newAction = { testUpdate: (str) => (result = str) };
  controller.bindActions(newAction);
  controller.run({ action: 'testUpdate', data: '${models.alert.message}' });

  expect(result).toBe('Hello this is a Login demo');
});
