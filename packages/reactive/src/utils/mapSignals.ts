import { clone, isDangerousKey, isIntString, traverse } from 'radashi';
import { isValidElement } from 'react';
import { isSignal } from './helpers';

// 定义信号类型
type Signal<T> = () => T;

// 递归映射对象类型
type MapSignalsDeep<T> = T extends Signal<infer U>
  ? MapSignalsDeep<U> // 递归处理信号值
  : T extends readonly (infer U)[]
  ? readonly MapSignalsDeep<U>[]
  : T extends (infer U)[]
  ? MapSignalsDeep<U>[]
  : T extends Record<string, any>
  ? { readonly [K in keyof T]: MapSignalsDeep<T[K]> }
  : T;

// fork from radashi, allow undefined value
function set(initial, path, value) {
  if (!initial) {
    return {};
  }
  if (!path) {
    return initial;
  }
  return (function recurse(object, keys2, index) {
    const key = keys2[index];
    object ??= isIntString(key) ? [] : {};
    if (isDangerousKey(key, object)) {
      throw new Error('Unsafe key in path: ' + key);
    }
    if (index < keys2.length - 1) {
      value = recurse(object[key], keys2, index + 1);
    }
    if (!Object.is(object[key], value)) {
      object = clone(object);
      object[key] = value;
    }
    return object;
  })(initial, path.match(/[^.[\]]+/g), 0);
}

/**
 * 映射对象中的信号值
 * 将信号值转换为实际值，支持嵌套对象和数组
 * 最大深度限制为 3 层
 */
export function mapSignals<T extends Record<string, any>, Depth extends number = 3>(
  obj: T,
  maxDepth: Depth = 3 as Depth,
): MapSignalsDeep<T> {
  if (!obj || typeof obj !== 'object') {
    return obj as MapSignalsDeep<T>;
  }

  // 使用浅拷贝避免修改原对象，但保留函数
  let result = Array.isArray(obj) ? [...obj] : { ...obj };

  traverse(result, (value, key, parent, context) => {
    const depth = context.parents?.length ?? 0;

    const pathStr = context.path.join('.');

    // 如果达到最大深度，跳过进一步遍历
    if (depth > maxDepth) {
      result = set(result, pathStr, value);
      context.skip();
      return;
    }

    if (isValidElement(value)) {
      result = set(result, pathStr, value);
      context.skip();
      return;
    }

    // 如果是信号，检查是否达到最大深度
    if (isSignal(value)) {
      result = set(result, pathStr, value());
      return;
    }
    result = set(result, pathStr, value);
  });

  return result as MapSignalsDeep<T>;
}

/**
 * 检查对象是否包含信号
 */
export function hasSignals<T extends Record<string, any>>(obj: T, maxDepth: number = 3): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  let hasSignal = false;

  traverse(obj, (value, key, parent, context) => {
    const depth = context.parents?.length ?? 0;
    if (depth > maxDepth) {
      context.skip();
      return;
    }

    if (isSignal(value)) {
      hasSignal = true;
      return false; // 找到信号后立即退出
    }
    return;
  });

  return hasSignal;
}
