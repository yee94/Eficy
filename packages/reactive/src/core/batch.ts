import { batch as preactBatch } from '@preact/signals-core';

// ==================== 批处理实现 ====================

// 跟踪批处理状态
let batchingDepth = 0;

/**
 * 批处理状态更新 - 使用 preact/signals-core 的原生批处理
 */
export function batch<T>(fn: () => T): T {
  batchingDepth++;
  try {
    return preactBatch(fn);
  } finally {
    batchingDepth--;
  }
}

/**
 * 检查是否正在批处理中
 */
export function isBatchingUpdates(): boolean {
  return batchingDepth > 0;
}

/**
 * 兼容性函数：清空待处理的效果
 * 注意：preact/signals-core 自动管理，这里保留接口兼容性
 */
export function clearPendingEffects(): void {
  // preact/signals-core 自动管理，无需手动清空
}

/**
 * 批处理作用域（兼容性接口）
 */
export function batchScope<T>(fn: () => T): T {
  return batch(fn);
} 