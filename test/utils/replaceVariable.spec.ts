import createReplacer, { replaceStr } from '../../src/utils/relaceVariable';
import { ViewNode } from '../../src/models';

// tslint:disable-next-line:no-empty
const fn = () => {};

const basicData = {
  '#': 'form',
  '#view': 'Form',
  className: 'test',
  newField: 'test',
  bool: true,
  fn,
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

const viewNode = new ViewNode(basicData);

// @ts-ignore
viewNode.getViewDataMap = function (key: string) {
  return this.viewDataMap[key];
};

test('replace basic', () => {
  expect(replaceStr('Hello ${model.viewDataMap.form.#view}', { model: viewNode })).toBe('Hello Form');
  expect(replaceStr('Hello ${model.undefined}', { model: viewNode })).toBe('Hello ${model.undefined}');
  expect(
    replaceStr('Hello ${model.viewDataMap.form.#view} , Hello ${model.viewDataMap.form.#}', { model: viewNode }),
  ).toBe('Hello Form , Hello form');
  expect(replaceStr('Hello ${model.getViewDataMap("form")["#view"]}', { model: viewNode })).toBe('Hello Form');
});

test('replacer replace function', () => {
  expect(replaceStr('Hello ${isTrue==="0"}', { isTrue: '0' })).toBe('Hello true');
  expect(replaceStr('${!!isTrue}', { isTrue: '0' })).toBe(true);
  expect(replaceStr('${isTrue.0.asd}', { isTrue: '0' })).toBe('${isTrue.0.asd}');
});

test('replace other type', () => {
  expect(replaceStr('${model.viewDataMap.form.#view}', { model: viewNode })).toBe('Form');
  expect(replaceStr('${model.viewDataMap.form.bool}', { model: viewNode })).toBe(true);
  expect(replaceStr('${model.viewDataMap.form.fn}', { model: viewNode })).toBe(fn);
});

const replacer = createReplacer({ model: viewNode });

test('replacer replace str', () => {
  expect(replacer('Hello ${model.viewDataMap.form.#view}')).toBe('Hello Form');
});

test('replacer replace object', () => {
  expect(
    replacer({
      testField: 'Hello ${model.viewDataMap.form.#view}',
    }),
  ).toEqual({
    testField: 'Hello Form',
  });
  expect(
    replacer({
      t: {
        tc: {
          testField: 'Hello ${model.viewDataMap.form.#view}',
        },
        other: 'Hello ${model.viewDataMap.form.#view}',
        other1: true,
        other2: null,
        other3: fn,
      },
    }),
  ).toEqual({
    t: {
      tc: {
        testField: 'Hello Form',
      },
      other: 'Hello Form',
      other1: true,
      other2: null,
      other3: fn,
    },
  });
});
