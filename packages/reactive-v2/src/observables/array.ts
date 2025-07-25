import { signal } from '../core/signal';
import type { ObservableArray, Signal } from '../types/index';

// ==================== 响应式数组实现 ====================

/**
 * 创建响应式数组
 */
export function observableArray<T>(initialArray: T[] = []): ObservableArray<T> {
  const arraySignal: Signal<T[]> = signal([...initialArray]);
  
  const observableArr: ObservableArray<T> = {
    // 获取当前数组
    get value() {
      return arraySignal();
    },
    
    // 设置整个数组
    set value(newArray: T[]) {
      arraySignal([...newArray]);
    },
    
    // 获取长度
    get length() {
      return arraySignal().length;
    },
    
    // 获取元素
    get(index: number): T {
      return arraySignal()[index];
    },
    
    // 设置元素
    set(index: number, value: T) {
      const arr = [...arraySignal()];
      arr[index] = value;
      arraySignal(arr);
    },
    
    // ==================== 变更方法 ====================
    
    push(...items: T[]) {
      const arr = [...arraySignal()];
      const result = arr.push(...items);
      arraySignal(arr);
      return result;
    },
    
    pop() {
      const arr = [...arraySignal()];
      const result = arr.pop();
      arraySignal(arr);
      return result;
    },
    
    shift() {
      const arr = [...arraySignal()];
      const result = arr.shift();
      arraySignal(arr);
      return result;
    },
    
    unshift(...items: T[]) {
      const arr = [...arraySignal()];
      const result = arr.unshift(...items);
      arraySignal(arr);
      return result;
    },
    
    splice(start: number, deleteCount?: number, ...items: T[]) {
      const arr = [...arraySignal()];
      const result = arr.splice(start, deleteCount, ...items);
      arraySignal(arr);
      return result;
    },
    
    // ==================== 只读方法 ====================
    
    map<U>(callback: (value: T, index: number, array: T[]) => U): U[] {
      return arraySignal().map(callback);
    },
    
    filter(callback: (value: T, index: number, array: T[]) => boolean): T[] {
      return arraySignal().filter(callback);
    },
    
    find(callback: (value: T, index: number, array: T[]) => boolean): T | undefined {
      return arraySignal().find(callback);
    },
    
    indexOf(searchElement: T, fromIndex?: number): number {
      return arraySignal().indexOf(searchElement, fromIndex);
    },
    
    includes(searchElement: T, fromIndex?: number): boolean {
      return arraySignal().includes(searchElement, fromIndex);
    },
    
    forEach(callback: (value: T, index: number, array: T[]) => void) {
      arraySignal().forEach(callback);
    },
    
    // 转为普通数组
    toArray(): T[] {
      return [...arraySignal()];
    }
  };
  
  return observableArr;
}

// ==================== 数组工具函数 ====================

/**
 * 检查是否为响应式数组
 */
export function isObservableArray<T>(value: any): value is ObservableArray<T> {
  return value && 
    typeof value === 'object' && 
    'value' in value && 
    'push' in value && 
    'toArray' in value &&
    typeof value.push === 'function';
}

/**
 * 将普通数组转换为响应式数组
 */
export function toObservableArray<T>(array: T[]): ObservableArray<T> {
  return observableArray(array);
}

/**
 * 将响应式数组转换为普通数组
 */
export function toPlainArray<T>(observableArr: ObservableArray<T>): T[] {
  return observableArr.toArray();
} 