import { traverse } from 'radashi';
import { isSignal } from './helpers';
import { isValidElement } from 'react';

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
  const result = Array.isArray(obj) ? [...obj] : { ...obj };

  traverse(
    result,
    (value, key, parent, context) => {
      const depth = context.parents?.length ?? 0;

      // 如果达到最大深度，跳过进一步遍历
      if (depth > maxDepth) {
        context.skip();
        return;
      }

      if (isValidElement(value)) {
        context.skip();
        return;
      }

      // 如果是信号，检查是否达到最大深度
      if (isSignal(value)) {
        parent[key] = value();
      }
      return value as any;
    },
    { rootNeedsVisit: true },
  );

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
