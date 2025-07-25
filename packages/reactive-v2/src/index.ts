// ==================== 核心响应式功能 ====================
export { signal, computed, effect, effectScope, isSignal, peek, readonly } from './core/signal';
export { batch, isBatchingUpdates, clearPendingEffects, batchScope } from './core/batch';
export { action, isAction, getOriginalFunction, actionDecorator, boundAction } from './core/action';
export { watch, watchMultiple, watchOnce, watchDebounced } from './core/watch';

// ==================== 基于 Computed 的批处理优化 ====================
export { 
  batchedSignal, 
  batchedEffect, 
  batchedComputed,
  createStore, 
  derived, 
  createBatchScope 
} from './core/computed-batch';

// ==================== 响应式集合 ====================
export { observableArray, isObservableArray, toObservableArray } from './observables/array';
export { observableObject, isObservableObject, toObservableObject } from './observables/object';
export { ref, readonly as readonlyRef, shallowRef, isRef, unref, toRef, toRefs, customRef } from './observables/ref';

// ==================== 注解式类定义 ====================
export { defineReactiveClass, observable as observableAnnotation, computed as computedAnnotation, actionAnnotation, autobind } from './annotations/class';

// ==================== 工具函数 ====================
export { isFunction, isObject, isPrimitive, toRaw, toRawDeep } from './utils/helpers';

// ==================== 类型导出 ====================
export type * from './types/index';

// ==================== 默认导出（便捷访问）====================
import { signal, computed, effect } from './core/signal';
import { batch } from './core/batch';
import { action } from './core/action';
import { watch } from './core/watch';
import { batchedSignal, batchedEffect, batchedComputed, createStore, derived } from './core/computed-batch';
import { observableArray } from './observables/array';
import { observableObject } from './observables/object';
import { ref, isRef, unref } from './observables/ref';
import { defineReactiveClass } from './annotations/class';
import { isSignal } from './core/signal';
import { isAction } from './core/action';
import { toRaw } from './utils/helpers';

export default {
  // 核心
  signal,
  computed,
  effect,
  batch,
  action,
  watch,
  
  // 优化版本
  batchedSignal,
  batchedEffect,
  batchedComputed,
  createStore,
  derived,
  
  // 集合
  observableArray,
  observableObject,
  ref,
  
  // 注解
  defineReactiveClass,
  
  // 工具
  isSignal,
  isRef,
  isAction,
  unref,
  toRaw
}; 