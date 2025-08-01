// ==================== 装饰器支持 (优先级最高) ====================
export {
  observable as Observable,
  computed as Computed,
  action as Action,
  makeObservable,
  ObservableClass,
} from './decorators';

// ==================== 核心响应式功能 ====================
export { signal, computed, effect, effectScope, isSignal, peek, readonly } from './core/signal';
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
  observeMultiple,
} from './core/observe';

// ==================== 响应式集合 ====================
export { ref, readonly as readonlyRef, shallowRef, isRef, unref, toRef, toRefs, customRef } from './observables/ref';

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
  createTimer,
} from './utils/helpers';

// ==================== 类型导出 ====================
export type * from './types/index';
