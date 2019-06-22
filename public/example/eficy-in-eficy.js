const controller = Eficy.render(
  {
    views: [
      {
        '#': 'alertChild',
        '#view': 'Alert',
        message: 'Hello this is for eficy data ${models.eficy.models.input.value}',
        type: 'info',
        showIcon: true,
      },
      {
        '#': 'input',
        '#view': 'Input',
        value: 'value',
      },
      {
        '#': 'switch',
        '#view': 'Switch',
        checked: true,
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
              url: 'https://easy-mock.com/mock/5d052e5e6d97202d2c7a8998/eficy/request/reload',
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
    plugins: ['two-way-bind'],
  },
  {
    dom: '#container',
    components: window.antd,
  },
);
