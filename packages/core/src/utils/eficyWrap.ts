import isEficyView from './isEficyView';
import { IView } from '../interface';
import { ReactElement } from 'react';
import * as React from 'react';
import { isEqual } from './common';

const createComponent = resolver => {
  return React.memo(res => resolver(res), (prevProps, nextProps) => isEqual(prevProps, nextProps));
};

const functionWrapMap = new Map();

export default function eficyWrap(fn: any, resolver: (result: IView) => ReactElement) {
  if (!functionWrapMap.has(fn)) {
    functionWrapMap.set(fn, createComponent(resolver));
  }
  const Component = functionWrapMap.get(fn);
  return (...args) => {
    const result = fn(...args);
    if (isEficyView(result)) {
      return React.createElement(Component, result);
    }
    return result;
  };
}
