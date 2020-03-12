window.renderController = new Eficy.Controller(
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
          {
            '#view': 'DadaSchemaEditor',
            height: '100vh',
            value: '{"ss":"ddd"}',
          },
        ],
      },

      {
        '#view': 'Button',
        '#content': '点击显示Editor',
        '@onClick': $ctrl => {
          $ctrl.run({
            action: 'update',
            data: {
              container: {
                '#if': true,
              },
              message: {
                data: {
                  sss: 'ssssssssss',
                  ddd: 'dddd',
                },
              },
            },
          });
        },
      },
    ],
  },
  { DadaSchemaEditor },
);
