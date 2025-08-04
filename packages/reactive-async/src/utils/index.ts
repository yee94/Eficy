import { debounce, throttle, isEqual } from 'radashi';
import { nanoid } from 'nanoid';

/**
 * 防抖函数 - 使用 lodash 实现
 */
export { debounce };

/**
 * 节流函数 - 使用 lodash 实现
 */
export { throttle };

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
  return nanoid();
}

/**
 * 深度比较两个值是否相等 - 使用 lodash 实现
 */
export { isEqual };

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