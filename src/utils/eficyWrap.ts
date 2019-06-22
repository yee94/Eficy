import isEficyView from './isEficyView';
import { IView } from '../interface';
import { ReactElement } from 'react';

export default function eficyWrap(fn: any, resolver: (result: IView) => ReactElement) {
  return (...args) => {
    const result = fn(...args);
    if (isEficyView(result)) {
      return resolver(result);
    }
    return result;
  };
}
