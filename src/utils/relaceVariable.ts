import { get, mapDeep } from './index';

export function replaceStr(target: string, vars: any): any {
  const needToParse = /^\${([^}]+)}$/.test(target); // string to other type
  const reg = new RegExp('\\${([^}]+)}', 'g');

  const replaceOneReg = (value: string): string => {
    try {
      const valueScope = value.split('.')[0].replace(/\W+/gi, '');
      if (valueScope && Object.keys(vars).every(varName => varName !== valueScope)) {
        return `\$\{${value}\}`;
      }

      if (/^[^()]+$/.test(value)) {
        const notFound = Symbol('not found');
        const result = get(vars, value, notFound);
        if (result !== notFound) {
          return result;
        }
      }

      const fn = new Function(...Object.keys(vars), `return ${value}`);
      return fn(...Object.values(vars));
    } catch (e) {
      return '';
    }
  };

  // if there is only one replace token , replace result may not be string
  const replaceJustOneToParse = () => {
    const result = reg.exec(target);
    return replaceOneReg(result ? result[1] : '');
  };

  return needToParse
    ? replaceJustOneToParse()
    : target.replace(reg, ($value, value) => {
        return replaceOneReg(value);
      });
}

export default function createReplacer(ctxes): <T>(target: T) => T {
  return (target: any) => {
    if (target instanceof Object) {
      return mapDeep(target, obj => {
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          obj[key] = typeof value === 'string' ? replaceStr(value, ctxes) : value;
        });

        return obj;
      });
    } else if (typeof target === 'string') {
      return replaceStr(target, ctxes);
    }

    return target;
  };
}
