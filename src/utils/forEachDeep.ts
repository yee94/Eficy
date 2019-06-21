import React from 'react';
import { get, isArray } from './common';

const addPath = (...paths) => paths.join('.').replace(/^\./, '');

export type forDeep = <T>(
  object: T,
  cb: (obj: T, path: string) => void,
  exceptFns?: Array<(gotData: object) => boolean>,
) => void;

const forEachDeep: forDeep = (object, cb, exceptFns = []) => {
  exceptFns = [gotObject => React.isValidElement(gotObject), ...exceptFns];
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
    if (exceptFns.some(exceptFn => exceptFn(gotObject))) {
      return;
    }

    ruedObjects.add(gotObject);

    Object.keys(gotObject).forEach(key => {
      const value = gotObject[key];
      if (typeof value !== 'object') {
        return;
      }
      if (isArray(value)) {
        value.forEach((tmp, ckey) => {
          fn(addPath(path, key, ckey));
        });
      } else {
        fn(addPath(path, key));
      }
    });

    cb(gotObject, path);
  };

  return fn();
};

export default forEachDeep;
