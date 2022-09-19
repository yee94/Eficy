import EficyController from '../src/core/Controller';

let runTimes = 0;
const eventFn = () => {
  runTimes++;
};
const initTimes = () => {
  runTimes = 0;
};

const eficyController = new EficyController(
  {
    views: [
      {
        '#': 'form',
        '#view': 'Form',
      },
    ],
    events: [
      {
        publisher: 'form@onSubmit',
        listeners: eventFn,
      },
      {
        publisher: 'form@onSubmit2',
        listeners: [eventFn, eventFn],
      },
      {
        publisher: {
          '#': 'form',
          action: 'onClick',
        },
        listeners: eventFn,
      },
    ],
  },
  {},
);

test('event added', (t) => {
  expect(!!eficyController.model.viewDataMap.form.onSubmit).toBe(true);
  eficyController.model.viewDataMap.form.onSubmit();
  expect(runTimes).toBe(1);
  initTimes();

  eficyController.model.viewDataMap.form.onSubmit2();
  expect(runTimes).toBe(2);
  initTimes();

  eficyController.model.viewDataMap.form.onClick();
  expect(runTimes).toBe(1);
  initTimes();
});
