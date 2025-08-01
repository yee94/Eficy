import { Signal } from '@preact/signals-react';
import { Fragment } from 'react/jsx-runtime';
import { observer } from '../observer';

export const SFragment = observer((props: { children: Signal<any> }) => {
  return <Fragment {...props} />;
});
