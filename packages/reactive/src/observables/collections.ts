import { signal, computed } from '../core/signal';
import { effect } from '../core/signal';
import type { Signal, ComputedSignal, Dispose } from '../types/index';
import { markReactive, isRaw, markRaw } from '../utils/helpers';

// ==================== Observable Map ====================

export interface ObservableMap<K, V> extends Map<K, V> {
  readonly size: number;
  observe(callback: (operation: MapOperation<K, V>) => void): Dispose;
  toMap(): Map<K, V>;
}

export interface MapOperation<K, V> {
  type: 'set' | 'delete' | 'clear';
  key?: K;
  value?: V;
  oldValue?: V;
}

/**
 * 创建响应式 Map
 */
export function observableMap<K, V>(initialEntries?: Iterable<readonly [K, V]>): ObservableMap<K, V> {
  const _map = new Map(initialEntries);
  const _signal = signal(_map.size);
  const listeners = new Set<(operation: MapOperation<K, V>) => void>();

  const notifyListeners = (operation: MapOperation<K, V>) => {
    for (const listener of listeners) {
      listener(operation);
    }
  };

  const triggerUpdate = () => {
    _signal(_map.size);
  };

  const observableMapInstance = {
    // Map 接口实现
    get size() {
      _signal(); // 触发依赖收集
      return _map.size;
    },

    has(key: K): boolean {
      return _map.has(key);
    },

    get(key: K): V | undefined {
      return _map.get(key);
    },

    set(key: K, value: V): ObservableMap<K, V> {
      const oldValue = _map.get(key);
      const hasKey = _map.has(key);
      _map.set(key, value);
      
      // 如果是新 key 或者值发生变化，触发更新
      if (!hasKey || !Object.is(oldValue, value)) {
        triggerUpdate();
        notifyListeners({ type: 'set', key, value, oldValue });
      }
      
      return observableMapInstance;
    },

    delete(key: K): boolean {
      if (_map.has(key)) {
        const oldValue = _map.get(key);
        const result = _map.delete(key);
        triggerUpdate();
        notifyListeners({ type: 'delete', key, oldValue });
        return result;
      }
      return false;
    },

    clear(): void {
      if (_map.size > 0) {
        _map.clear();
        triggerUpdate();
        notifyListeners({ type: 'clear' });
      }
    },

    keys(): IterableIterator<K> {
      return _map.keys();
    },

    values(): IterableIterator<V> {
      return _map.values();
    },

    entries(): IterableIterator<[K, V]> {
      return _map.entries();
    },

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown): void {
      _map.forEach(callbackfn, thisArg);
    },

    [Symbol.iterator](): IterableIterator<[K, V]> {
      return _map[Symbol.iterator]();
    },

    get [Symbol.toStringTag]() {
      return 'ObservableMap';
    },

    // ObservableMap 特有方法
    observe(callback: (operation: MapOperation<K, V>) => void): Dispose {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },

    toMap(): Map<K, V> {
      return new Map(_map);
    }
  };

  markReactive(observableMapInstance);
  return observableMapInstance as ObservableMap<K, V>;
}

/**
 * 检查是否为响应式 Map
 */
export function isObservableMap<K, V>(value: unknown): value is ObservableMap<K, V> {
  return typeof value === 'object' && value !== null && 'observe' in value && 'toMap' in value;
}

// ==================== Observable Set ====================

export interface ObservableSet<T> extends Set<T> {
  readonly size: number;
  observe(callback: (operation: SetOperation<T>) => void): Dispose;
  toSet(): Set<T>;
}

export interface SetOperation<T> {
  type: 'add' | 'delete' | 'clear';
  value?: T;
}

/**
 * 创建响应式 Set
 */
export function observableSet<T>(initialValues?: Iterable<T>): ObservableSet<T> {
  const _set = new Set(initialValues);
  const _signal = signal(_set.size);
  const listeners = new Set<(operation: SetOperation<T>) => void>();

  const notifyListeners = (operation: SetOperation<T>) => {
    for (const listener of listeners) {
      listener(operation);
    }
  };

  const triggerUpdate = () => {
    _signal(_set.size);
  };

  const observableSetInstance = {
    // Set 接口实现
    get size() {
      _signal(); // 触发依赖收集
      return _set.size;
    },

    has(value: T): boolean {
      return _set.has(value);
    },

    add(value: T): ObservableSet<T> {
      if (!_set.has(value)) {
        _set.add(value);
        triggerUpdate();
        notifyListeners({ type: 'add', value });
      }
      return observableSetInstance;
    },

    delete(value: T): boolean {
      if (_set.has(value)) {
        const result = _set.delete(value);
        triggerUpdate();
        notifyListeners({ type: 'delete', value });
        return result;
      }
      return false;
    },

    clear(): void {
      if (_set.size > 0) {
        _set.clear();
        triggerUpdate();
        notifyListeners({ type: 'clear' });
      }
    },

    keys(): IterableIterator<T> {
      return _set.keys();
    },

    values(): IterableIterator<T> {
      return _set.values();
    },

    entries(): IterableIterator<[T, T]> {
      return _set.entries();
    },

    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: unknown): void {
      _set.forEach(callbackfn, thisArg);
    },

    [Symbol.iterator](): IterableIterator<T> {
      return _set[Symbol.iterator]();
    },

    get [Symbol.toStringTag]() {
      return 'ObservableSet';
    },

    // ObservableSet 特有方法
    observe(callback: (operation: SetOperation<T>) => void): Dispose {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },

    toSet(): Set<T> {
      return new Set(_set);
    }
  };

  markReactive(observableSetInstance);
  return observableSetInstance as ObservableSet<T>;
}

/**
 * 检查是否为响应式 Set
 */
export function isObservableSet<T>(value: unknown): value is ObservableSet<T> {
  return typeof value === 'object' && value !== null && 'observe' in value && 'toSet' in value;
}

// ==================== Observable WeakMap ====================

export interface ObservableWeakMap<K extends object, V> extends WeakMap<K, V> {
  observe(callback: (operation: WeakMapOperation<K, V>) => void): Dispose;
}

export interface WeakMapOperation<K, V> {
  type: 'set' | 'delete';
  key?: K;
  value?: V;
  oldValue?: V;
}

/**
 * 创建响应式 WeakMap
 */
export function observableWeakMap<K extends object, V>(): ObservableWeakMap<K, V> {
  const _weakMap = new WeakMap<K, V>();
  const listeners = new Set<(operation: WeakMapOperation<K, V>) => void>();

  const notifyListeners = (operation: WeakMapOperation<K, V>) => {
    for (const listener of listeners) {
      listener(operation);
    }
  };

  const observableWeakMapInstance = {
    has(key: K): boolean {
      return _weakMap.has(key);
    },

    get(key: K): V | undefined {
      return _weakMap.get(key);
    },

    set(key: K, value: V): ObservableWeakMap<K, V> {
      const oldValue = _weakMap.get(key);
      _weakMap.set(key, value);
      notifyListeners({ type: 'set', key, value, oldValue });
      return observableWeakMapInstance;
    },

    delete(key: K): boolean {
      if (_weakMap.has(key)) {
        const oldValue = _weakMap.get(key);
        const result = _weakMap.delete(key);
        notifyListeners({ type: 'delete', key, oldValue });
        return result;
      }
      return false;
    },

    get [Symbol.toStringTag]() {
      return 'ObservableWeakMap';
    },

    // ObservableWeakMap 特有方法
    observe(callback: (operation: WeakMapOperation<K, V>) => void): Dispose {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    }
  };

  markReactive(observableWeakMapInstance);
  return observableWeakMapInstance as ObservableWeakMap<K, V>;
}

/**
 * 检查是否为响应式 WeakMap
 */
export function isObservableWeakMap<K extends object, V>(value: unknown): value is ObservableWeakMap<K, V> {
  return typeof value === 'object' && value !== null && 'observe' in value && 
    typeof (value as Record<string, unknown>).has === 'function' && 
    typeof (value as Record<string, unknown>).get === 'function' && 
    typeof (value as Record<string, unknown>).set === 'function' && 
    typeof (value as Record<string, unknown>).delete === 'function' && 
    !('toMap' in value);
}

// ==================== Observable WeakSet ====================

export interface ObservableWeakSet<T extends object> extends WeakSet<T> {
  observe(callback: (operation: WeakSetOperation<T>) => void): Dispose;
}

export interface WeakSetOperation<T> {
  type: 'add' | 'delete';
  value?: T;
}

/**
 * 创建响应式 WeakSet
 */
export function observableWeakSet<T extends object>(): ObservableWeakSet<T> {
  const _weakSet = new WeakSet<T>();
  const listeners = new Set<(operation: WeakSetOperation<T>) => void>();

  const notifyListeners = (operation: WeakSetOperation<T>) => {
    for (const listener of listeners) {
      listener(operation);
    }
  };

  const observableWeakSetInstance = {
    has(value: T): boolean {
      return _weakSet.has(value);
    },

    add(value: T): ObservableWeakSet<T> {
      if (!_weakSet.has(value)) {
        _weakSet.add(value);
        notifyListeners({ type: 'add', value });
      }
      return observableWeakSetInstance;
    },

    delete(value: T): boolean {
      if (_weakSet.has(value)) {
        const result = _weakSet.delete(value);
        notifyListeners({ type: 'delete', value });
        return result;
      }
      return false;
    },

    get [Symbol.toStringTag]() {
      return 'ObservableWeakSet';
    },

    // ObservableWeakSet 特有方法
    observe(callback: (operation: WeakSetOperation<T>) => void): Dispose {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    }
  };

  markReactive(observableWeakSetInstance);
  return observableWeakSetInstance as ObservableWeakSet<T>;
}

/**
 * 检查是否为响应式 WeakSet
 */
export function isObservableWeakSet<T extends object>(value: unknown): value is ObservableWeakSet<T> {
  return typeof value === 'object' && value !== null && 'observe' in value && 
    typeof (value as Record<string, unknown>).has === 'function' && 
    typeof (value as Record<string, unknown>).add === 'function' && 
    typeof (value as Record<string, unknown>).delete === 'function' && 
    !('toSet' in value);
} 