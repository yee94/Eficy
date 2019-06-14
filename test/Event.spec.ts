import EficyController from '../src/core/Controller';
import test from 'ava';

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

test('event added', t => {
  // @ts-ignore
  t.is(!!eficyController.model.viewDataMap.form.onSubmit, true);
  // @ts-ignore
  eficyController.model.viewDataMap.form.onSubmit();
  t.is(runTimes, 1);
  initTimes();

  // @ts-ignore
  eficyController.model.viewDataMap.form.onSubmit2();
  t.is(runTimes, 2);
  initTimes();

  // @ts-ignore
  eficyController.model.viewDataMap.form.onClick();
  t.is(runTimes, 1);
  initTimes();
});
