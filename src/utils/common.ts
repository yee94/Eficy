import _cloneDeep from 'lodash/cloneDeep';
export const cloneDeep = _cloneDeep;
import _isArray from 'lodash/isArray';
export const isArray = _isArray;
import _get from 'lodash/get';
export const get = _get;
import _pickBy from 'lodash/pickBy';
export const pickBy = _pickBy;
import _isFunction from 'lodash/isFunction';
export const isFunction = _isFunction;

export function filterUndefined(obj: Record<string, any>) {
  return pickBy(obj, val => val !== undefined);
}

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

export function deleteObjectField(obj: object, key) {
  try {
    // node.js delete class field exception
    Reflect.deleteProperty(obj, key);
    // delete obj[key];
  } catch (e) {
    obj[key] = undefined;
  }
}
