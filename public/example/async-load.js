const controller = Eficy.render(
  {
    requests: {
      immediately: true,
      url: 'https://easy-mock.com/mock/5d052e5e6d97202d2c7a8998/eficy/request/reload',
    },
    events: [
      {
        publisher: 'switch@onChange',
        listeners: [(contrl, ...args) => console.log(contrl.models.eficy)],
      },
    ],
  },
  {
    dom: '#container',
    components: window.antd,
  },
);
