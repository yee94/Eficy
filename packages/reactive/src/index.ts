// ==================== 装饰器支持 (优先级最高) ====================
export { 
  observable, 
  computed, 
  action,
  makeObservable,
  ObservableClass
} from './decorators';

// ==================== 核心响应式功能 ====================
export { signal, effect, effectScope, isSignal, peek, readonly } from './core/signal';
export { computed as createComputed } from './core/signal'; // 避免与装饰器冲突，使用别名
export { computed as signalComputed } from './core/signal'; // 避免与装饰器冲突，使用别名
export { batch, isBatchingUpdates, clearPendingEffects, batchScope } from './core/batch';
export { action as createAction, isAction, getOriginalFunction, boundAction } from './core/action'; // 避免与装饰器冲突，使用别名
export { watch, watchMultiple, watchOnce, watchDebounced } from './core/watch';


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
export { ref, readonly as readonlyRef, shallowRef, isRef, unref, toRef, toRefs, customRef } from './observables/ref';



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
import { signal, computed as createComputed, effect } from './core/signal';
import { batch } from './core/batch';
import { action as createAction } from './core/action';
import { watch } from './core/watch';
import { observe } from './core/observe';
import { observable, computed, action, makeObservable, ObservableClass } from './decorators';
// 移除已删除的批处理优化功能
import { ref, isRef, unref } from './observables/ref';
import { defineReactiveClass } from './annotations/class';
import { isSignal } from './core/signal';
import { isAction } from './core/action';
import { toRaw, toJS, markRaw, hasCollected } from './utils/helpers';

export default {
  // 核心 signals
  signal,
  createComputed,
  effect,
  batch,
  createAction,
  watch,
  observe,
  
  // 装饰器 (优先级最高)
  observable,
  computed,
  action,
  makeObservable,
  ObservableClass,
  

  // 集合 (简化版)
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