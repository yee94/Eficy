import React from 'react';
import { get, isArray } from './common';

const addPath = (...paths) => paths.join('.').replace(/^\./, '');

export default function mapObjectDeep<T>(object: T, cb: (obj: T, path: string) => void | any): T {
  const ruedObjects: WeakSet<any> = new WeakSet();
  const fn = (path: string = '') => {
    const gotObject = path ? get(object, path) : object;
    if (!gotObject) {
      return gotObject;
    }
    if (React.isValidElement(gotObject)) {
      return gotObject;
    }
    const newObject = Object.assign({}, gotObject);
    if (ruedObjects.has(gotObject)) {
      // except loop
      return newObject;
    }

    ruedObjects.add(gotObject);

    Object.keys(newObject).map(key => {
      const value = newObject[key];
      if (typeof value !== 'object') {
        return;
      }
      if (isArray(value)) {
        newObject[key] = value.map((tmp, ckey) => fn(addPath(path, key, ckey)));
      } else {
        newObject[key] = fn(addPath(path, key));
      }
    });

    return cb(newObject, path);
  };

  return fn();
}
