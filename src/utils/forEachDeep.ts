import React from 'react';
import { get, isArray } from './common';

const addPath = (...paths) => paths.join('.').replace(/^\./, '');

export interface IForEachDeepOpts {
  isIncludeArray?: boolean;
  exceptFns?: Array<(gotData: object, path: string) => boolean>;
}

export type forDeep = <T>(object: T, cb: (obj: T, path: string) => void, options?: IForEachDeepOpts) => void;

const forEachDeep: forDeep = (object, cb, options = {}) => {
  const exceptFns = get(options, 'exceptFns', []);
  const isIncludeArray = get(options, 'isIncludeArray', []);
  const ruedObjects: WeakSet<any> = new WeakSet();
  const fn = (path: string = '') => {
    const gotObject = path ? get(object, path) : object;
    if (!gotObject || typeof gotObject !== 'object') {
      return;
    }
    if (ruedObjects.has(gotObject)) {
      // except loop
      return;
    }
    if (React.isValidElement(gotObject)) {
      return;
    }

    ruedObjects.add(gotObject);

    cb(gotObject, path);

    if (!exceptFns.some(exceptFn => exceptFn(gotObject, path)) && !isArray(gotObject)) {
      Object.keys(gotObject).forEach(key => {
        const value = gotObject[key];
        if (typeof value !== 'object') {
          return;
        }
        if (isArray(value)) {
          if (isIncludeArray) {
            fn(addPath(path, key));
          }
          value.forEach((tmp, ckey) => {
            fn(addPath(path, key, ckey));
          });
        } else {
          fn(addPath(path, key));
        }
      });
    }
  };

  return fn();
};

export default forEachDeep;
