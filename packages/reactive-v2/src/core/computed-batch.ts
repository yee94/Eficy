import { signal, computed, effect } from './signal';
import type { Signal, ComputedSignal, Dispose } from '../types/index';

// ==================== 智能批处理系统 ====================

/**
 * 创建智能批处理的 computed
 * 利用 computed 的延迟计算特性来优化性能
 */
export function batchedComputed<T>(getter: () => T): ComputedSignal<T> {
  // 使用一个 revision 信号来强制重新计算
  const revision = signal(0);
  
  let cachedValue: T;
  let isComputing = false;
  let needsUpdate = true;
  
  return computed(() => {
    // 订阅 revision 来触发更新
    revision();
    
    if (needsUpdate && !isComputing) {
      isComputing = true;
      try {
        cachedValue = getter();
        needsUpdate = false;
      } finally {
        isComputing = false;
      }
    }
    
    return cachedValue;
  });
}

/**
 * 创建批处理作用域
 * 在作用域内的所有更新会被延迟到下一个微任务
 */
export function createBatchScope() {
  const pendingUpdates = new Set<() => void>();
  const pendingEffects = new Set<() => void>();
  let isFlushPending = false;
  
  const scheduleFlush = () => {
    if (!isFlushPending) {
      isFlushPending = true;
      queueMicrotask(() => {
        flush();
        isFlushPending = false;
      });
    }
  };
  
  const flush = () => {
    // 先执行所有状态更新
    for (const update of pendingUpdates) {
      update();
    }
    pendingUpdates.clear();
    
    // 再执行所有 effect
    for (const effect of pendingEffects) {
      effect();
    }
    pendingEffects.clear();
  };
  
  const queueUpdate = (update: () => void) => {
    pendingUpdates.add(update);
    scheduleFlush();
  };
  
  const queueEffect = (effect: () => void) => {
    pendingEffects.add(effect);
    scheduleFlush();
  };
  
  return {
    queueUpdate,
    queueEffect,
    flush,
    pending: () => pendingUpdates.size + pendingEffects.size > 0
  };
}

// 全局批处理作用域
const globalBatchScope = createBatchScope();

/**
 * 创建批处理的 signal
 * 更新会被自动延迟到下一个微任务
 */
export function batchedSignal<T>(initialValue: T): Signal<T> {
  const _signal = signal(initialValue);
  
  return function batchedSignalAccessor(...args: [T] | []): T {
    if (args.length === 0) {
      // getter
      return _signal();
    }
    // setter - 延迟执行
    const [newValue] = args;
    globalBatchScope.queueUpdate(() => {
      _signal(newValue);
    });
    return newValue;
  } as Signal<T>;
}

/**
 * 创建批处理的 effect
 * effect 的执行会被延迟到所有状态更新完成后
 */
export function batchedEffect(fn: () => void): Dispose {
  let isActive = true;
  
  // 立即执行一次初始效果
  fn();
  
  const wrappedFn = () => {
    if (isActive) {
      globalBatchScope.queueEffect(fn);
    }
  };
  
  const dispose = effect(wrappedFn);
  
  return () => {
    isActive = false;
    dispose();
  };
}

// ==================== 优化的响应式模式 ====================

/**
 * 创建响应式存储
 * 自动应用批处理优化
 */
export function createStore<T extends Record<string, unknown>>(
  initialState: T
): {
  state: ComputedSignal<T>;
  setState: (updates: Partial<T>) => void;
  getState: () => T;
  subscribe: (listener: (state: T) => void) => Dispose;
} {
  const _state = signal(initialState);
  const updateQueue = signal<Partial<T>[]>([]);
  
  // 使用 computed 来批处理状态更新
  const state = computed(() => {
    const current = _state();
    const updates = updateQueue();
    
    if (updates.length === 0) {
      return current;
    }
    
    // 应用所有待处理的更新
    const newState = Object.assign({}, current);
    for (const update of updates) {
      Object.assign(newState, update);
    }
    
    // 清空更新队列
    queueMicrotask(() => {
      updateQueue([]);
      _state(newState as T);
    });
    
    return newState as T;
  });
  
  const setState = (updates: Partial<T>) => {
    updateQueue([...updateQueue(), updates]);
  };
  
  const getState = () => state();
  
  const subscribe = (listener: (state: T) => void) => {
    return effect(() => {
      listener(state());
    });
  };
  
  return {
    state,
    setState,
    getState,
    subscribe
  };
}

/**
 * 创建派生状态
 * 自动优化计算和依赖收集
 */
export function derived<T, R>(
  source: ComputedSignal<T> | Signal<T>,
  transformer: (value: T) => R
): ComputedSignal<R> {
  const memoCache = new Map<T, R>();
  
  return computed(() => {
    const value = source();
    
    // 简单的记忆化缓存
    if (memoCache.has(value)) {
      const cached = memoCache.get(value);
      if (cached !== undefined) {
        return cached;
      }
    }
    
    const result = transformer(value);
    memoCache.set(value, result);
    
    // 限制缓存大小
    if (memoCache.size > 100) {
      const firstKey = memoCache.keys().next().value;
      memoCache.delete(firstKey);
    }
    
    return result;
  });
} 