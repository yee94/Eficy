import Eficy from '@eficy/core-v2';
export default () => {
  const controller = Eficy.createController();
  return controller.load({
    views: [
      {
        '#view': 'Table',
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => ({
              '#view': 'a',
              '#content': text,
            }),
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
          },
          {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
          },
          {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: (tags) => ({
              '#view': 'span',
              '#children': tags.map((tag) => {
                let color = tag.length > 5 ? 'geekblue' : 'green';
                if (tag === 'loser') {
                  color = 'volcano';
                }
                return {
                  '#view': 'Tag',
                  color,
                  key: tag,
                  '#content': tag.toUpperCase(),
                };
              }),
            }),
          },
          {
            title: 'Action',
            key: 'action',
            render: (text, record) => ({
              '#view': 'span',
              '#children': [
                {
                  '#view': 'a',
                  '#content': `Invite ${record.name}`,
                },
                {
                  '#view': 'Divider',
                  type: 'vertical',
                },
                {
                  '#view': 'a',
                  '#content': `Delete`,
                },
              ],
            }),
          },
        ],
        dataSource: [
          {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            tags: ['nice', 'developer'],
          },
          {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
            tags: ['loser'],
          },
          {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sidney No. 1 Lake Park',
            tags: ['cool', 'teacher'],
          },
        ],
      },
    ],
  }).render();
};
