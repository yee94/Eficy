// 我们自己的 hooks
export { useObserver } from './useObserver'
export { useForceUpdate } from './useForceUpdate'

// 重新导出 @eficy/reactive 的核心功能
export {
  signal,
  computed,
  effect,
  action,
  batch,
  watch,
  observableObject,
  observableArray,
  ref
} from '@eficy/reactive'

// 便捷 hook：使用响应式状态
import { observableObject } from '@eficy/reactive'

export function useReactive<T extends Record<string, unknown>>(initialState: T): T {
  // 使用 @eficy/reactive 的 observableObject
  return observableObject(initialState) as unknown as T
}
