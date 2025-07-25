import { signal } from '../core/signal';
import { observableObject } from './object';
import { observableArray } from './array';
import { observableMap, observableSet } from './collections';
import { ref } from './ref';
import { isObject, isArray, isMap, isSet, isPrimitive } from '../utils/helpers';
import type { Signal } from '../types/index';

// ==================== 统一的 Observable 方法 ====================

/**
 * 创建可观察值的统一入口点（MobX 兼容）
 * 根据输入类型自动选择合适的可观察化方法
 */
export function observable<T>(value: T): T extends Array<infer U>
  ? ReturnType<typeof observableArray<U>>
  : T extends Map<infer K, infer V>
  ? ReturnType<typeof observableMap<K, V>>
  : T extends Set<infer U>
  ? ReturnType<typeof observableSet<U>>
  : T extends Record<string, any>
  ? ReturnType<typeof observableObject<T>>
  : Signal<T>;

export function observable<T>(value: T): any {
  // 数组
  if (isArray(value)) {
    return observableArray(value);
  }
  
  // Map
  if (isMap(value)) {
    return observableMap(value);
  }
  
  // Set
  if (isSet(value)) {
    return observableSet(value);
  }
  
  // 对象（普通对象，不包括 null, function, class instances）
  if (isObject(value) && value.constructor === Object) {
    return observableObject(value as Record<string, unknown>);
  }
  
  // 基本类型或其他类型，使用 signal
  return signal(value);
}

/**
 * 创建可观察的盒子（Box）- 用于包装基本类型值
 * 类似 MobX 的 observable.box()
 */
observable.box = <T>(value: T): Signal<T> => {
  return signal(value);
};

/**
 * 创建可观察对象 - 显式方法
 * 类似 MobX 的 observable.object()
 */
observable.object = <T extends Record<string, unknown>>(obj: T) => {
  return observableObject(obj);
};

/**
 * 创建可观察数组 - 显式方法
 * 类似 MobX 的 observable.array()
 */
observable.array = <T>(arr: T[] = []) => {
  return observableArray(arr);
};

/**
 * 创建可观察 Map - 显式方法
 * 类似 MobX 的 observable.map()
 */
observable.map = <K = any, V = any>(entries?: Iterable<[K, V]> | Record<string, V>) => {
  if (entries && typeof entries === 'object' && !Array.isArray(entries) && !(entries instanceof Map)) {
    // 如果是普通对象，转换为 entries
    const map = new Map<string, V>();
    for (const [key, value] of Object.entries(entries)) {
      map.set(key, value);
    }
    return observableMap(map as Map<K, V>);
  }
  // 处理 Iterable 类型
  return observableMap(entries as Iterable<[K, V]> ? new Map(entries as Iterable<[K, V]>) : new Map<K, V>());
};

/**
 * 创建可观察 Set - 显式方法
 * 类似 MobX 的 observable.set()
 */
observable.set = <T>(values?: Iterable<T>) => {
  return observableSet(values ? new Set(values) : new Set<T>());
};

/**
 * 创建引用 - 显式方法
 * 类似 Vue 的 ref
 */
observable.ref = <T>(value: T) => {
  return ref(value);
}; 