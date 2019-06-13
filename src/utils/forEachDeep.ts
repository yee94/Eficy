import React from 'react';
import { get, isArray } from './common';

const addPath = (...paths) => paths.join('.').replace(/^\./, '');

export type forDeep = <T>(object: T, cb: (obj: T, path: string) => void) => void;

const forEachDeep: forDeep = (object, cb) => {
  const ruedObjects: WeakSet<any> = new WeakSet();
  const fn = (path: string = '') => {
    const gotObject = path ? get(object, path) : object;
    if (!gotObject) {
      return;
    }
    if (React.isValidElement(gotObject)) {
      return;
    }
    if (ruedObjects.has(gotObject)) {
      // except loop
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
