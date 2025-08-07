import { signal, effect } from './signal';
import type { Signal, Dispose } from '../types/index';
import { isObject, isArray, isPlainObject, isMap, isSet } from '../utils/helpers';

// ==================== 观察者系统 ====================

export interface DataChange {
  target: unknown;
  key?: string | number | symbol;
  type: 'set' | 'delete' | 'add' | 'clear' | 'has' | 'get';
  value?: unknown;
  oldValue?: unknown;
  path: (string | number | symbol)[];
}

export interface ObserveOptions {
  deep?: boolean;
  immediate?: boolean;
}

// 全局观察者注册表
const observers = new WeakMap<object, Set<ObserverEntry>>();
const observerPaths = new WeakMap<ObserverEntry, (string | number | symbol)[]>();

interface ObserverEntry {
  callback: (change: DataChange) => void;
  deep: boolean;
  target: object;
  dispose: Dispose;
}

/**
 * 观察对象的变化
 */
export function observe<T extends object>(
  target: T,
  callback: (change: DataChange) => void,
  options: ObserveOptions = {}
): Dispose {
  const { deep = true, immediate = false } = options;

  if (!isObject(target)) {
    throw new Error('observe() can only be used with objects');
  }

  // 创建观察者条目
  const observerEntry: ObserverEntry = {
    callback,
    deep,
    target,
    dispose: () => {}
  };

  // 设置观察者路径
  observerPaths.set(observerEntry, []);

  // 注册观察者
  if (!observers.has(target)) {
    observers.set(target, new Set());
  }
  const observerSet = observers.get(target);
  if (observerSet) {
    observerSet.add(observerEntry);
  }

  // 设置代理以拦截操作
  const proxy = createObservableProxy(target, []);

  // 如果是深度观察，递归设置代理
  if (deep) {
    setupDeepObservation(proxy, []);
  }

  // 立即执行一次回调
  if (immediate) {
    callback({
      target: proxy,
      type: 'get',
      path: []
    });
  }

  // 创建清理函数
  const dispose = () => {
    const observerSet = observers.get(target);
    if (observerSet) {
      observerSet.delete(observerEntry);
      if (observerSet.size === 0) {
        observers.delete(target);
      }
    }
    observerPaths.delete(observerEntry);
  };

  observerEntry.dispose = dispose;
  return dispose;
}

/**
 * 创建可观察的代理
 */
function createObservableProxy(target: object, path: (string | number | symbol)[]): object {
  if (!isObject(target)) {
    return target;
  }

  return new Proxy(target, {
    get(obj, key, receiver) {
      const value = Reflect.get(obj, key, receiver);
      
      // 通知观察者
      notifyObservers(obj, {
        target: obj,
        key,
        type: 'get',
        value,
        path: [...path, key]
      });

      // 如果值是对象，返回代理版本
      if (isObject(value)) {
        return createObservableProxy(value, [...path, key]);
      }

      return value;
    },

    set(obj, key, value, receiver) {
      const oldValue = Reflect.get(obj, key, receiver);
      const result = Reflect.set(obj, key, value, receiver);

      if (result) {
        notifyObservers(obj, {
          target: obj,
          key,
          type: 'set',
          value,
          oldValue,
          path: [...path, key]
        });
      }

      return result;
    },

    deleteProperty(obj, key) {
      const oldValue = Reflect.get(obj, key);
      const result = Reflect.deleteProperty(obj, key);

      if (result) {
        notifyObservers(obj, {
          target: obj,
          key,
          type: 'delete',
          oldValue,
          path: [...path, key]
        });
      }

      return result;
    },

    has(obj, key) {
      const result = Reflect.has(obj, key);
      
      notifyObservers(obj, {
        target: obj,
        key,
        type: 'has',
        value: result,
        path: [...path, key]
      });

      return result;
    }
  });
}

/**
 * 设置深度观察
 */
function setupDeepObservation(target: object, path: (string | number | symbol)[]): void {
  if (!isObject(target)) {
    return;
  }

  if (isArray(target)) {
    const arrayTarget = target as unknown[];
    for (let i = 0; i < arrayTarget.length; i++) {
      const value = arrayTarget[i];
      if (isObject(value)) {
        setupDeepObservation(value, [...path, i]);
      }
    }
  } else if (isPlainObject(target)) {
    for (const key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        const value = (target as Record<string, unknown>)[key];
        if (isObject(value)) {
          setupDeepObservation(value, [...path, key]);
        }
      }
    }
  } else if (isMap(target)) {
    try {
      const mapTarget = target as Map<unknown, unknown>;
      for (const [key, value] of mapTarget.entries()) {
        if (isObject(value) && (typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol')) {
          setupDeepObservation(value, [...path, key]);
        }
      }
    } catch (error) {
      // 忽略迭代错误
    }
  } else if (isSet(target)) {
    try {
      const setTarget = target as Set<unknown>;
      let index = 0;
      for (const value of setTarget.values()) {
        if (isObject(value)) {
          setupDeepObservation(value, [...path, index]);
        }
        index++;
      }
    } catch (error) {
      // 忽略迭代错误
    }
  }
}

/**
 * 通知观察者
 */
function notifyObservers(target: object, change: DataChange): void {
  const observerSet = observers.get(target);
  if (!observerSet) {
    return;
  }

  for (const observer of observerSet) {
    // 检查是否应该通知此观察者
    if (shouldNotifyObserver(observer, change)) {
      try {
        observer.callback(change);
      } catch (error) {
        console.error('Error in observe callback:', error);
      }
    }
  }
}

/**
 * 检查是否应该通知观察者
 */
function shouldNotifyObserver(observer: ObserverEntry, change: DataChange): boolean {
  // 如果不是深度观察，只观察直接属性
  if (!observer.deep && change.path.length > 1) {
    return false;
  }

  // 检查观察者目标是否匹配
  return change.target === observer.target || isDescendantOf(change.target, observer.target);
}

/**
 * 检查对象是否是另一个对象的后代
 */
function isDescendantOf(child: unknown, parent: unknown): boolean {
  if (!isObject(child) || !isObject(parent)) {
    return false;
  }

  // 这是一个简化版本，实际实现需要更复杂的路径追踪
  return false;
}

// ==================== 便捷观察函数 ====================

/**
 * 观察对象的特定属性
 */
export function observeProperty<T extends object, K extends keyof T>(
  target: T,
  key: K,
  callback: (newValue: T[K], oldValue: T[K]) => void
): Dispose {
  return observe(target, (change) => {
    if (change.key === key && change.type === 'set') {
      callback(change.value as T[K], change.oldValue as T[K]);
    }
  }, { deep: false });
}

/**
 * 观察数组的变化
 */
export function observeArray<T>(
  target: T[],
  callback: (change: ArrayChange<T>) => void
): Dispose {
  return observe(target, (change) => {
    const arrayChange: ArrayChange<T> = {
      type: change.type as 'set' | 'delete' | 'add',
      index: typeof change.key === 'number' ? change.key : -1,
      newValue: change.value as T,
      oldValue: change.oldValue as T,
      target: change.target as T[]
    };
    callback(arrayChange);
  });
}

export interface ArrayChange<T> {
  type: 'set' | 'delete' | 'add';
  index: number;
  newValue?: T;
  oldValue?: T;
  target: T[];
}

/**
 * 观察 Map 的变化
 */
export function observeMap<K, V>(
  target: Map<K, V>,
  callback: (change: MapChange<K, V>) => void
): Dispose {
  return observe(target, (change) => {
    const mapChange: MapChange<K, V> = {
      type: change.type as 'set' | 'delete' | 'clear',
      key: change.key as K,
      newValue: change.value as V,
      oldValue: change.oldValue as V,
      target: change.target as Map<K, V>
    };
    callback(mapChange);
  });
}

export interface MapChange<K, V> {
  type: 'set' | 'delete' | 'clear';
  key?: K;
  newValue?: V;
  oldValue?: V;
  target: Map<K, V>;
}

/**
 * 观察 Set 的变化
 */
export function observeSet<T>(
  target: Set<T>,
  callback: (change: SetChange<T>) => void
): Dispose {
  return observe(target, (change) => {
    const setChange: SetChange<T> = {
      type: change.type as 'add' | 'delete' | 'clear',
      value: change.value as T,
      target: change.target as Set<T>
    };
    callback(setChange);
  });
}

export interface SetChange<T> {
  type: 'add' | 'delete' | 'clear';
  value?: T;
  target: Set<T>;
}

// ==================== 高级观察功能 ====================

/**
 * 观察对象的深度变化并收集所有路径
 */
export function observeDeep<T extends object>(
  target: T,
  callback: (changes: DataChange[]) => void,
  options: { debounce?: number } = {}
): Dispose {
  const { debounce = 0 } = options;
  let changes: DataChange[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const flushChanges = () => {
    if (changes.length > 0) {
      callback([...changes]);
      changes = [];
    }
    timeoutId = null;
  };

  return observe(target, (change) => {
    changes.push(change);

    if (debounce > 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(flushChanges, debounce);
    } else {
      flushChanges();
    }
  }, { deep: true });
}

/**
 * 创建计算属性观察器
 */
export function observeComputed<T>(
  getter: () => T,
  callback: (newValue: T, oldValue: T) => void,
  options: { immediate?: boolean } = {}
): Dispose {
  const { immediate = false } = options;
  let oldValue: T;
  let isFirst = true;

  const dispose = effect(() => {
    const newValue = getter();
    
    if (!isFirst || immediate) {
      callback(newValue, oldValue);
    }
    
    oldValue = newValue;
    isFirst = false;
  });

  return dispose;
}

/**
 * 观察多个对象
 */
export function observeMultiple(
  targets: object[],
  callback: (change: DataChange & { targetIndex: number }) => void,
  options: ObserveOptions = {}
): Dispose {
  const disposers = targets.map((target, index) => 
    observe(target, (change) => {
      callback({ ...change, targetIndex: index });
    }, options)
  );

  return () => {
    for (const dispose of disposers) {
      dispose();
    }
  };
} 