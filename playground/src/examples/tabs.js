import * as Eficy from '@eficy/core';
export default () =>
  new Eficy.Controller({
    views: [
      {
        '#view': 'Tabs',
        defaultActiveKey: '1',
        '#children': [
          {
            '#view': 'Tabs.TabPane',
            tab: 'Tab 1',
            key: '1',
            '#children': [
              {
                '#view': 'Radio.Group',
                '#children': [
                  {
                    '#view': 'Radio',
                    value: 1,
                    '#content': 'A',
                  },
                  {
                    '#view': 'Radio',
                    value: 2,
                    '#content': 'B',
                  },
                  {
                    '#view': 'Radio',
                    value: 3,
                    '#content': 'C',
                  },
                  {
                    '#view': 'Radio',
                    value: 4,
                    '#content': 'D',
                  },
                ],
              },
              {
                '#view': 'Cascader',
                options: [
                  {
                    value: 'zhejiang',
                    label: 'Zhejiang',
                    children: [
                      {
                        value: 'hangzhou',
                        label: 'Hangzhou',
                        children: [
                          {
                            value: 'xihu',
                            label: 'West Lake',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    value: 'jiangsu',
                    label: 'Jiangsu',
                    children: [
                      {
                        value: 'nanjing',
                        label: 'Nanjing',
                        children: [
                          {
                            value: 'zhonghuamen',
                            label: 'Zhong Hua Men',
                          },
                        ],
                      },
                    ],
                  },
                ],
                placeholder: 'Please select',
              },
              {
                '#view': 'Select',
                '#children': [
                  {
                    '#view': 'Select.OptGroup',
                    '#children': [
                      {
                        '#view': 'Select.Option',
                        value: 'jack',
                        '#content': 'Jack',
                      },
                      {
                        '#view': 'Select.Option',
                        value: 'lucy',
                        '#content': 'Lucy',
                      },
                    ],
                    label: 'Manager',
                  },
                  {
                    '#view': 'Select.OptGroup',
                    '#children': [
                      {
                        '#view': 'Select.Option',
                        value: 'Yiminghe',
                        '#content': 'yiminghe',
                      },
                    ],
                    label: 'Engineer',
                  },
                ],
                defaultValue: 'lucy',
                style: {
                  width: 200,
                },
              },
              {
                '#view': 'Select',
                '#children': [
                  {
                    '#view': 'Select.Option',
                    value: 'jack',
                    '#content': 'Jack',
                  },
                  {
                    '#view': 'Select.Option',
                    value: 'lucy',
                    '#content': 'Lucy',
                  },
                  {
                    '#view': 'Select.Option',
                    value: 'disabled',
                    disabled: true,
                    '#content': 'Disabled',
                  },
                  {
                    '#view': 'Select.Option',
                    value: 'Yiminghe',
                    '#content': 'yiminghe',
                  },
                ],
                defaultValue: 'lucy',
                style: {
                  width: 120,
                },
              },
            ],
          },
          {
            '#view': 'Tabs.TabPane',
            tab: 'Tab 2',
            key: '2',
            '#content': 'Content of Tab Pane 2',
          },
          {
            '#view': 'Tabs.TabPane',
            tab: 'Tab 3',
            key: '3',
            disabled: true,
            '#content': 'Content of Tab Pane 3',
          },
        ],
      },
    ],
  }).resolver();
