import React from 'react';
import { Fragment } from 'react/jsx-runtime';
import { EficyNode } from './components/EficyNode';
import { hasReactiveProps, hasSignalChildren } from './utils/reactiveProps';

export { Fragment };

export interface JSXProps {
  children?: any;
  [key: string]: any;
}

function isEficyComponent(type: any): boolean {
  return typeof type === 'string' && type.startsWith('e-');
}

function needsReactiveWrapper(type: any, props: JSXProps): boolean {
  if (isEficyComponent(type)) return true;
  if (hasReactiveProps(props)) return true;
  if (props && hasSignalChildren(props.children)) return true;
  return false;
}

export function jsx(type: any, props: JSXProps = {}, key?: string): React.ReactElement {
  if (needsReactiveWrapper(type, props)) {
    return <EficyNode type={type} props={props} key={key} />;
  }

  return React.createElement(type, { ...props, key });
}

export function jsxs(type: any, props: JSXProps = {}, key?: string): React.ReactElement {
  return jsx(type, props, key);
}
