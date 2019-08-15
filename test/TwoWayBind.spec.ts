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
