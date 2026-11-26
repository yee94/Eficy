import { createElement, Fragment } from './react';

type CreateElementFn = (
  type: unknown,
  props?: Record<string, unknown> | null,
  ...children: unknown[]
) => unknown;

export { Fragment };

export function jsx(
  type: unknown,
  props: Record<string, unknown> | null,
  key?: unknown
) {
  const fn = createElement as CreateElementFn;
  if (key !== undefined) {
    return fn(type, { ...props, key });
  }
  return fn(type, props);
}

export function jsxs(
  type: unknown,
  props: Record<string, unknown> | null,
  key?: unknown
) {
  const fn = createElement as CreateElementFn;
  if (!props) {
    return fn(type, key !== undefined ? { key } : null);
  }
  const { children, ...rest } = props;
  const nextProps = key !== undefined ? { ...rest, key } : rest;
  if (Array.isArray(children)) {
    return fn(type, nextProps, ...children);
  }
  return children !== undefined ? fn(type, nextProps, children) : fn(type, nextProps);
}

export function jsxDEV(
  type: unknown,
  props: Record<string, unknown> | null,
  key?: unknown,
  isStaticChildren?: boolean
) {
  return isStaticChildren ? jsxs(type, props, key) : jsx(type, props, key);
}
