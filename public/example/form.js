window.renderController = new Eficy.Controller({
  views: [
    {
      '#': 'alert',
      '#view': 'Alert',
      message: 'Hello this is a Login demo ',
      type: 'info',
      showIcon: true,
    },
    {
      '#view': 'Alert',
      message: 'quick bind ${models.input.value}',
      type: 'success',
      showIcon: true,
    },
    {
      '#': 'validate_other',
      '#view': 'Form',
      name: 'test',
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
      initialValues: {
        email: 'value',
        'input-number': 3,
        'checkbox-group': ['A', 'B'],
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
          ],
          '#children': [
            {
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
          name: 'select',
          label: 'Select',
          hasFeedback: true,
          rules: [{ required: true, message: 'Please select your country!' }],
          '#children': [
            {
              '#view': 'Select',
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
          name: 'select-multiple',
          rules: [{ required: true, message: 'Please select your favourite colors!', type: 'array' }],
          label: 'Select[multiple]',
          '#children': [
            {
              '#view': 'Select',
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
          name: 'input-number',
          '#children': [
            {
              '#view': 'InputNumber',
              min: 1,
              max: 10,
            },
          ],
        },

        {
          '#view': 'Form.Item',
          label: 'Switch',
          name: 'switch',
          '#children': [
            {
              '#view': 'Switch',
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
          name: 'radio-group',
          '#view': 'Form.Item',
          label: 'Radio.Group',
          '#children': [
            {
              '#view': 'Radio.Group',
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
          name: 'radio-button',
          '#view': 'Form.Item',
          label: 'Radio.Button',
          '#children': [
            {
              '#view': 'Radio.Group',
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
          name: 'checkbox-group',
          label: 'Checkbox.Group',
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
                    {
                      '#view': 'span',
                      '#content': 'Click to upload',
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
                  '#view': 'p',
                  className: 'ant-upload-drag-icon',
                  '#children': [
                    {
                      '#view': 'Icon',
                      type: 'inbox',
                    },
                  ],
                },

                {
                  '#view': 'p',
                  className: 'ant-upload-text',
                  '#content': 'Click or drag file to this area to upload',
                },

                {
                  '#view': 'p',
                  className: 'ant-upload-hint',
                  '#content': 'Support for a single or bulk upload.',
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
  reactions: [
    {
      expression: ctrl => ctrl.models.input.value,
      effect: (effectResult, ctrl) => (ctrl.models.alert.message = effectResult),
    },
  ],
});
