const controller = Eficy.render(
  {
    views: [
      {
        '#': 'toolbar',
        '#view': 'div',
        '#children': [
          {
            '#view': 'span',
            '#content': '搜索：',
          },
          {
            '#': 'search',
            '#view': 'Input.Search',
            value: '',
            placeholder: '输入搜索内容',
            style: { width: 200, marginBottom: 15 },
          },
        ],
      },
      {
        '#': 'table',
        '#view': 'Table',
        '#request': {
          '#': 'getTableData',
          url: 'http://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/table/getlist',
          params: {
            search: '${models.search.value}',
            current: '${tableState.pagination.current}',
            addressSort: '${tableState.sorter.address}',
          },
          data: {
            sort: '${tableState.sorter}',
          },
          format: res => ({
            action: 'update',
            data: [
              {
                '#': 'table',
                dataSource: res.data,
              },
            ],
          }),
        },
        pagination: {
          total: 50,
        },
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            sorter: true,
            defaultSortOrder: 'descend',
            key: 'name',
            render: text => ({
              '#view': 'a',
              '#content': text,
            }),
          },
          {
            title: 'Age',
            dataIndex: 'age',
            filters: [{ text: 'Male', value: 'male' }, { text: 'Female', value: 'female' }],
            filteredValue: ['male'],
            key: 'age2',
          },
          {
            title: 'Address',
            dataIndex: 'address',
            sorter: true,
            defaultSortOrder: 'ascend',
            key: 'address',
          },
          {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: tags => ({
              '#view': 'span',
              '#children': tags.map(tag => {
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
        dataSource: [],
      },
    ],
    plugins: ['two-way-bind', 'ant-table'],
    events: [
      {
        publisher: 'search@onSearch',
        listeners: ctrl => ctrl.request('getTableData'),
      },
    ],
  },
  {
    dom: '#container',
  },
);
