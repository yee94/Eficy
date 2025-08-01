// 主要的 observer 功能
export { observer } from './observer'

// 所有 hooks
export { 
  useObserver, 
  useForceUpdate,
  useReactive
} from './hooks'

// 类型定义
export type * from './types'

// ==================== 装饰器支持（优先级最高）====================
export {
  Observable,
  Computed,
  Action,
  makeObservable,
  ObservableClass,
} from '@eficy/reactive'

// ==================== 核心 Signals 功能 ====================
export {
  signal,
  effect,
  batch,
  watch,
  isSignal,
  computed,
  createAction
} from '@eficy/reactive'

// ==================== 简化的 Observable API ====================
// 注意：函数式 observable API 已简化，直接使用 signal

// ==================== 其他工具 ====================
export {
  ref,
  isRef,
  unref
} from '@eficy/reactive'
