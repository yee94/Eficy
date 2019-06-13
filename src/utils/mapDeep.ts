import forEachDeep from './forEachDeep';
import { set } from './common';

type forDeep = <T>(object: T, cb: (obj: T, path: string) => T) => T;

const mapDeep: forDeep = (object, cb) => {
  let newObject: any = object;
  forEachDeep(object, (obj, path) => {
    const result = cb(obj, path);
    if (!path) {
      newObject = result;
    } else {
      set(newObject, path, result);
    }
  });
  return newObject;
};

export default mapDeep;
