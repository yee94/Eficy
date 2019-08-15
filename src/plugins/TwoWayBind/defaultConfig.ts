import { IBindOption, IChangeFn } from './index';

export const makeDefaultChangeFn = (propName): IChangeFn => {
  return {
    onChange: e => {
      console.log('#################', propName, e.target[propName]);
      return { [propName]: e.target ? e.target[propName] : e };
    },
  };
};

export const defaultBindOptions: IBindOption[] = [
  { '#view': 'Input', changeFns: makeDefaultChangeFn('value') },
  { '#view': 'Input.TextArea', changeFns: makeDefaultChangeFn('value') },
  { '#view': 'InputNumber', changeFns: makeDefaultChangeFn('value') },
  { '#view': 'Slider', changeFns: makeDefaultChangeFn('value') },
  { '#view': 'Rate', changeFns: makeDefaultChangeFn('value') },
  { '#view': 'Select', changeFns: makeDefaultChangeFn('value') },
  { '#view': 'Switch', changeFns: makeDefaultChangeFn('checked') },
  { '#view': 'CheckBox', changeFns: makeDefaultChangeFn('checked') },
  { '#view': 'Radio', changeFns: makeDefaultChangeFn('checked') },
  { '#view': 'Radio.Group', changeFns: makeDefaultChangeFn('value') },
  { '#view': 'CheckBox.Group', changeFns: makeDefaultChangeFn('value') },
  {
    '#view': 'Upload',
    changeFns: {
      onChange: ({ fileList }) => ({ fileList }),
    },
  },
];
