export function Hook(target, name, descriptor: PropertyDescriptor) {
  const targetFn = descriptor.value;
  const fnArr = [targetFn];

  const runAction = <T>(...args: [T]) => {
    const needToRunFn = [...fnArr];
    const next = (...nextArgs) => {
      const newArgs = [...args] as any;
      if (nextArgs.length) {
        Object.keys(nextArgs).forEach(key => {
          newArgs[key] = nextArgs[key];
        });
      }

      const fn = needToRunFn.pop();
      if (!fn) {
        throw new Error('Error Hook');
      }

      if (fn !== targetFn) {
        newArgs.splice(0, 0, next);
      }

      return fn(...newArgs);
    };

    const result = next();

    if (needToRunFn.length) {
      throw new Error('Error need to run next() in hooks!');
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
