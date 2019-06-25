const data = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}

const controller = Eficy.render(
  {
    views: [
      {
        '#view': 'div',
        style: {
          marginBottom: 16,
        },
        '#children': [
          {
            '#': 'button',
            '#view': 'Button',
            type: 'primary',
            disabled: '${!models.table.rowSelection.selectedRowKeys.length}',
            loading: false,
            '#content': 'Reload',
          },
          {
            '#view': 'span',
            style: {
              marginLeft: 8,
            },
            '#content': 'Selected ${models.table.rowSelection.selectedRowKeys.length} items',
          },
        ],
      },
      {
        '#': 'table',
        '#view': 'Table',
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
          },
          {
            title: 'Age',
            dataIndex: 'age',
          },
          {
            title: 'Address',
            dataIndex: 'address',
          },
        ],
        dataSource: data,
        rowSelection: {
          selectedRowKeys: [],
          onChange: selectedRowKeys => {
            controller.run({
              action: 'update',
              data: {
                '#': 'table',
                rowSelection: {
                  selectedRowKeys,
                },
              },
            });
          },
        },
      },
    ],
    events: [
      {
        publisher: 'button@onClick',
        listeners: ctrl => {
          ctrl.run({ action: 'update', data: { '#': 'button', loading: true } });
          setTimeout(() => {
            ctrl.run({
              action: 'update',
              data: [
                {
                  '#': 'button',
                  loading: false,
                },
                {
                  '#': 'table',
                  rowSelection: {
                    selectedRowKeys: [],
                  },
                },
              ],
            });
          }, 1000);
        },
      },
    ],
  },
  {
    dom: '#container',
  },
);
