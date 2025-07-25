import { useRef } from 'react'
import { signal } from '@eficy/reactive'

/**
 * 便捷 hook：使用响应式状态
 * 基于新的简化范式，返回 [state, setState] 模式
 * 
 * 使用示例：
 * const [user, setUser] = useReactive({ name: '', age: 0 })
 * 
 * // 更新状态（新范式：重新赋值整个对象）
 * setUser({ name: 'John', age: 25 })
 * setUser(prev => ({ ...prev, name: 'John' }))
 */
export function useReactive<T extends Record<string, unknown>>(
  initialState: T
): [T, (updater: T | ((prev: T) => T)) => void] {
  const stateSignal = useRef(signal(initialState))
  
  const setState = (updater: T | ((prev: T) => T)) => {
    const currentState = stateSignal.current()
    const newState = typeof updater === 'function' ? updater(currentState) : updater
    stateSignal.current(newState)
  }
  
  return [stateSignal.current(), setState]
} 