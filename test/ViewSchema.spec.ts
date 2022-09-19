import { forEachDeep, get, isEficyView } from '../src/utils';
import { ViewNode } from '../src/models';
import { isObservableProp } from 'mobx';
import EficyModel from '../src/components/EficyComponent/EficyModel';
import { expect } from 'vitest';

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

test('when loaded all views(include children) became a ViewNode', (t) => {
  let allChildrenViewNode = 0;
  forEachDeep(viewNode, (obj) => isEficyView(obj) && allChildrenViewNode++);
  const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;
  expect(basicDataCount).toBe(allChildrenViewNode);
});

test('lodash get field path', (t) => {
  const field = get(viewNode, '#children.0.#children.0.#field', undefined);

  expect(!!field).toBe(true);
});

test('ViewNode update restProps', (t) => {
  viewNode.update({
    newField: 'test',
  });

  // @ts-ignore
  expect(viewNode.newField).toBe('test');
  expect(viewNode['#restProps'].newField).toBe('test');
  expect(!!get(viewNode, 'newField', false)).toBeTruthy();
});

test('ViewNode update Field props', (t) => {
  viewNode.update({
    className: 'test2',
  });

  expect(viewNode.className).toBe('test2');
  expect(isObservableProp(viewNode, 'className')).toBeTruthy();
});

test('ViewNode update solid Field', (t) => {
  viewNode.update({
    '#view': 'test2',
  });
  expect(viewNode['#view']).toBe('Form');
});

test('ViewNode overwrite or delete fields', (t) => {
  viewNode.overwrite({ style: { background: '#fff' }, newField2: 'cool' });

  // @ts-ignore
  expect(viewNode.newField).toBe(undefined);
  expect(viewNode['#restProps']).toEqual({ newField2: 'cool' });
  // @ts-ignore
  expect(viewNode.newField).toBe(undefined);
  expect(viewNode.className).toBe(undefined);
  expect(viewNode['#children']).toBe(undefined);
});

test('ViewNode overwrite solid fields', (t) => {
  viewNode.overwrite({ style: { background: '#fff' }, newField2: 'cool' });

  expect(viewNode['#view']).toBe('Form');
  expect(viewNode['#'] !== undefined).toBe(true);
});

test('ViewNode overwrite children fields', (t) => {
  viewNode.overwrite(basicData);

  let allChildrenViewNode = 0;
  forEachDeep(viewNode, (obj) => isEficyView(obj) && allChildrenViewNode++);
  const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;

  expect(basicDataCount).toBe(allChildrenViewNode);
});

test('ViewNode update restProps after overwrite', (t) => {
  viewNode.update({
    newField: 'test',
  });

  // @ts-ignore
  expect(viewNode.newField).toBe('test');
  expect(viewNode['#restProps'].newField).toBe('test');
  expect(!!get(viewNode, 'newField', false)).toBeTruthy();
});
