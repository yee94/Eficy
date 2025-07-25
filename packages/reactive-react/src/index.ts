export * from './observer'
export * from './hooks'
export * from './types'

// 重新导出核心 signals（从 @eficy/reactive）
export {
  signal,
  computed,
  effect,
  action,
  batch,
  watch,
  observable,
  observableObject,
  observableArray,
  ref
} from '@eficy/reactive'

// 重新导出装饰器支持
export {
  observableDecorator,
  computedDecorator,
  actionDecorator,
  makeObservable,
  ObservableClass
} from '@eficy/reactive'
