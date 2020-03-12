ReactDOM.render(
  Eficy.createElement(
    {
      views: [
        {
          '#': 'container',
          '#if': false,
          '#view': 'div',
          '#children': [
            {
              '#': 'message',
              '#view': 'div',
              '#content': '${JSON.stringify(models.message.data)}',
            },
          ],
        },

        {
          '#': 'editor',
          '#if': false,
          '#view': 'div',
          '#children': [
            {
              '#view': 'DadaSchemaEditor',
              height: '100vh',
              value: 'sssssss',
            },
          ],
        },

        {
          '#view': 'Button',
          '#content': '点击显示Editor',
          '@onClick': $ctrl => {
            $ctrl.run({
              action: 'update',
              data: [
                // {
                //   '#': 'editor',
                //   // '#if': true,
                // },
                {
                  '#': 'container',
                  '#if': true,
                },
                {
                  '#': 'message',
                  data: {
                    sss: 'ssssssssss',
                    ddd: 'dddd',
                  },
                },
              ],
            });
          },
        },
      ],
      plugins: [
        [
          'two-way-bind',
          {
            bindOptions: [
              {
                '#view': 'DadaSchemaEditor',
                changeFns: {},
              },
            ],
          },
        ],
      ],
    },
    { DadaSchemaEditor },
  ),
  document.querySelector('#container'),
);
