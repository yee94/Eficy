import { get, mapDeep } from './index';

export interface IReplaceOptions {
  keepExpression: boolean;
}

export function replaceStr(target: string, vars: any, options?: IReplaceOptions): any {
  const { keepExpression = true } = options || {};
  const needToParse = /^\${([^}]+)}$/.test(target); // string to other type
  const reg = new RegExp('\\${([^}]+)}', 'g');

  const replaceOneReg = (value: string): string => {
    try {
      if (/^[^()=!<>+]+$/.test(value)) {
        const notFound = Symbol('not found');
        const result = get(vars, value, notFound);
        if (result !== notFound) {
          return result;
        } else if (/^[\w.]+$/.test(value) && keepExpression) {
          return `\$\{${value}\}`;
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
        const result = replaceOneReg(value);
        if (result === undefined) {
          return '';
        }
        return result;
      });
}

export default function createReplacer(ctxes): <T>(target: T) => T {
  return (target: any, options?: IReplaceOptions) => {
    if (target instanceof Object) {
      mapDeep(
        target,
        obj => {
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            obj[key] = typeof value === 'string' ? replaceStr(value, ctxes, options) : value;
          });

          return obj;
        },
        { isIncludeArray: true },
      );
    } else if (typeof target === 'string') {
      return replaceStr(target, ctxes, options);
    }

    return target;
  };
}
