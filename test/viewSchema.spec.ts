import { assert } from 'chai';
import { ViewSchema } from '../src/models';
import { isEficyView, mapObjectDeep } from '../src/utils';

describe('Test ViewSchema basic method', () => {
  const basicData = {
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

  it('when loaded all views(include children) became a ViewSchema', () => {
    let allChildrenViewSchema = 0;
    mapObjectDeep(viewSchema, obj => isEficyView(obj) && allChildrenViewSchema++);
    const basicDataCount = (JSON.stringify(basicData).match(/#view/g) || []).length;
    assert.equal(basicDataCount, allChildrenViewSchema);
  });
});
