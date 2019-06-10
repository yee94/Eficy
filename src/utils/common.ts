import pickBy from 'lodash/pickBy';

export function filterUndefined(obj: Record<string, any>) {
  return pickBy(obj, val => val !== undefined);
}

export { default as cloneDeep } from 'lodash/cloneDeep';
export { default as isArray } from 'lodash/isArray';
export { default as get } from 'lodash/get';
export { default as pickBy } from 'lodash/pickBy';
export { default as isFunction } from 'lodash/isFunction';

export function transformHump(str: string): string {
  if (!str) {
    return '';
  }
  return str.replace(/[a-z]([A-Z])/g, '-$1').toLowerCase();
}

export function compose(...fns) {
  return fns.reduceRight((prevFn, nextFn) => (...args) => nextFn(prevFn(...args)), value => value);
}

export async function wait(time = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
