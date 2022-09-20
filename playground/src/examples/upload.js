import * as Eficy from '@eficy/core';
export default () =>
  new Eficy.Controller({
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
      url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/form/uploadData',
      format: (beforeData) => {
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
  }).resolver();
