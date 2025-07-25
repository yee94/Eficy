import forEachDeep, { IForEachDeepOpts } from './forEachDeep';
import { set } from './common';

type forDeep = <T>(object: T, cb: (obj: T, path: string) => T, options?: IForEachDeepOpts) => T;

const mapDeep: forDeep = (object, cb, options = {}) => {
  let newObject: any = object;
  forEachDeep(
    object,
    (obj, path) => {
      const result = cb(obj, path);
      if (!path) {
        newObject = result;
      } else {
        set(newObject, path, result);
      }
    },
    options,
  );
  return newObject;
};

export default mapDeep;
