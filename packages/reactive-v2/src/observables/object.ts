import { signal, computed } from '../core/signal';
import type { ObservableObject, Signal, ComputedSignal } from '../types/index';

// ==================== 响应式对象实现 ====================

/**
 * 创建响应式对象 - 基于 signal 而不是 Proxy
 */
export function observableObject<T extends Record<string, unknown>>(initialObj: T): ObservableObject<T> {
  const objSignal: Signal<T> = signal({ ...initialObj });
  
  const observableObj: ObservableObject<T> = {
    // 获取当前对象
    get value() {
      return objSignal();
    },
    
    // 设置整个对象
    set value(newObj: T) {
      objSignal({ ...newObj });
    },
    
    // 获取属性
    get<K extends keyof T>(key: K): T[K] {
      const value = objSignal()[key];
      // 如果是 computed 信号，调用它来获取值
      if (typeof value === 'function' && isComputedSignal(value)) {
        return (value as ComputedSignal<T[K]>)() as T[K];
      }
      return value;
    },
    
    // 设置属性
    set<K extends keyof T>(key: K, value: T[K]) {
      const obj = { ...objSignal() };
      obj[key] = value;
      objSignal(obj);
    },
    
    // 更新多个属性
    update(updates: Partial<T>) {
      const obj = { ...objSignal(), ...updates };
      objSignal(obj);
    },
    
    // 删除属性
    delete<K extends keyof T>(key: K) {
      const obj = { ...objSignal() };
      delete obj[key];
      objSignal(obj);
    },
    
    // 获取所有键
    keys(): (keyof T)[] {
      return Object.keys(objSignal()) as (keyof T)[];
    },
    
    // 转为普通对象
    toObject(): T {
      const obj = objSignal();
      const result = {} as T;
      
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          // 如果是 computed 信号，调用它来获取值
          if (typeof value === 'function' && isComputedSignal(value)) {
            result[key] = (value as ComputedSignal<T[typeof key]>)() as T[typeof key];
          } else {
            result[key] = value;
          }
        }
      }
      
      return result;
    }
  };
  
  return observableObj;
}

// ==================== 工具函数 ====================

/**
 * 检查是否为计算信号
 */
function isComputedSignal(value: unknown): value is ComputedSignal<unknown> {
  return typeof value === 'function';
}

// ==================== 对象工具函数 ====================

/**
 * 检查是否为响应式对象
 */
export function isObservableObject<T>(value: unknown): value is ObservableObject<T> {
  return value !== null && 
    typeof value === 'object' && 
    'value' in value && 
    'get' in value && 
    'set' in value &&
    'toObject' in value &&
    typeof (value as Record<string, unknown>).get === 'function';
}

/**
 * 将普通对象转换为响应式对象
 */
export function toObservableObject<T extends Record<string, unknown>>(obj: T): ObservableObject<T> {
  return observableObject(obj);
}

/**
 * 将响应式对象转换为普通对象
 */
export function toPlainObject<T>(observableObj: ObservableObject<T>): T {
  return observableObj.toObject();
}

/**
 * 深度合并对象
 */
export function mergeObservableObject<T extends Record<string, unknown>>(
  target: ObservableObject<T>,
  source: Partial<T>
): void {
  const currentValue = target.value;
  const merged = deepMerge(currentValue, source);
  target.value = merged as T;
}

/**
 * 深度合并工具函数
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = (result as any)[key];
      
      if (
        sourceValue && 
        typeof sourceValue === 'object' && 
        !Array.isArray(sourceValue) &&
        targetValue && 
        typeof targetValue === 'object' && 
        !Array.isArray(targetValue)
      ) {
        (result as any)[key] = deepMerge(targetValue, sourceValue);
      } else {
        (result as any)[key] = sourceValue;
      }
    }
  }
  
  return result;
} 