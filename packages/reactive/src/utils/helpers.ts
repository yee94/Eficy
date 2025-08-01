import type { Signal, ComputedSignal } from '../types/index';
import { SIGNAL_MARKER } from '../types/index';

// ==================== 类型检查工具 ====================

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

export function isPrimitive(value: unknown): value is string | number | boolean | null | undefined | symbol | bigint {
  return value == null || typeof value !== 'object';
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  
  // 检查是否是普通对象
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function isMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map;
}

export function isSet(value: unknown): value is Set<unknown> {
  return value instanceof Set;
}

export function isWeakMap(value: unknown): value is WeakMap<object, unknown> {
  return value instanceof WeakMap;
}

export function isWeakSet(value: unknown): value is WeakSet<object> {
  return value instanceof WeakSet;
}

// ==================== 响应式系统工具 ====================

/**
 * 检查是否为信号
 */
export function isSignal(value: unknown): value is Signal<unknown> {
  return typeof value === 'function' && (value as any)[SIGNAL_MARKER] === true;
}

// 用于存储原始对象的 WeakMap
const rawMap = new WeakMap<object, unknown>();
const reactiveMap = new WeakMap<object, unknown>();

// 标记原始对象的 Symbol
const RAW_MARKER = Symbol('__reactive_raw__');
const REACTIVE_MARKER = Symbol('__reactive_reactive__');

/**
 * 获取响应式对象的原始版本
 */
export function toRaw<T>(value: T): T {
  // 如果是基本类型，直接返回
  if (isPrimitive(value)) {
    return value;
  }
  
  // 如果对象有原始版本，返回原始版本
  if (isObject(value) && rawMap.has(value)) {
    return rawMap.get(value) as T;
  }
  
  // 检查是否有 RAW_MARKER，返回对象本身（因为标记为原始对象）
  if (isObject(value) && RAW_MARKER in value) {
    return value;
  }
  
  return value;
}

/**
 * 深度获取原始对象
 */
export function toRawDeep<T>(value: T): T {
  if (isPrimitive(value)) {
    return value;
  }
  
  const raw = toRaw(value);
  
  if (isArray(raw)) {
    return (raw as unknown[]).map(item => toRawDeep(item)) as unknown as T;
  }
  
  if (isPlainObject(raw)) {
    const result: Record<string, unknown> = {};
    for (const key in raw as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        result[key] = toRawDeep((raw as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }
  
  return raw;
}

/**
 * 将响应式对象转换为普通 JavaScript 对象
 */
export function toJS<T>(value: T): T {
  if (isPrimitive(value)) {
    return value;
  }
  
  // 防止循环引用
  const visited = new WeakSet();
  
  function convert(val: unknown): unknown {
    if (isPrimitive(val)) {
      return val;
    }
    
    if (visited.has(val as object)) {
      return val; // 直接返回已访问的对象，保持引用
    }
    
    visited.add(val as object);
    
    const raw = toRaw(val);
    
    if (isArray(raw)) {
      const result = (raw as unknown[]).map(item => convert(item));
      visited.delete(val as object);
      return result;
    }
    
    if (isMap(raw)) {
      const result = new Map();
      for (const [key, mapValue] of raw) {
        result.set(convert(key), convert(mapValue));
      }
      visited.delete(val as object);
      return result;
    }
    
    if (isSet(raw)) {
      const result = new Set();
      for (const setValue of raw) {
        result.add(convert(setValue));
      }
      visited.delete(val as object);
      return result;
    }
    
    if (isPlainObject(raw)) {
      const result: Record<string, unknown> = {};
      for (const key in raw as Record<string, unknown>) {
        if (Object.prototype.hasOwnProperty.call(raw, key)) {
          result[key] = convert((raw as Record<string, unknown>)[key]);
        }
      }
      visited.delete(val as object);
      return result;
    }
    
    visited.delete(val as object);
    return raw;
  }
  
  return convert(value) as T;
}

/**
 * 标记对象为原始对象（非响应式）
 */
export function markRaw<T>(value: T): T {
  if (isPrimitive(value)) {
    return value;
  }
  
  if (isObject(value)) {
    // 添加原始标记
    Object.defineProperty(value, RAW_MARKER, {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    });
  }
  
  return value;
}

/**
 * 检查值是否被标记为原始对象
 */
export function isRaw(value: unknown): boolean {
  return isObject(value) && RAW_MARKER in value;
}

/**
 * 标记对象为响应式
 */
export function markReactive<T>(value: T): T {
  if (isPrimitive(value)) {
    return value;
  }
  
  if (isObject(value)) {
    Object.defineProperty(value, REACTIVE_MARKER, {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    });
  }
  
  return value;
}

/**
 * 检查值是否为响应式
 */
export function isReactive(value: unknown): boolean {
  return isObject(value) && REACTIVE_MARKER in value;
}

// ==================== 依赖收集检测 ====================

let isCollecting = false;

/**
 * 开始依赖收集
 */
export function startCollecting(): void {
  isCollecting = true;
}

/**
 * 停止依赖收集
 */
export function stopCollecting(): void {
  isCollecting = false;
}

/**
 * 检测函数是否触发了依赖收集
 */
export function hasCollected(fn?: () => void): boolean {
  if (!fn) {
    return isCollecting;
  }
  
  const wasCollecting = isCollecting;
  isCollecting = false; // 重置状态
  
  try {
    fn(); // 执行函数
    const hasTriggeredCollection = isCollecting; // 检查是否有依赖收集
    return hasTriggeredCollection;
  } finally {
    isCollecting = wasCollecting; // 恢复原始状态
  }
}

/**
 * 在依赖收集上下文中执行函数
 */
export function withCollecting<T>(fn: () => T): T {
  const wasCollecting = isCollecting;
  isCollecting = true;
  
  try {
    return fn();
  } finally {
    isCollecting = wasCollecting;
  }
}

// ==================== 其他工具函数 ====================

/**
 * 深度克隆对象
 */
export function deepClone<T>(value: T): T {
  if (isPrimitive(value)) {
    return value;
  }
  
  if (isArray(value)) {
    return (value as unknown[]).map(item => deepClone(item)) as unknown as T;
  }
  
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key in value as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = deepClone((value as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }
  
  return value;
}

/**
 * 浅层克隆对象
 */
export function shallowClone<T>(value: T): T {
  if (isPrimitive(value)) {
    return value;
  }
  
  if (isArray(value)) {
    return [...value] as unknown as T;
  }
  
  if (isPlainObject(value)) {
    return { ...(value as object) } as T;
  }
  
  return value;
}

/**
 * 浅层比较
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  
  if (isPrimitive(a) || isPrimitive(b)) {
    return false;
  }
  
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) {
      return false;
    }
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      if (!Object.is(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  
  return false;
}

/**
 * 深度比较
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  
  if (isPrimitive(a) || isPrimitive(b)) {
    return false;
  }
  
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) {
      return false;
    }
    
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  
  return false;
}

// ==================== 调试工具 ====================

/**
 * 创建调试器
 */
export function createDebugger(name: string) {
  return {
    log: (...args: unknown[]) => {
      console.log(`[${name}]`, ...args);
    },
    warn: (...args: unknown[]) => {
      console.warn(`[${name}]`, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(`[${name}]`, ...args);
    }
  };
}

/**
 * 创建计时器
 */
export function createTimer(name: string) {
  let startTime: number;
  
  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const endTime = performance.now();
      console.log(`[${name}] took ${endTime - startTime} milliseconds`);
      return endTime - startTime;
    }
  };
} 