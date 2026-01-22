import {
  batch,
  computed as preactComputed,
  effect as preactEffect,
  signal as preactSignal,
  untracked,
} from '@preact/signals-core';
import type { ComputedSignal, Dispose, Signal } from '../types/index';
import { SIGNAL_BRAND, SIGNAL_MARKER } from '../types/index';

// ==================== Signal 实现 ====================

/**
 * 创建响应式信号
 */
export function signal<T>(initialValue: T): Signal<T> {
  const preactSig = preactSignal(initialValue);

  const signalObject = {
    get value() {
      return preactSig.value;
    },
    set value(newValue: T) {
      preactSig.value = newValue;
    },
    [SIGNAL_MARKER]: true as const,
    [SIGNAL_BRAND]: true as const,
  };

  return signalObject as Signal<T>;
}

/**
 * 创建计算信号
 */
export function computed<T>(getter: (prev?: T) => T): ComputedSignal<T> {
  let prevValue: T | undefined;
  const preactComp = preactComputed(() => {
    const newValue = getter(prevValue);
    prevValue = newValue;
    return newValue;
  });

  const computedObject = {
    get value() {
      return preactComp.value;
    },
    [SIGNAL_MARKER]: true as const,
    [SIGNAL_BRAND]: true as const,
  };

  return computedObject as ComputedSignal<T>;
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
  return typeof value === 'object' && value !== null && (value as any)[SIGNAL_MARKER] === true;
}

/**
 * 只读访问信号值（不建立依赖关系）
 */
export function peek<T>(signal: Signal<T>): T {
  return untracked(() => signal.value);
}

/**
 * 创建只读信号
 */
export function readonly<T>(signal: Signal<T>): ComputedSignal<T> {
  return computed(() => signal.value);
}
