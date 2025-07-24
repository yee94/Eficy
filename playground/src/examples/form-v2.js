import Eficy from '@eficy/core-v2';

export default () => {
  const controller = Eficy.createController();
  console.log("🚀 #### ~ controller:", controller);

  return controller.load({
    views: [
      {
        '#': 'alert',
        '#view': 'Alert',
        message: 'Hello this is a Form demo with V2',
        type: 'info',
        showIcon: true,
      },
      {
        '#view': 'Alert',
        message: 'Input value: ${models.input.value || "empty"}',
        type: 'success',
        showIcon: true,
      },
      {
        '#': 'form',
        '#view': 'Form',
        '@finish': (values) => {
          console.log('Form values:', values);
          return {
            action: 'success',
            data: 'Form submitted successfully!'
          };
        },
        name: 'demo-form',
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
        initialValues: {
          email: 'test@example.com',
          inputNumber: 3,
          checkboxGroup: ['A', 'B'],
          slider: 40,
          rate: 3.5,
        },
        '#children': [
          {
            '#view': 'Form.Item',
            label: 'Plain Text',
            '#content': 'China',
          },
          {
            '#view': 'Form.Item',
            name: 'email',
            label: 'E-mail',
            rules: [
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
              {
                required: true,
                message: 'Please input your E-mail!',
              },
            ],
            '#children': [
              {
                '#': 'input',
                '#view': 'Input',
                placeholder: 'Enter your email',
              },
            ],
          },
          {
            '#view': 'Form.Item',
            name: 'password',
            label: 'Password',
            rules: [
              {
                required: true,
                message: 'Please input your password!',
              },
            ],
            '#children': [
              {
                '#view': 'Input.Password',
                placeholder: 'Enter your password',
              },
            ],
          },
          {
            '#view': 'Form.Item',
            name: 'inputNumber',
            label: 'Input Number',
            '#children': [
              {
                '#view': 'InputNumber',
                min: 1,
                max: 10,
                style: { width: '100%' },
              },
            ],
          },
          {
            '#view': 'Form.Item',
            name: 'slider',
            label: 'Slider',
            '#children': [
              {
                '#view': 'Slider',
                marks: {
                  0: 'A',
                  20: 'B',
                  40: 'C',
                  60: 'D',
                  80: 'E',
                  100: 'F',
                },
              },
            ],
          },
          {
            '#view': 'Form.Item',
            name: 'radioGroup',
            label: 'Radio Group',
            '#children': [
              {
                '#view': 'Radio.Group',
                '#children': [
                  {
                    '#view': 'Radio.Button',
                    value: 'a',
                    '#content': 'Item 1',
                  },
                  {
                    '#view': 'Radio.Button',
                    value: 'b',
                    '#content': 'Item 2',
                  },
                  {
                    '#view': 'Radio.Button',
                    value: 'c',
                    '#content': 'Item 3',
                  },
                ],
              },
            ],
          },
          {
            '#view': 'Form.Item',
            name: 'checkboxGroup',
            label: 'Checkbox Group',
            '#children': [
              {
                '#view': 'Checkbox.Group',
                style: { width: '100%' },
                '#children': [
                  {
                    '#view': 'Row',
                    '#children': [
                      {
                        '#view': 'Col',
                        span: 8,
                        '#children': [
                          {
                            '#view': 'Checkbox',
                            value: 'A',
                            '#content': 'A',
                          },
                        ],
                      },
                      {
                        '#view': 'Col',
                        span: 8,
                        '#children': [
                          {
                            '#view': 'Checkbox',
                            value: 'B',
                            '#content': 'B',
                          },
                        ],
                      },
                      {
                        '#view': 'Col',
                        span: 8,
                        '#children': [
                          {
                            '#view': 'Checkbox',
                            value: 'C',
                            '#content': 'C',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            '#view': 'Form.Item',
            name: 'rate',
            label: 'Rate',
            '#children': [
              {
                '#view': 'Rate',
              },
            ],
          },
          {
            '#view': 'Form.Item',
            name: 'switch',
            label: 'Switch',
            valuePropName: 'checked',
            '#children': [
              {
                '#view': 'Switch',
              },
            ],
          },
          {
            '#view': 'Form.Item',
            wrapperCol: { span: 12, offset: 6 },
            '#children': [
              {
                '#view': 'Button',
                type: 'primary',
                htmlType: 'submit',
                '#content': 'Submit',
              },
              {
                '#view': 'Button',
                style: { marginLeft: 8 },
                '@click': () => ({
                  action: 'update',
                  data: [
                    {
                      '#': 'form',
                      // Reset form here if needed
                    }
                  ]
                }),
                '#content': 'Reset',
              },
            ],
          },
        ],
      },
    ],
  }).render();
};