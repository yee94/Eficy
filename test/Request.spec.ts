import test from 'ava';
import Request from '../src/plugins/Request';
import EficyController from '../src/core/Controller';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
// 设置模拟调试器实例
const mock = new MockAdapter(axios);

mock.onGet('/success').reply(200, {
  action: 'success',
  data: {
    msg: 'Hello Eficy success!',
  },
});

mock.onPost('/post').reply(config => {
  const { name } = JSON.parse(config.data);
  const { name2 } = config.params;
  return [
    200,
    {
      action: 'update',
      data: {
        name,
        name2,
      },
    },
  ];
});

mock.onGet('/format').reply(200, {
  errcode: 0,
  result1: 'Hello',
  message: 'success request',
});

mock.onGet('/update').reply(200, {
  action: 'update',
  data: {
    '#': 'alert',
    type: 'success',
    message: 'Hello Eficy request update',
  },
});

mock.onGet('/update2').reply(200, {
  action: 'update',
  data: {
    '#': 'alert',
    type: 'info',
  },
});

const controller = new EficyController({
  views: [
    {
      '#': 'alert',
      '#view': 'Alert',
      message: 'Hello this is a Login demo',
      type: 'info',
      showIcon: true,
    },
  ],
  requests: [{ '#': 'updateRequest', url: '/update' }],
});

test('request return', async t => {
  t.true((await Request.request({ url: 'xxxxxx' })).action === 'fail');

  t.true((await Request.request({ url: '/success' })).action === 'success');

  const resPost = await Request.request({
    url: '/post',
    method: 'POST',
    params: { name2: 'param1' },
    data: {
      name: 'Hello Eficy',
    },
  });
  t.true(resPost.data.name === 'Hello Eficy' && resPost.data.name2 === 'param1');

  const resFormat = await Request.request({
    url: '/format',
    format: beforeData => {
      const { errcode, ...rest } = beforeData;
      return {
        action: errcode ? 'fail' : 'success',
        data: rest,
      };
    },
  });

  t.true(resFormat.action === 'success');
  t.deepEqual(resFormat.data, { result1: 'Hello', message: 'success request' });
});

test('controller request', async t => {
  t.true(!!controller.request);

  await controller.request('updateRequest');
  // @ts-ignore
  t.is(controller.getModel('alert').type, 'success');

  await controller.request({ url: '/update2' });
  // @ts-ignore
  t.is(controller.getModel('alert').type, 'info');
});

test('controller request replace variable', async t => {
  const resPost = await controller.request({
    url: '/post',
    method: 'POST',
    params: { name2: 'param1' },
    data: {
      name: 'Hello ${models.alert.#view}',
    },
  });

  // @ts-ignore
  t.is(resPost.data.name, 'Hello Alert');
});
