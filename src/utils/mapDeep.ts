import forEachDeep from './forEachDeep';
import { set } from './common';

type forDeep = <T>(
  object: T,
  cb: (obj: T, path: string) => T,

  exceptFns?: Array<(gotData: object) => boolean>,
) => T;

const mapDeep: forDeep = (object, cb, exceptFns = []) => {
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
    exceptFns,
  );
  return newObject;
};

export default mapDeep;
