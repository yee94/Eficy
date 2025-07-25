import { effect } from './signal';
import type { Dispose, WatchCallback } from '../types/index';

// ==================== Watch 实现 ====================

/**
 * 监听响应式值的变化
 */
export function watch<T>(
  getValue: () => T,
  callback: WatchCallback<T>,
  options?: {
    immediate?: boolean;
    deep?: boolean;
  }
): Dispose {
  let oldValue: T;
  let isFirstRun = true;

  // 如果设置了 immediate，立即执行一次获取初始值
  if (options?.immediate) {
    try {
      oldValue = getValue();
      callback(oldValue, undefined as T);
      isFirstRun = false;
    } catch (error) {
      console.warn('Error getting initial value in watch:', error);
    }
  }

  return effect(() => {
    let newValue: T;
    
    try {
      newValue = getValue();
    } catch (error) {
      console.error('Error in watch getter:', error);
      return;
    }

    if (isFirstRun) {
      oldValue = newValue;
      isFirstRun = false;
      return;
    }

    // 值比较
    if (!Object.is(newValue, oldValue)) {
      try {
        callback(newValue, oldValue);
      } catch (error) {
        console.error('Error in watch callback:', error);
      }
      oldValue = newValue;
    }
  });
}

/**
 * 监听多个响应式值
 */
export function watchMultiple<T extends readonly unknown[]>(
  getters: { [K in keyof T]: () => T[K] },
  callback: (newValues: T, oldValues: T) => void,
  options?: {
    immediate?: boolean;
  }
): Dispose {
  let oldValues: T;
  let isFirstRun = true;

  if (options?.immediate) {
    try {
      oldValues = getters.map(getter => getter()) as unknown as T;
      callback(oldValues, undefined as T);
      isFirstRun = false;
    } catch (error) {
      console.warn('Error getting initial values in watchMultiple:', error);
    }
  }

  return effect(() => {
    let newValues: T;
    
    try {
      newValues = getters.map(getter => getter()) as unknown as T;
    } catch (error) {
      console.error('Error in watchMultiple getters:', error);
      return;
    }

    if (isFirstRun) {
      oldValues = newValues;
      isFirstRun = false;
      return;
    }

    // 检查是否有任何值发生变化
    const hasChanged = newValues.some((newVal, index) => 
      !Object.is(newVal, oldValues[index])
    );

    if (hasChanged) {
      try {
        callback(newValues, oldValues);
      } catch (error) {
        console.error('Error in watchMultiple callback:', error);
      }
      oldValues = newValues;
    }
  });
}

/**
 * 一次性监听
 */
export function watchOnce<T>(
  getValue: () => T,
  callback: WatchCallback<T>
): Dispose {
  let dispose: Dispose;
  
  dispose = watch(getValue, (newValue, oldValue) => {
    try {
      callback(newValue, oldValue);
    } finally {
      dispose();
    }
  });

  return dispose;
}

/**
 * 延迟监听（防抖）
 */
export function watchDebounced<T>(
  getValue: () => T,
  callback: WatchCallback<T>,
  delay = 100
): Dispose {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastValue: T;
  let isInitialized = false;
  
  const dispose = watch(getValue, (newValue, oldValue) => {
    if (!isInitialized) {
      lastValue = oldValue;
      isInitialized = true;
    }
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      try {
        callback(newValue, lastValue);
        lastValue = newValue;
      } catch (error) {
        console.error('Error in debounced watch callback:', error);
      }
      timeoutId = null;
    }, delay);
  });

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    dispose();
  };
} 