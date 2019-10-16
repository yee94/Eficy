const controller = Eficy.render(
  {
    views: [
      {
        '#': 'alert',
        '#view': 'Alert',
        message: 'Hello this is a Login demo',
        type: 'info',
        showIcon: true,
      },
      {
        '#': 'form',
        '#view': 'Form',
        '#children': [
          {
            '#view': 'Form.Item',
            label: 'E-mail',
            '#children': [
              {
                '#': 'input',
                '#view': 'Input',
                value: 'value',
                '#field': {
                  name: 'email',
                  rules: [
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!',
                    },
                  ],
                },
                placeholder: 'username',
                prefix: {
                  '#view': 'Icon',
                  type: 'user',
                  style: { color: 'rgba(0,0,0,.25)' },
                },
              },
            ],
          },
          {
            '#view': 'Form.Item',
            label: 'password',
            '#children': [
              {
                '#view': 'Input.Password',
                '#field': {
                  name: 'password',
                  rules: [
                    {
                      required: true,
                      message: 'Please input your Password!',
                    },
                  ],
                },
                placeholder: 'password',
                prefix: {
                  '#view': 'Icon',
                  type: 'lock',
                },
              },
            ],
          },
          {
            '#view': 'Form.Item',
            '#children': [
              {
                '#view': 'Checkbox',
                '#field': {
                  name: 'remember',
                  valuePropName: 'checked',
                  initialValue: true,
                },
                '#content': 'Remember me',
              },
              {
                '#': 'button',
                '#view': 'Button',
                type: 'primary',
                htmlType: 'submit',
                '#content': 'Login',
              },
            ],
          },
        ],
      },
    ],
    requests: [
      {
        '#': 'taobao',
        url: 'taobao.com',
      },
      {
        '#': 'mock',
        url: 'http://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/success',
      },
      {
        '#': 'mock_update',
        url: 'http://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/update',
      },
    ],
    events: [
      {
        publisher: 'form@onSubmit',
        listeners: [
          contrl => contrl.run({ action: 'update', data: { views: [{ '#': 'input', value: 'submit !!' }] } }),
          (contrl, ...args) => console.log('another function', args),
          (contrl, ...args) =>
            contrl.request({
              url: 'baidu.com',
            }),
          (contrl, ...args) => contrl.request('mock'),
          (contrl, ...args) => contrl.request('mock_update'),
        ],
      },
    ],
    plugins: ['ant-form'],
  },
  {
    dom: '#container',
  },
);

controller.model.update({
  views: [
    {
      '#': 'input',
      value: 'Hello Eficy Change',
    },
  ],
});

setInterval(() => {
  controller.run({
    action: 'update',
    data: {
      views: [
        {
          '#': 'alert',
          message: '${models.input.value} haha',
        },
      ],
    },
  });
}, 2000);
