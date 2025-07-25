import type { ObservableArray, ObservableObject, Ref } from '../types/index';

// ==================== 类型检查工具 ====================

/**
 * 检查是否为基本类型
 */
export function isPrimitive(value: unknown): boolean {
  return value === null || 
    value === undefined || 
    typeof value === 'string' || 
    typeof value === 'number' || 
    typeof value === 'boolean' || 
    typeof value === 'symbol' || 
    typeof value === 'bigint';
}

/**
 * 检查是否为对象类型
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && 
    typeof value === 'object' && 
    !Array.isArray(value);
}

/**
 * 检查是否为数组类型
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * 检查是否为函数类型
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

// ==================== 对象操作工具 ====================

/**
 * 深度克隆
 */
export function deepClone<T>(obj: T): T {
  if (isPrimitive(obj)) {
    return obj;
  }

  if (isArray(obj)) {
    return (obj as unknown[]).map(item => deepClone(item)) as unknown as T;
  }

  if (isObject(obj)) {
    const cloned = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
      }
    }
    return cloned as T;
  }

  return obj;
}

/**
 * 浅层克隆
 */
export function shallowClone<T>(obj: T): T {
  if (isPrimitive(obj)) {
    return obj;
  }

  if (isArray(obj)) {
    return [...(obj as unknown[])] as unknown as T;
  }

  if (isObject(obj)) {
    return { ...(obj as Record<string, unknown>) } as T;
  }

  return obj;
}

/**
 * 对象属性比较
 */
export function shallowEqual<T>(obj1: T, obj2: T): boolean {
  if (Object.is(obj1, obj2)) {
    return true;
  }

  if (!isObject(obj1) || !isObject(obj2)) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
      return false;
    }
    if (!Object.is((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * 深度比较
 */
export function deepEqual<T>(obj1: T, obj2: T): boolean {
  if (Object.is(obj1, obj2)) {
    return true;
  }

  if (isPrimitive(obj1) || isPrimitive(obj2)) {
    return false;
  }

  if (isArray(obj1) && isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }

  if (isObject(obj1) && isObject(obj2)) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    return keys1.every(key => 
      Object.prototype.hasOwnProperty.call(obj2, key) &&
      deepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])
    );
  }

  return false;
}

// ==================== 响应式工具 ====================

/**
 * 将响应式对象转换为普通值
 */
export function toRaw<T>(value: T | ObservableArray<unknown> | ObservableObject<unknown> | Ref<T>): T {
  // 检查是否为响应式数组
  if (value && typeof value === 'object' && 'toArray' in value && typeof value.toArray === 'function') {
    return (value as ObservableArray<unknown>).toArray() as unknown as T;
  }

  // 检查是否为响应式对象
  if (value && typeof value === 'object' && 'toObject' in value && typeof value.toObject === 'function') {
    return (value as ObservableObject<unknown>).toObject() as unknown as T;
  }

  // 检查是否为 ref
  if (value && typeof value === 'object' && 'value' in value) {
    return (value as Ref<T>).value;
  }

  return value as T;
}

/**
 * 递归转换响应式对象为普通对象
 */
export function toRawDeep<T>(value: T): T {
  const raw = toRaw(value);

  if (isArray(raw)) {
    return (raw as unknown[]).map(item => toRawDeep(item)) as unknown as T;
  }

  if (isObject(raw)) {
    const result = {} as Record<string, unknown>;
    for (const key in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        result[key] = toRawDeep((raw as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }

  return raw;
}

// ==================== 调试工具 ====================

/**
 * 创建调试标签
 */
export function createDebugger(tag: string) {
  return {
    log: (...args: unknown[]) => {
      console.log(`[${tag}]`, ...args);
    },
    warn: (...args: unknown[]) => {
      console.warn(`[${tag}]`, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(`[${tag}]`, ...args);
    }
  };
}

/**
 * 性能计时器
 */
export function createTimer(name: string) {
  const start = performance.now();
  
  return {
    end: () => {
      const end = performance.now();
      console.log(`[Timer] ${name}: ${end - start}ms`);
      return end - start;
    }
  };
} 