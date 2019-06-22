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
            views: [
              {
                '#': 'alertParent',
                '#view': 'Alert',
                message: 'Hello parent ${parent.models.input.value} ',
                type: 'info',
                showIcon: true,
              },
              {
                '#': 'input',
                '#view': 'Input',
                value: 'value',
              },
              {
                '#': 'textarea',
                '#view': 'Input.TextArea',
                '#bindValuePropName': 'value',
                value: 'value',
              },
              {
                '#': 'switch',
                '#view': 'Switch',
                checked: true,
              },
            ],
            events: [
              {
                publisher: 'switch@onChange',
                listeners: [(contrl, ...args) => console.log(contrl.parentController.models.eficy)],
              },
            ],
            plugins: ['two-way-bind'],
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
