import test from 'ava';
import { forEachDeep, get, isEficyView } from '../src/utils';
import { ViewNode } from '../src/models';
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

const viewNode = new ViewNode(basicData, { Eficy: EficyModel });

test('when loaded all views(include children) became a ViewNode', t => {
  let allChildrenViewNode = 0;
  forEachDeep(viewNode, obj => isEficyView(obj) && allChildrenViewNode++);
  const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;
  t.is(basicDataCount, allChildrenViewNode);
});

test('lodash get field path', t => {
  const field = get(viewNode, '#children.0.#children.0.#field', undefined);

  t.is(!!field, true);
});

test('ViewNode update restProps', t => {
  viewNode.update({
    newField: 'test',
  });

  // @ts-ignore
  t.is(viewNode.newField, 'test');
  t.is(viewNode['#restProps'].newField, 'test');
  t.true(!!get(viewNode, 'newField', false));
});

test('ViewNode update Field props', t => {
  viewNode.update({
    className: 'test2',
  });

  t.is(viewNode.className, 'test2');
  t.true(isObservableProp(viewNode, 'className'));
});

test('ViewNode update solid Field', t => {
  viewNode.update({
    '#view': 'test2',
  });
  t.is(viewNode['#view'], 'Form');
});

test('ViewNode overwrite or delete fields', t => {
  viewNode.overwrite({ style: { background: '#fff' }, newField2: 'cool' });

  // @ts-ignore
  t.is(viewNode.newField, undefined);
  t.deepEqual(viewNode['#restProps'], { newField2: 'cool' });
  // @ts-ignore
  t.is(viewNode.newField, undefined);
  t.is(viewNode.className, undefined);
  t.is(viewNode['#children'], undefined);
});

test('ViewNode overwrite solid fields', t => {
  viewNode.overwrite({ style: { background: '#fff' }, newField2: 'cool' });

  t.is(viewNode['#view'], 'Form');
  t.is(viewNode['#'] !== undefined, true);
});

test.serial('ViewNode overwrite children fields', t => {
  viewNode.overwrite(basicData);

  let allChildrenViewNode = 0;
  forEachDeep(viewNode, obj => isEficyView(obj) && allChildrenViewNode++);
  const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;

  t.is(basicDataCount, allChildrenViewNode);
});

test('ViewNode update restProps after overwrite', t => {
  viewNode.update({
    newField: 'test',
  });

  // @ts-ignore
  t.is(viewNode.newField, 'test');
  t.is(viewNode['#restProps'].newField, 'test');
  t.true(!!get(viewNode, 'newField', false));
});
