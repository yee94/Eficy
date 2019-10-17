import test from 'ava';
import { forEachDeep, get, isEficyView } from '../src/utils';
import { ViewSchema } from '../src/models';
import { isObservableProp } from 'mobx';
import EficyModel from '../src/components/EficyComponent/EficyModel';

const basicData = {
  '#': 'form',
  '#view': 'Form',
  className: 'test',
  newField: 'test',
  '#children': [
    {
      '#view': 'Form.Item',
      label: 'E-mail',
      '#children': [
        {
          '#': 'input',
          '#view': 'Input',
          '#field': {
            name: 'email',
            rules: [
              {
                type: 'email',
                message: 'The input is not valid E-mail!',
              },
            ],
          },
          placeholder: 'username',
          prefix: {
            '#view': 'Icon',
            type: 'user',
            style: { color: 'rgba(0,0,0,.25)' },
          },
        },
      ],
    },
    {
      '#view': 'Form.Item',
      label: 'password',
      '#children': [
        {
          '#view': 'Input.Password',
          '#field': {
            name: 'password',
            rules: [
              {
                required: true,
                message: 'Please input your Password!',
              },
            ],
          },
          placeholder: 'password',
          prefix: {
            '#view': 'Icon',
            type: 'lock',
          },
        },
      ],
    },
    {
      '#view': 'Form.Item',
      '#children': [
        {
          '#view': 'Checkbox',
          '#field': {
            name: 'remember',
            valuePropName: 'checked',
            initialValue: true,
          },
          '#content': 'Remember me',
        },
        {
          '#view': 'Button',
          type: 'primary',
          htmlType: 'submit',
          '#content': 'Login',
        },
      ],
    },
  ],
};

const viewSchema = new ViewSchema(basicData, { Eficy: EficyModel });

test('when loaded all views(include children) became a ViewSchema', t => {
  let allChildrenViewSchema = 0;
  forEachDeep(viewSchema, obj => isEficyView(obj) && allChildrenViewSchema++);
  const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;
  t.is(basicDataCount, allChildrenViewSchema);
});

test('lodash get field path', t => {
  const field = get(viewSchema, '#children.0.#children.0.#field', undefined);

  t.is(!!field, true);
});

test('ViewSchema update restProps', t => {
  viewSchema.update({
    newField: 'test',
  });

  // @ts-ignore
  t.is(viewSchema.newField, 'test');
  t.is(viewSchema['#restProps'].newField, 'test');
  t.true(!!get(viewSchema, 'newField', false));
});

test('ViewSchema update Field props', t => {
  viewSchema.update({
    className: 'test2',
  });

  t.is(viewSchema.className, 'test2');
  t.true(isObservableProp(viewSchema, 'className'));
});

test('ViewSchema update solid Field', t => {
  viewSchema.update({
    '#view': 'test2',
  });
  t.is(viewSchema['#view'], 'Form');
});

test('ViewSchema overwrite or delete fields', t => {
  viewSchema.overwrite({ style: { background: '#fff' }, newField2: 'cool' });

  // @ts-ignore
  t.is(viewSchema.newField, undefined);
  t.deepEqual(viewSchema['#restProps'], { newField2: 'cool' });
  // @ts-ignore
  t.is(viewSchema.newField, undefined);
  t.is(viewSchema.className, undefined);
  t.is(viewSchema['#children'], undefined);
});

test('ViewSchema overwrite solid fields', t => {
  viewSchema.overwrite({ style: { background: '#fff' }, newField2: 'cool' });

  t.is(viewSchema['#view'], 'Form');
  t.is(viewSchema['#'] !== undefined, true);
});

test.serial('ViewSchema overwrite children fields', t => {
  viewSchema.overwrite(basicData);

  let allChildrenViewSchema = 0;
  forEachDeep(viewSchema, obj => isEficyView(obj) && allChildrenViewSchema++);
  const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;

  t.is(basicDataCount, allChildrenViewSchema);
});

test('ViewSchema update restProps after overwrite', t => {
  viewSchema.update({
    newField: 'test',
  });

  // @ts-ignore
  t.is(viewSchema.newField, 'test');
  t.is(viewSchema['#restProps'].newField, 'test');
  t.true(!!get(viewSchema, 'newField', false));
});
