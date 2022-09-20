import * as Eficy from '@eficy/core';
import { useLocation, useNavigate, useMatch } from 'react-router';

export default ({ children: elements, routes }) => {
  const navigate = useNavigate();
  return new Eficy.Controller({
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
                        items: routes.map((item) => {
                          return {
                            key: `/${item.path}`,
                            onClick() {
                              navigate(item.path);
                            },
                            label: item.path,
                          };
                        }),
                        selectedKeys: [useMatch(useLocation().pathname).pathname],
                        mode: 'inline',
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
                    '#content': elements,
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
}

main.ant-layout-content > *:not(:last-child){
  margin-bottom: 16px
}

`,
      },
    ],
  }).resolver();
};
