import _cloneDeep from 'lodash/cloneDeep';
import _clone from 'lodash/clone';
import _isArray from 'lodash/isArray';
import _get from 'lodash/get';
import _pick from 'lodash/pick';
import _pickBy from 'lodash/pickBy';
import _isFunction from 'lodash/isFunction';
import _set from 'lodash/set';
import _isEmpty from 'lodash/isEmpty';
import _merge from 'lodash/merge';
import _mergeWith from 'lodash/mergeWith';
import _isEqual from 'lodash/isEqual';
import _isObject from 'lodash/isObject';

export const cloneDeep = _cloneDeep;
export const clone = _clone;
export const isArray = _isArray;
export const get = _get;
export const pick = _pick;
export const pickBy = _pickBy;
export const isFunction = _isFunction;
export const set = _set;
export const isEmpty = _isEmpty;
export const merge = _merge;
export const mergeWith = _mergeWith;
export const isEqual = _isEqual;
export const isObject = (arg: object) => _isObject(arg) && !isArray(arg);

export const MERGE_WAY = {
  REPLACE: (old, newData) => newData,
};

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

/**
 * transform one two some obj to Array
 * @param obj
 * @returns {T[]}
 */
export function toArr<T>(obj: T | T[]): T[] {
  if (!isArray(obj)) {
    obj = [obj as T];
  }

  return obj as T[];
}

/**
 * A plain object is a simple object literal, it is not an instance of a class. Returns true if the input `typeof` is `object` and directly decends from `Object`.
 *
 * @param input
 * @returns {false | boolean}
 */
export function isPlainObject(input) {
  if (isArray(input)) {
    return true;
  }
  return input !== null && typeof input === 'object' && input.constructor === Object;
}
