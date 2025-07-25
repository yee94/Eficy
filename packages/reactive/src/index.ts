// ==================== 核心响应式功能 ====================
export { signal, computed, effect, effectScope, isSignal, peek, readonly } from './core/signal';
export { batch, isBatchingUpdates, clearPendingEffects, batchScope } from './core/batch';
export { action, isAction, getOriginalFunction, boundAction } from './core/action';
export { watch, watchMultiple, watchOnce, watchDebounced } from './core/watch';

// ==================== 统一的 Observable API ====================
export { observable } from './observables/observable';

// ==================== 真正的装饰器支持 ====================
export { 
  observable as observableDecorator, 
  computed as computedDecorator, 
  action as actionDecorator,
  makeObservable,
  ObservableClass
} from './decorators';

// ==================== 基于 Computed 的批处理优化 ====================
export { 
  batchedSignal, 
  batchedEffect, 
  batchedComputed,
  createStore, 
  derived, 
  createBatchScope 
} from './core/computed-batch';

// ==================== observe 系统 ====================
export {
  observe,
  observeProperty,
  observeArray,
  observeMap,
  observeSet,
  observeDeep,
  observeComputed,
  observeMultiple
} from './core/observe';

// ==================== 响应式集合 ====================
export { observableArray, isObservableArray, toObservableArray } from './observables/array';
export { observableObject, isObservableObject, toObservableObject } from './observables/object';
export { ref, readonly as readonlyRef, shallowRef, isRef, unref, toRef, toRefs, customRef } from './observables/ref';

// ==================== ES6 集合支持 ====================
export {
  observableMap,
  isObservableMap,
  observableSet,
  isObservableSet,
  observableWeakMap,
  isObservableWeakMap,
  observableWeakSet,
  isObservableWeakSet
} from './observables/collections';

// ==================== 注解式类定义 ====================
export { defineReactiveClass, observable as observableAnnotation, computed as computedAnnotation, actionAnnotation, autobind } from './annotations/class';

// ==================== 工具函数 ====================
export { 
  isFunction, 
  isObject, 
  isPrimitive, 
  isArray,
  isPlainObject,
  isMap,
  isSet,
  isWeakMap,
  isWeakSet,
  toRaw, 
  toRawDeep,
  toJS,
  markRaw,
  isRaw,
  markReactive,
  isReactive,
  hasCollected,
  withCollecting,
  startCollecting,
  stopCollecting,
  deepClone,
  shallowClone,
  shallowEqual,
  deepEqual,
  createDebugger,
  createTimer
} from './utils/helpers';

// ==================== 类型导出 ====================
export type * from './types/index';

// ==================== 默认导出（便捷访问）====================
import { signal, computed, effect } from './core/signal';
import { batch } from './core/batch';
import { action } from './core/action';
import { watch } from './core/watch';
import { observe } from './core/observe';
import { observable } from './observables/observable';
import { makeObservable, ObservableClass } from './decorators';
import { batchedSignal, batchedEffect, batchedComputed, createStore, derived } from './core/computed-batch';
import { observableArray } from './observables/array';
import { observableObject } from './observables/object';
import { observableMap, observableSet, observableWeakMap, observableWeakSet } from './observables/collections';
import { ref, isRef, unref } from './observables/ref';
import { defineReactiveClass } from './annotations/class';
import { isSignal } from './core/signal';
import { isAction } from './core/action';
import { toRaw, toJS, markRaw, hasCollected } from './utils/helpers';

export default {
  // 核心
  signal,
  computed,
  effect,
  batch,
  action,
  watch,
  observe,
  
  // 统一的 Observable API
  observable,
  
  // 装饰器支持
  makeObservable,
  ObservableClass,
  
  // 优化版本
  batchedSignal,
  batchedEffect,
  batchedComputed,
  createStore,
  derived,

  // 集合
  observableArray,
  observableObject,
  observableMap,
  observableSet,
  observableWeakMap,
  observableWeakSet,
  ref,
  defineReactiveClass,

  // 工具
  isSignal,
  isRef,
  isAction,
  unref,
  toRaw,
  toJS,
  markRaw,
  hasCollected
}; 