import { get, isArray } from './common';

const addPath = (...paths) => paths.join('.').replace(/^\./, '');

export default function mapObjectDeep<T>(object: T, cb: (obj: T, path: string) => void | any): T {
  const ruedPaths: string[] = [];
  const fn = (path: string = '') => {
    const newObject = Object.assign({}, path ? get(object, path) : object);
    ruedPaths.push(path);
    if (ruedPaths.indexOf(path)) {
      // except loop
      // return newObject;
    }

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
