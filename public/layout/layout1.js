window.layoutController = new Eficy.Controller({
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
              '#children': [
                {
                  '#view': 'Menu.Item',
                  '#children': [
                    {
                      '#view': 'Icon',
                      type: 'user',
                    },
                    {
                      '#view': 'span',
                      '#content': 'nav 1',
                    },
                  ],
                  key: '1',
                },
                {
                  '#view': 'Menu.Item',
                  '#children': [
                    {
                      '#view': 'Icon',
                      type: 'video-camera',
                    },
                    {
                      '#view': 'span',
                      '#content': 'nav 2',
                    },
                  ],
                  key: '2',
                },
                {
                  '#view': 'Menu.Item',
                  '#children': [
                    {
                      '#view': 'Icon',
                      type: 'upload',
                    },
                    {
                      '#view': 'span',
                      '#content': 'nav 3',
                    },
                  ],
                  key: '3',
                },
              ],
              theme: 'dark',
              mode: 'inline',
              defaultSelectedKeys: ['1'],
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
              '#children': [
                {
                  '#view': 'Eficy',
                  controller: window.renderController,
                },
              ],
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

`,
    },
  ],
});
