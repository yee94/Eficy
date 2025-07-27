import EficyController from '../src/core/Controller';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { expect } from 'vitest';

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

test('change input value', (t) => {
  const { container } = render(controller.resolver());
  
  const inputElement = container.querySelector('input.eid-input');
  expect(inputElement).toBeTruthy();
  
  fireEvent.change(inputElement, { target: { value: 'hello' } });
  expect(controller.models.input.value).toBe('hello');
});
