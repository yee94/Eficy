import * as Eficy from '@eficy/core';
import { useLocation, useNavigate, useMatch } from 'react-router';

export default ({ children: elements, routes }) => {
  const navigate = useNavigate();
  return new Eficy.Controller({
    views: [
      {
        id: 'components-layout-demo-custom-trigger',
        className: 'layout-container',
        '#view': 'Layout',
        '#children': [
          {
            '#view': 'Layout.Sider',
            '#children': [
              {
                '#view': 'div',
                className: 'logo',
              },
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
                theme: 'dark',
                mode: 'inline',
              },
            ],
            trigger: null,
          },
          {
            '#view': 'Layout',
            '#children': [
              {
                '#view': 'Layout.Header',
                '#children': [
                  {
                    '#view': 'Icon',
                    className: 'trigger',
                  },
                ],
                style: {
                  background: '#fff',
                  padding: 0,
                },
              },
              {
                '#view': 'Layout.Content',
                style: {
                  margin: '24px 16px',
                  padding: 24,
                  background: '#fff',
                  minHeight: 280,
                },
                '#content': elements,
              },
            ],
          },
        ],
      },

      {
        '#view': 'style',
        '#content': `#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

#components-layout-demo-top-side .logo {
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
