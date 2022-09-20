import * as Eficy from '@eficy/core';
import { useLocation, useNavigate, useMatch } from 'react-router';

export default ({ children: elements, routes }) => {
  const navigate = useNavigate();
  return new Eficy.Controller({
    views: [
      {
        id: 'components-layout-demo-top-side',
        className: 'layout-container',
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
                style: { lineHeight: '64px' },
                '#view': 'Menu',
                selectedKeys: [useMatch(useLocation().pathname).pathname],
                items: routes.map((item) => {
                  return {
                    key: `/${item.path}`,
                    onClick() {
                      navigate(item.path);
                    },
                    label: item.path,
                  };
                }),
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

              {
                '#view': 'div',
                style: { background: '#fff', padding: 24, minHeight: 280 },
                '#content': elements,
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

      {
        '#view': 'style',
        '#content': `

#components-layout-demo-top-side .logo {
    width: 120px;
    height: 31px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px 28px 16px 0;
    float: left;
}

main.ant-layout-content > div > *:not(:last-child){
  margin-bottom: 16px
}

`,
      },
    ],
  }).resolver();
};
