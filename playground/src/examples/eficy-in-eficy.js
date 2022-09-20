import * as Eficy from '@eficy/core';
export default () =>
  new Eficy.Controller({
    views: [
      {
        '#': 'alertChild',
        '#view': 'Alert',
        message: 'Hello this is for eficy data ${models.input.value} ${models.eficy.models.input.value}',
        type: 'info',
        showIcon: true,
      },
      {
        '#': 'input',
        '#view': 'Input',
      },
      {
        '#view': 'Button',
        '#content': 'Click To Change Eficy',
        '@onClick': (ctrl) => {
          ctrl.run({
            action: 'overwrite',
            data: {
              eficy: {
                views: [
                  {
                    '#view': 'Alert',
                    message: 'new content ${models.input.value}',
                  },
                  {
                    '#': 'input',
                    '#view': 'Input',
                  },
                ],
              },
            },
          });
        },
      },
      {
        '#': 'div',
        '#view': 'div',
        style: {
          padding: '20px',
          background: '#f2f2f2',
        },
        '#children': [
          {
            '#': 'eficy',
            '#view': 'Eficy',
            requests: {
              immediately: true,
              url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/reload',
            },
            events: [
              {
                publisher: 'switch@onChange',
                listeners: [(contrl, ...args) => console.log(contrl.parentController.models.eficy)],
              },
            ],
          },
        ],
      },
    ],
    events: [
      {
        publisher: 'switch@onChange',
        listeners: [(contrl, ...args) => console.log(contrl.models.eficy)],
      },
    ],
  }).resolver();
