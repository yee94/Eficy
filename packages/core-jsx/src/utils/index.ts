/**
 * 工具函数
 */

import { isSignal } from '@eficy/reactive';

/**
 * 检查对象中是否包含 signals
 */
export function hasSignals(obj: any): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  // 检查对象的所有值
  return Object.values(obj).some(value => {
    if (isSignal(value)) {
      return true;
    }
    
    // 递归检查嵌套对象
    if (value && typeof value === 'object' && value.constructor === Object) {
      return hasSignals(value);
    }
    
    // 检查数组
    if (Array.isArray(value)) {
      return value.some(item => isSignal(item) || hasSignals(item));
    }
    
    return false;
  });
}

/**
 * 深度解析对象中的 signals
 */
export function resolveSignals<T>(obj: T): T {
  if (!obj) {
    return obj;
  }
  
  if (isSignal(obj)) {
    return (obj as any)();
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => resolveSignals(item)) as T;
  }
  
  if (obj.constructor === Object) {
    const resolved: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveSignals(value);
    }
    
    return resolved;
  }
  
  return obj;
}

/**
 * 生成唯一 ID
 */
let counter = 0;
export function generateId(prefix = 'eficy'): string {
  return `${prefix}_${++counter}_${Date.now().toString(36)}`;
}

/**
 * 安全地调用函数
 */
export function safeCall<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.error('[Eficy V3] Safe call error:', error);
    return fallback;
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * 检查是否为对象
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}