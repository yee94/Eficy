window.layoutRenderData = {
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

            {
              '#view': 'div',
              style: { background: '#fff', padding: 24, minHeight: 280 },
              '#children': [
                {
                  '#view': 'Eficy',
                  ...window.renderData,
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

.layout-container{
margin-bottom: 40px;
}
`,
    },
  ],
};
