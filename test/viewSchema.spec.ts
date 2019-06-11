import test from 'ava';
import { isEficyView, mapObjectDeep } from '../src/utils';
import { ViewSchema } from '../src/models';
import { isObservableProp } from 'mobx';

const basicData = {
  '#': 'form',
  '#view': 'Form',
  className: 'test',
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

const viewSchema = new ViewSchema(basicData);

test('when loaded all views(include children) became a ViewSchema', t => {
  let allChildrenViewSchema = 0;
  mapObjectDeep(viewSchema, obj => isEficyView(obj) && allChildrenViewSchema++);
  const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;
  t.is(basicDataCount, allChildrenViewSchema);
});

test('ViewSchema update restProps', t => {
  viewSchema.update({
    newField: 'test',
  });

  // @ts-ignore
  t.is(viewSchema.newField, 'test');
  t.is(viewSchema['#restProps'].newField, 'test');
  t.true(isObservableProp(viewSchema, 'newField'));
});

test('ViewSchema update Field props', t => {
  viewSchema.update({
    className: 'test2',
  });

  t.is(viewSchema.className, 'test2');
  t.true(isObservableProp(viewSchema, 'className'));
});

test('ViewSchema update solid Field', t => {
  t.throws(() =>
    viewSchema.update({
      '#view': 'test2',
    }),
  );
  t.throws(() =>
    viewSchema.update({
      '#children': [],
    }),
  );
});
