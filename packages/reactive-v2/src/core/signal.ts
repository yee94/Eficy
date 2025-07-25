import { signal as alienSignal, computed as alienComputed, effect as alienEffect, effectScope } from 'alien-signals';
import type { Signal, ComputedSignal, Dispose } from '../types/index';

// ==================== 基础 Signal 创建 ====================

/**
 * 创建响应式信号
 */
export function signal<T>(initialValue: T): Signal<T> {
  return alienSignal(initialValue);
}

/**
 * 创建计算信号
 */
export function computed<T>(getter: () => T): ComputedSignal<T> {
  return alienComputed(getter);
}

/**
 * 创建支持批处理的副作用
 */
export function effect(fn: () => void): Dispose {
  let isScheduled = false;
  let isBatching = false;
  
  const wrappedFn = () => {
    // 检查是否在批处理中
    try {
      const batchModule = require('./batch');
      isBatching = batchModule.isBatchingUpdates();
    } catch (error) {
      isBatching = false;
    }
    
    if (isBatching && !isScheduled) {
      // 在批处理中，延迟执行
      isScheduled = true;
      queueMicrotask(() => {
        isScheduled = false;
        // 再次检查批处理状态
        try {
          const batchModule = require('./batch');
          if (!batchModule.isBatchingUpdates()) {
            fn();
          }
        } catch (error) {
          fn();
        }
      });
    } else if (!isBatching) {
      // 不在批处理中，立即执行
      fn();
    }
  };
  
  return alienEffect(wrappedFn);
}

// ==================== 批处理相关 ====================

/**
 * 导出 effectScope 用于批处理
 */
export { effectScope };

// ==================== 工具函数 ====================

/**
 * 检查是否为信号
 */
export function isSignal<T>(value: unknown): value is Signal<T> {
  return typeof value === 'function' && '_signal' in value;
}

/**
 * 获取信号的当前值（不收集依赖）
 */
export function peek<T>(signal: Signal<T>): T {
  // alien-signals 的 peek 实现
  return (signal as unknown as { peek?: () => T }).peek?.() ?? signal();
}

/**
 * 创建只读计算信号
 */
export function readonly<T>(getter: () => T): ComputedSignal<T> {
  return computed(getter);
} 