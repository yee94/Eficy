/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        func(...args);
      }, wait - (now - lastTime));
    }
  };
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * 深度比较两个值是否相等
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => isEqual(a[key], b[key]));
}

/**
 * 创建取消令牌
 */
export interface CancelToken {
  isCancelled: boolean;
  cancel: () => void;
  promise: Promise<never>;
}

export function createCancelToken(): CancelToken {
  let isCancelled = false;
  let cancelResolve: (reason?: any) => void;
  
  const promise = new Promise<never>((_, reject) => {
    cancelResolve = reject;
  });
  
  return {
    isCancelled,
    cancel: () => {
      if (!isCancelled) {
        isCancelled = true;
        cancelResolve(new Error('Request cancelled'));
      }
    },
    promise
  };
}

/**
 * 包装 Promise 使其可取消
 */
export function makeCancellable<T>(
  promise: Promise<T>,
  cancelToken: CancelToken
): Promise<T> {
  return Promise.race([
    promise,
    cancelToken.promise
  ]);
}