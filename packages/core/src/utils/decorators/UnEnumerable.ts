export default function UnEnumerable(target, name: string, descriptor?: PropertyDescriptor): any {
  let fieldValue = null;

  if (!descriptor) {
    descriptor = {};
  }

  descriptor = {
    ...descriptor,
    enumerable: false,
    set(val) {
      fieldValue = val;
    },
    get() {
      return fieldValue;
    },
  };
  return descriptor;
}
