import type { Dispose } from '../types/index';

// ==================== 批处理实现 ====================

let batchingDepth = 0;

/**
 * 批处理执行函数
 */
export function batch<T>(fn: () => T): T {
  const prevDepth = batchingDepth;
  batchingDepth++;
  
  try {
    const result = fn();
    return result;
  } finally {
    batchingDepth = prevDepth;
    
    // 当退出最外层批处理时，确保微任务队列被处理
    if (batchingDepth === 0) {
      // 使用 queueMicrotask 确保所有待处理的 effects 在下一个事件循环中执行
      queueMicrotask(() => {
        // 这里不需要做任何事情，微任务的目的是让所有同步的批处理完成
      });
    }
  }
}

/**
 * 检查当前是否在批处理中
 */
export function isBatchingUpdates(): boolean {
  return batchingDepth > 0;
}

/**
 * 清空待处理的效果队列（用于测试）
 */
export function clearPendingEffects(): void {
  // 在这个简化版本中不需要清理
}

// ==================== 作用域批处理 ====================

export const batchScope = {
  /**
   * 创建批处理作用域
   */
  run<T>(fn: () => T): T {
    return batch(fn);
  },

  /**
   * 创建绑定的批处理函数
   */
  bound<Args extends unknown[], Return>(fn: (...args: Args) => Return) {
    return (...args: Args) => batch(() => fn(...args));
  }
}; 