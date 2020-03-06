window.renderController = new Eficy.Controller({
  views: [
    {
      style: {
        marginTop: 30,
      },
      name: 'form',
      '#': 'form',
      '#view': 'Form',
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
      initialValues: { email: 'wyy.xb@qq.com', remember: true },
      '#children': [
        {
          '#view': 'Form.Item',
          wrapperCol: { offset: 4, span: 16 },
          '#children': [
            {
              '#': 'alert',
              '#view': 'Alert',
              message: 'Hello this is a Login demo ${models.input.value}',
              type: 'info',
              showIcon: true,
            },
          ],
        },
        {
          '#view': 'Form.Item',
          label: 'E-mail',
          name: 'email',
          rules: [
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
          ],
          '#children': [
            {
              '#': 'input',
              value: 'wyy.xb@qq.com',
              '#view': 'Input',
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
          name: 'password',
          rules: [
            {
              required: true,
              message: 'Please input your Password!',
            },
          ],
          '#children': [
            {
              '#view': 'Input.Password',
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
          name: 'remember',
          valuePropName: 'checked',
          wrapperCol: { offset: 6, span: 14 },
          '#children': [
            {
              '#view': 'Checkbox',
              '#content': 'Remember me',
            },
          ],
        },
        {
          '#view': 'Form.Item',
          wrapperCol: { offset: 6, span: 14 },
          '#children': [
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
      url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/success',
    },
    {
      '#': 'mock_update',
      url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/update',
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
});

setTimeout(() => {
  controller.model.update({
    views: [
      {
        '#': 'input',
        value: 'Hello Eficy Change',
      },
    ],
  });
}, 1000);

setInterval(() => {
  controller.run({
    action: 'update',
    data: [
      {
        '#': 'alert',
        message: '${models.input.value} haha',
      },
      {
        '#': 'eficy.alert',
        message: '${models.eficy.models.input.value} haha',
      },
    ],
  });
}, 2000);
