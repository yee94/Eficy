const controller = Eficy.render(
  {
    views: [
      {
        '#view': 'Upload',
        '#': 'upload',
        action: '/upload.do',
        listType: 'picture-card',
        fileList: [],
        '#children': [
          {
            '#view': 'div',
            '#children': [
              { '#view': 'Icon', type: 'plus' },
              {
                '#view': 'div',
                className: 'ant-upload-text',
                '#content': 'Upload',
              },
            ],
          },
        ],
      },
    ],
    events: [
      {
        publisher: 'upload@onChange',
        listeners: (ctrl, { fileList }) => {
          console.log(fileList);
          ctrl.run({ action: 'update', data: { '#': 'upload', fileList } });
        },
      },
    ],
    requests: {
      immediately: true,
      url: 'https://easy-mock.com/mock/5d052e5e6d97202d2c7a8998/eficy/form/uploadData',
      format: beforeData => {
        const { errcode, data } = beforeData;
        console.log(data);
        return {
          action: 'update',
          data: [
            {
              '#': 'upload',
              fileList: data,
            },
          ],
        };
      },
    },
    plugins: ['two-way-bind'],
  },
  {
    dom: '#container',
  },
);
