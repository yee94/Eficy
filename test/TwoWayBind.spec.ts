import test from 'ava';
import EficyController from '../src/core/Controller';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const basicData = {
  views: [
    {
      '#': 'input',
      '#view': 'input',
      value: 'value',
    },
    {
      '#': 'checkbox',
      '#view': 'input',
      checked: true,
    },
    {
      '#': 'input2',
      '#view': 'input',
      '#bindValuePropName': 'field2',
      field2: 'value',
      value: 'value',
    },
  ],
  plugins: ['two-way-bind'],
};

const controller = new EficyController(basicData);

const wrapper = mount(controller.resolver());

test('change input value', t => {
  wrapper.find(`input.eid-input`).simulate('change', { target: { value: 'hello' } });
  t.is(controller.models.input.value, 'hello');
});

test('change checkbox value', t => {
  wrapper.find('input.eid-checkbox').simulate('change', { target: { checked: false } });
  // @ts-ignore
  t.is(controller.models.checkbox.checked, false);
});

test('change self field', t => {
  wrapper.find('input.eid-input2').simulate('change', { target: { field2: 'hello' } });
  // @ts-ignore
  t.is(controller.models.input2.field2, 'hello');
});
