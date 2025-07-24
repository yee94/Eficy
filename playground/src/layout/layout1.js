import React from 'react';
import Eficy from '@eficy/core-v2';
import { useLocation, useNavigate } from 'react-router';

export default ({ children: elements, routes }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const controller = Eficy.createController();
  
  const layoutElement = controller.load({
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
                style: {
                  height: '32px',
                  margin: '16px',
                  background: 'rgba(255, 255, 255, 0.3)'
                }
              },
              {
                '#view': 'Menu',
                items: routes.map((item) => {
                  return {
                    key: `/${item.path}`,
                    onClick: () => {
                      navigate(item.path);
                    },
                    label: item.path || 'Home',
                  };
                }),
                selectedKeys: [location.pathname],
                theme: 'dark',
                mode: 'inline',
              },
            ],
            trigger: null,
            collapsible: true,
          },
          {
            '#view': 'Layout',
            '#children': [
              {
                '#view': 'Layout.Header',
                '#children': [
                  {
                    '#view': 'div',
                    className: 'trigger',
                    style: {
                      fontSize: '18px',
                      lineHeight: '64px',
                      padding: '0 24px',
                      cursor: 'pointer',
                      transition: 'color 0.3s',
                    },
                    '#content': 'Eficy V2 Playground'
                  },
                ],
                style: {
                  background: '#fff',
                  padding: 0,
                },
              },
              {
                '#view': 'Layout.Content',
                '#children': [
                  {
                    '#view': 'div',
                    style: {
                      margin: '24px 16px',
                      padding: 24,
                      minHeight: 280,
                      background: '#fff',
                    },
                    '#children': [],
                  },
                ],
              },
            ],
          },
        ],
        style: {
          minHeight: '100vh',
        },
      },
    ],
  }).render();
  
  return React.createElement('div', { className: 'layout-wrapper' }, layoutElement, elements);
};