import {
  signal as preactSignal,
  computed as preactComputed,
  effect as preactEffect,
  batch,
  untracked,
} from '@preact/signals-core';
import type { Signal, ComputedSignal, Dispose } from '../types/index';
import { SIGNAL_MARKER } from '../types/index';

// ==================== Signal 实现 ====================

/**
 * 创建响应式信号
 */
export function signal<T>(initialValue: T): Signal<T> {
  const preactSig = preactSignal(initialValue);

  // 适配 alien-signals 风格的 API（函数调用风格）
  function signalAccessor(): T;
  function signalAccessor(newValue: T): T;
  function signalAccessor(newValue: (prev: T) => T): T;
  function signalAccessor(...args: [] | [T] | [(prev: T) => T]): T {
    if (args.length === 0) {
      return preactSig.value;
    }
    const [newValue] = args;
    if (typeof newValue === 'function') {
      preactSig.value = (newValue as (prev: T) => T)(preactSig.value);
    } else {
      preactSig.value = newValue;
    }
    return preactSig.value;
  }

  // 添加信号标记
  (signalAccessor as any)[SIGNAL_MARKER] = true;

  return signalAccessor as Signal<T>;
}

/**
 * 创建计算信号
 */
export function computed<T>(getter: () => T): ComputedSignal<T> {
  const preactComp = preactComputed(getter);

  // 适配 alien-signals 风格的 API
  function computedAccessor(): T {
    return preactComp.value;
  }

  // 添加信号标记
  (computedAccessor as any)[SIGNAL_MARKER] = true;

  return computedAccessor as ComputedSignal<T>;
}

/**
 * 创建副作用
 */
export function effect(fn: () => void): Dispose {
  // 暂时使用类型断言，等待安装新依赖后修复
  return preactEffect(fn as any);
}

/**
 * 导出原生批处理函数
 */
export { batch };

/**
 * 导出 untracked 函数
 */
export { untracked };

// ==================== 工具函数 ====================

/**
 * 检查是否为信号
 */
export function isSignal(value: unknown): value is Signal<unknown> {
  return typeof value === 'function' && (value as any)[SIGNAL_MARKER] === true;
}

/**
 * 只读访问信号值（不建立依赖关系）
 */
export function peek<T>(signal: Signal<T>): T {
  return untracked(() => signal());
}

/**
 * 创建只读信号
 */
export function readonly<T>(signal: Signal<T>): ComputedSignal<T> {
  return computed(() => signal());
}

/**
 * 效果作用域（为了兼容性保留）
 */
export function effectScope(fn: () => void): () => void {
  const dispose = effect(fn);
  return dispose;
}
