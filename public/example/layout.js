const controller = Eficy.render(
  {
    views: [
      {
        '#view': 'Layout',
        '#children': [
          {
            '#view': 'Layout.Header',
            className: 'header',
            '#children': [
              {
                '#view': 'div',
                className: 'logo',
              },
              {
                '#view': 'Menu',
                theme: 'dark',
                mode: 'horizontal',
                defaultSelectedKeys: ['2'],
                style: { lineHeight: '64px' },
                '#children': [
                  {
                    '#view': 'Menu.Item',
                    '#content': 'nav 1',
                    key: 1,
                  },
                  {
                    '#view': 'Menu.Item',
                    '#content': 'nav 2',
                    key: 2,
                  },
                  {
                    '#view': 'Menu.Item',
                    '#content': 'nav 3',
                    key: 3,
                  },
                ],
              },
            ],
          },
          {
            '#view': 'Layout.Content',
            style: {
              padding: '0 50px',
            },
            '#children': [
              {
                '#view': 'Breadcrumb',
                style: { margin: '16px 0' },
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
              },
            ],
          },
          {
            '#view': 'Layout.Footer',
            style: { textAlign: 'center' },
            '#content': 'Ant Design ©2018 Created by Ant UED',
          },
        ],
      },
    ],
  },
  {
    dom: '#container',
  },
);
