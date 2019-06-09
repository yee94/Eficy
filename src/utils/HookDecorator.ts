export function Hook(target, name, descriptor: PropertyDescriptor) {
  const targetFn = descriptor.value;
  const fnArr = [targetFn];

  const runAction = <T>(...args: [T]) => {
    const needToRunFn = [...fnArr];
    let result = null;
    const next = (...nextArgs) => {
      if (nextArgs.length) {
        Object.keys(nextArgs).forEach(key => {
          args[key] = nextArgs[key];
        });
      }
      const fn = needToRunFn.pop();
      if (!fn) {
        throw new Error('Error Hook');
      }

      if (fn !== targetFn) {
        fn(next, ...args);
      } else {
        result = fn(...args);
      }
    };
    next();
    if (result === undefined) {
      throw new Error('Error Hook No Result Return');
    }
    return result;
  };

  runAction.addHook = fn => {
    fnArr.push(fn);
  };
  runAction.removeHook = fn => {
    if (fnArr.includes(fn)) {
      fnArr.splice(fnArr.indexOf(fn), 1);
    }
  };

  descriptor.value = runAction;

  return descriptor;
}

export function Inject(target, name, descriptor: PropertyDescriptor) {
  if (!target.pluginHooks) {
    target.pluginHooks = [];
  }

  target.pluginHooks.push(name);

  return descriptor;
}
