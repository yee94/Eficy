import test from 'ava';
import { EficySchema } from '../src/models';

const basicData = {
  views: [
    {
      '#': 'alert',
      '#view': 'Alert',
      message: 'Hello this is a Login demo',
      type: 'info',
      showIcon: true,
    },
    {
      '#': 'form',
      '#view': 'Form',
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
              prefixes: [
                {
                  '#view': 'Icon',
                  type: 'user',
                  style: { color: 'rgba(0,0,0,.25)' },
                },
                {
                  '#view': 'Icon',
                  type: 'user',
                  style: { color: 'rgba(0,0,0,.25)' },
                },
              ],
              prefixObj: {
                prefix1: {
                  '#view': 'Icon',
                  type: 'user',
                  style: { color: 'rgba(0,0,0,.25)' },
                },
                prefix2: {
                  '#view': 'Icon',
                  type: 'user',
                  style: { color: 'rgba(0,0,0,.25)' },
                },
              },
              prefixC: {
                prefix: {
                  '#view': 'Icon',
                  type: 'user',
                  style: { color: 'rgba(0,0,0,.25)' },
                },
                '#view': 'Icon',
                type: 'user',
                style: { color: 'rgba(0,0,0,.25)' },
              },
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
    },
  ],
  plugins: ['ant-form'],
};

const eficySchema = new EficySchema(basicData);

test('load EficySchema check views number', t => {
  const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;
  t.is(Object.keys(eficySchema.viewDataMap).length, basicDataCount);
});

test('load EficySchema check plugins', t => {
  t.is(eficySchema.plugins.length, 1);
});

test('update EfficySchema ', t => {
  eficySchema.update({
    views: [
      {
        '#': 'input',
        placeholder: 'test',
      },
    ],
  });

  // @ts-ignore
  t.is(eficySchema.viewDataMap.input.placeholder, 'test');
});

test('overwrite EfficySchema', t => {
  eficySchema.overwrite({
    views: [
      {
        '#': 'form',
        newField: 'test',
      },
    ],
  });

  t.is(eficySchema.viewDataMap.form['#children'], undefined);
  // @ts-ignore
  t.is(eficySchema.viewDataMap.form.newField, 'test');
  t.is(Object.keys(eficySchema.viewDataMap).length, 2);
  // @ts-ignore
  t.is(eficySchema.viewDataMap.alert.message, 'Hello this is a Login demo');
});
