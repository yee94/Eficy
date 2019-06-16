const controller = Eficy.render(
  {
    views: [
      {
        '#': 'validate_other',
        '#view': 'Form',
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
        '#children': [
          {
            '#view': 'Form.Item',
            label: 'Plain Text',
            '#content': 'China',
          },

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
            label: 'Select',
            hasFeedback: true,
            '#children': [
              {
                '#view': 'Select',
                '#field': {
                  name: 'select',
                  rules: [{ required: true, message: 'Please select your country!' }],
                },
                placeholder: 'Please select a country',
                '#children': [
                  {
                    '#view': 'Select.Option',
                    value: 'china',
                    '#content': 'China',
                  },
                  {
                    '#view': 'Select.Option',
                    value: 'usa',
                    '#content': 'U.S.A',
                  },
                ],
              },
            ],
          },

          {
            '#view': 'Form.Item',
            label: 'Select[multiple]',
            '#children': [
              {
                '#view': 'Select',
                '#field': {
                  name: 'select-multiple',
                  rules: [{ required: true, message: 'Please select your favourite colors!', type: 'array' }],
                },
                placeholder: 'Please select favourite colors',
                mode: 'multiple',
                '#children': [
                  {
                    '#view': 'Select.Option',
                    value: 'red',
                    '#content': 'Red',
                  },
                  {
                    '#view': 'Select.Option',
                    value: 'green',
                    '#content': 'Green',
                  },
                  {
                    '#view': 'Select.Option',
                    value: 'blue',
                    '#content': 'Blue',
                  },
                ],
              },
            ],
          },

          {
            '#view': 'Form.Item',
            label: 'InputNumber',
            '#children': [
              {
                '#view': 'InputNumber',
                '#field': {
                  name: 'input-number',
                  initialValue: 3,
                },
                min: 1,
                max: 10,
              },
            ],
          },

          {
            '#view': 'Form.Item',
            label: 'Switch',
            '#children': [
              {
                '#view': 'Switch',
                '#field': {
                  name: 'switch',
                  // valuePropName: 'checked'
                },
              },
            ],
          },

          {
            '#view': 'Form.Item',
            label: 'Slider',
            '#children': [
              {
                '#view': 'Slider',
                '#field': {
                  name: 'slider',
                },
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
            label: 'Radio.Group',
            '#children': [
              {
                '#view': 'Radio.Group',
                '#field': {
                  name: 'radio-group',
                },
                '#children': [
                  {
                    '#view': 'Radio',
                    value: 'a',
                    '#content': 'item 1',
                  },
                  {
                    '#view': 'Radio',
                    value: 'b',
                    '#content': 'item 2',
                  },
                  {
                    '#view': 'Radio',
                    value: 'c',
                    '#content': 'item 3',
                  },
                ],
              },
            ],
          },

          {
            '#view': 'Form.Item',
            label: 'Radio.Button',
            '#children': [
              {
                '#view': 'Radio.Group',
                '#field': {
                  name: 'radio-button',
                },
                '#children': [
                  {
                    '#view': 'Radio.Button',
                    value: 'a',
                    '#content': 'item 1',
                  },
                  {
                    '#view': 'Radio.Button',
                    value: 'b',
                    '#content': 'item 2',
                  },
                  {
                    '#view': 'Radio.Button',
                    value: 'c',
                    '#content': 'item 3',
                  },
                ],
              },
            ],
          },

          {
            '#view': 'Form.Item',
            label: 'Checkbox.Group',
            '#children': [
              {
                '#view': 'Checkbox.Group',
                '#field': {
                  name: 'checkbox-group',
                  initialValue: ['A', 'B'],
                },
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
                            disabled: true,
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
                      {
                        '#view': 'Col',
                        span: 8,
                        '#children': [
                          {
                            '#view': 'Checkbox',
                            value: 'D',
                            '#content': 'D',
                          },
                        ],
                      },
                      {
                        '#view': 'Col',
                        span: 8,
                        '#children': [
                          {
                            '#view': 'Checkbox',
                            value: 'E',
                            '#content': 'E',
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
            label: 'Rate',
            '#children': [
              {
                '#view': 'Rate',
                '#field': {
                  name: 'rate',
                  initialValue: 3.5,
                },
              },
            ],
          },

          {
            '#view': 'Form.Item',
            label: 'Upload',
            extra: 'jpg',
            '#children': [
              {
                '#view': 'Upload',
                name: 'logo',
                action: '/upload.do',
                listType: 'picture',
                '#children': [
                  {
                    '#view': 'Button',
                    '#children': [
                      {
                        '#view': 'Icon',
                        type: 'upload',
                      },
                    ],
                  },
                ],
              },
            ],
          },

          {
            '#view': 'Form.Item',
            label: 'Dragger',
            '#children': [
              {
                '#view': 'Upload.Dragger',
                name: 'files',
                action: '/upload.do',
                '#children': [
                  {
                    '#view': 'Icon',
                    type: 'inbox',
                  },
                ],
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
            ],
          },
        ],
      },
    ],
    plugins: ['ant-form'],
  },
  {
    dom: '#container',
    components: window.antd,
  },
);
