import Eficy from '@eficy/core-v2';
export default () => {
  const controller = Eficy.createController();
  return controller.load({
    requests: {
      immediately: true,
      url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/reload',
    },
    events: [
      {
        publisher: 'switch@onChange',
        listeners: [(contrl, ...args) => console.log(contrl.models.eficy)],
      },
    ],
  }).render();
};
