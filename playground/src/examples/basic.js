import Eficy from '@eficy/core-v2';

export default () => {
  const controller = Eficy.createController();
  
  return controller.load({
    views: [
      {
        '#view': 'Alert',
        message: 'quick bind ${models.input.value}',
        type: 'success',
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
        value: 'value',
      },

      {
        '#view': 'Select',
        placeholder: 'Please select a country',
        value: 'china',
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

      {
        '#view': 'Slider',
        style: {
          marginBottom: 40,
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

      {
        '#view': 'Checkbox.Group',
        defaultValue: ['A', 'B'],
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

      {
        '#view': 'Checkbox',
        value: 'A',
        '#content': 'A',
      },
      {
        '#view': 'Rate',
      },
      {
        '#': 'switch',
        '#view': 'Switch',
        checked: true,
      },
      {
        '#view': 'div',
        '#children': [
          {
            '#view': 'Upload',
            '#': 'upload',
            action: '/upload.do',
            listType: 'picture-card',
            fileList: [
              {
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
              },
              {
                uid: '-2',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
              },
              {
                uid: '-3',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
              },
              {
                uid: '-4',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
              },
              {
                uid: '-5',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
              },
            ],
            '#children': [
              {
                '#view': 'div',
                className: 'ant-upload-text',
                '#content': 'Upload',
              },
            ],
          },
        ],
      },
    ],
  }).render();
};