import * as Eficy from '@eficy/core';
export default () =>
  new Eficy.Controller({
    requests: {
      immediately: true,
      url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/reload',
    },
    events: [
      {
        publisher: 'switch@onChange',
        listeners: [(contrl, ...args) => console.log(contrl.models.eficy)],
      },
    ],
  }).resolver();
