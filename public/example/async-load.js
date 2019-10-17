window.renderData = {
  requests: {
    immediately: true,
    url: 'http://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/reload',
  },
  events: [
    {
      publisher: 'switch@onChange',
      listeners: [(contrl, ...args) => console.log(contrl.models.eficy)],
    },
  ],
};
