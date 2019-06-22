import EficyModel from '../src/components/EficyComponent/EficyModel';
import { ViewSchema } from '../src/models';
import test from 'ava';

const basicData = {
  '#': 'form',
  '#view': 'Form',
  className: 'test',
  newField: 'test',
  '#children': [
    {
      '#': 'formItem',
      '#view': 'Form.Item',
    },
    {
      '#': 'eficyComponent',
      '#view': 'Eficy',
      views: [
        {
          '#': 'message',
          '#view': 'Message',
        },
        {
          '#': 'message2',
          '#view': 'Message',
        },
      ],
    },
  ],
};

const viewSchema = new ViewSchema(basicData, { Eficy: EficyModel });

test('view Schema has Eficy child', t => {
  t.true(Object.keys(viewSchema.viewDataMap).includes('eficyComponent'));
});

test('view Schema did not has child of Eficy', t => {
  t.false(Object.keys(viewSchema.viewDataMap).includes('message'));
});

test('special model', t => {
  t.true(viewSchema.viewDataMap.eficyComponent instanceof EficyModel);
});

test('eficy scope viewDataMap', t => {
  t.is(Object.keys(viewSchema.viewDataMap.eficyComponent.viewDataMap).length, 1);
});
