window.renderController = new Eficy.Controller({
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
            url: 'http://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/reload',
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
});
