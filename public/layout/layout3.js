window.layoutController = new Eficy.Controller({
  views: [
    {
      id: 'components-layout-demo-top-side',
      '#view': 'Layout',
      '#children': [
        {
          '#view': 'Layout.Header',
          '#children': [
            {
              '#view': 'div',
              className: 'logo',
            },
            {
              '#view': 'Menu',
              '#children': [
                {
                  '#view': 'Menu.Item',
                  key: '1',
                  '#content': 'nav 1',
                },
                {
                  '#view': 'Menu.Item',
                  key: '2',
                  '#content': 'nav 2',
                },
                {
                  '#view': 'Menu.Item',
                  key: '3',
                  '#content': 'nav 3',
                },
              ],
              theme: 'dark',
              mode: 'horizontal',
              defaultSelectedKeys: ['2'],
              style: {
                lineHeight: '64px',
              },
            },
          ],
          className: 'header',
        },
        {
          '#view': 'Layout.Content',
          '#children': [
            {
              '#view': 'Breadcrumb',
              '#children': [
                {
                  '#view': 'Breadcrumb.Item',
                  '#content': 'Home',
                },
                {
                  '#view': 'Breadcrumb.Item',
                  '#content': 'List',
                },
                {
                  '#view': 'Breadcrumb.Item',
                  '#content': 'App',
                },
              ],
              style: {
                margin: '16px 0',
              },
            },
            {
              '#view': 'Layout',
              '#children': [
                {
                  '#view': 'Layout.Sider',
                  '#children': [
                    {
                      '#view': 'Menu',
                      '#children': [
                        {
                          '#view': 'Menu.SubMenu',
                          '#children': [
                            {
                              '#view': 'Menu.Item',
                              key: '1',
                              '#content': 'option1',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '2',
                              '#content': 'option2',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '3',
                              '#content': 'option3',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '4',
                              '#content': 'option4',
                            },
                          ],
                          key: 'sub1',
                          title: {
                            '#view': 'span',
                            '#content': 'subnav 1',
                            '#children': [
                              {
                                '#view': 'Icon',
                                type: 'user',
                              },
                            ],
                          },
                        },
                        {
                          '#view': 'Menu.SubMenu',
                          '#children': [
                            {
                              '#view': 'Menu.Item',
                              key: '5',
                              '#content': 'option5',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '6',
                              '#content': 'option6',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '7',
                              '#content': 'option7',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '8',
                              '#content': 'option8',
                            },
                          ],
                          key: 'sub2',
                          title: {
                            '#view': 'span',
                            '#content': 'subnav 2',
                            '#children': [
                              {
                                '#view': 'Icon',
                                type: 'laptop',
                              },
                            ],
                          },
                        },
                        {
                          '#view': 'Menu.SubMenu',
                          '#children': [
                            {
                              '#view': 'Menu.Item',
                              key: '9',
                              '#content': 'option9',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '10',
                              '#content': 'option10',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '11',
                              '#content': 'option11',
                            },
                            {
                              '#view': 'Menu.Item',
                              key: '12',
                              '#content': 'option12',
                            },
                          ],
                          key: 'sub3',
                          title: {
                            '#view': 'span',
                            '#content': 'subnav 3',
                            '#children': [
                              {
                                '#view': 'Icon',
                                type: 'notification',
                              },
                            ],
                          },
                        },
                      ],
                      mode: 'inline',
                      defaultSelectedKeys: ['1'],
                      defaultOpenKeys: ['sub1'],
                      style: {
                        height: '100%',
                      },
                    },
                  ],
                  width: 200,
                  style: {
                    background: '#fff',
                  },
                },
                {
                  '#view': 'Layout.Content',
                  style: {
                    padding: '0 24px',
                    minHeight: 280,
                  },
                  '#children': [
                    {
                      '#': 'eficy',
                      '#view': 'Eficy',
                      controller: window.renderController,
                    },
                  ],
                },
              ],
              style: {
                padding: '24px 0',
                background: '#fff',
              },
            },
          ],
          style: {
            padding: '0 50px',
          },
        },
        {
          '#view': 'Layout.Footer',
          style: {
            textAlign: 'center',
            padding: '20px 0',
          },
          '#content': 'Ant Design ©2018 Created by Ant UED',
        },
      ],
    },
    {
      '#view': 'style',
      '#content': `#components-layout-demo-top-side .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
}`,
    },
  ],
});
