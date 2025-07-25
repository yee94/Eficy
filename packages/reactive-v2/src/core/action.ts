import { batch } from './batch';
import type { ActionFunction, ActionOptions } from '../types/index';

// ==================== Action 实现 ====================

/**
 * 创建 action 函数，自动批处理状态更新
 */
export function action<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  options?: ActionOptions
): ActionFunction<Args, Return> {
  const actionFn = function(this: unknown, ...args: Args): Return {
    return batch(() => {
      try {
        return fn.apply(this, args);
      } catch (error) {
        console.error(`Error in action "${fn.name || 'anonymous'}":`, error);
        throw error;
      }
    });
  } as ActionFunction<Args, Return>;

  // 标记为 action 函数
  Object.defineProperty(actionFn, '__isAction', {
    value: true,
    enumerable: false,
    writable: false
  });

  // 保存原始函数引用
  Object.defineProperty(actionFn, '__originalFunction', {
    value: fn,
    enumerable: false,
    writable: false
  });

  // 设置函数名
  if (options?.name || fn.name) {
    Object.defineProperty(actionFn, 'name', {
      value: options?.name || `action(${fn.name})`,
      configurable: true
    });
  }

  return actionFn;
}

// ==================== Action 工具函数 ====================

/**
 * 检查函数是否为 action
 */
export function isAction(fn: unknown): fn is ActionFunction<unknown[], unknown> {
  return typeof fn === 'function' && 
    Object.prototype.hasOwnProperty.call(fn, '__isAction') &&
    ((fn as unknown) as Record<string, unknown>).__isAction === true;
}

/**
 * 获取 action 的原始函数
 */
export function getOriginalFunction<Args extends unknown[], Return>(
  actionFn: ActionFunction<Args, Return>
): ((...args: Args) => Return) | null {
  if (isAction(actionFn)) {
    return (((actionFn as unknown) as Record<string, unknown>).__originalFunction as (...args: Args) => Return) || null;
  }
  return null;
}

// ==================== Action 装饰器 ====================

/**
 * Action 装饰器
 */
export function actionDecorator(
  target: Record<string, unknown>,
  propertyKey: string,
  descriptor: PropertyDescriptor,
  options?: ActionOptions
): PropertyDescriptor {
  if (descriptor.value && typeof descriptor.value === 'function') {
    const originalMethod = descriptor.value;
    descriptor.value = action(originalMethod, {
      name: options?.name || `${(target.constructor as { name?: string }).name || 'Unknown'}.${propertyKey}`,
      ...options
    });
  }
  return descriptor;
}

// ==================== 绑定 Action ====================

/**
 * 创建绑定的 action
 */
export function boundAction<Args extends unknown[], Return>(
  fn: ActionFunction<Args, Return>,
  thisArg?: unknown,
  options?: ActionOptions
): ActionFunction<Args, Return> {
  // 如果提供了 thisArg，直接绑定
  if (thisArg !== undefined) {
    const boundFn = fn.bind(thisArg);
    return action(boundFn, options);
  }
  
  // 如果没有提供 thisArg，创建一个延迟绑定的函数
  // 这个函数会在调用时绑定到当前的 this 上下文
  const boundFn = (function(this: unknown, ...args: Args): Return {
    return fn.apply(this, args);
  });
  
  return action(boundFn, options);
} 