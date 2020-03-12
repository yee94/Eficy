ReactDOM.render(
  Eficy.createElement({
    '#view': 'Tabs',
    defaultActiveKey: '1',
    '#children': [
      {
        '#view': 'TabPane',
        tab: 'Tab 1',
        key: '1',
        '#content': 'Content of Tab Pane 1',
      },
      {
        '#view': 'TabPane',
        tab: 'Tab 2',
        key: '2',
        '#content': 'Content of Tab Pane 2',
      },
      {
        '#view': 'TabPane',
        tab: 'Tab 3',
        key: '3',
        '#content': 'Content of Tab Pane 3',
      },
    ],
  }),
  document.querySelector('#container'),
);
