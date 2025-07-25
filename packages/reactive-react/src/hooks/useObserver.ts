import { useRef, useLayoutEffect } from 'react'
import { effect } from '@eficy/reactive'
import type { IObserverOptions } from '../types'
import { useForceUpdate } from './useForceUpdate'

export const useObserver = <T extends () => unknown>(
  view: T,
  options?: IObserverOptions
): ReturnType<T> => {
  const forceUpdate = useForceUpdate()
  const effectDisposeRef = useRef<(() => void) | null>(null)
  const hasSetupEffectRef = useRef(false)
  
  // 每次渲染都执行视图函数获取最新值
  const result = view()
  
  // 只在首次渲染时设置 effect 来追踪依赖
  if (!hasSetupEffectRef.current) {
    hasSetupEffectRef.current = true
    
    // 用一个标记来跳过首次 effect 执行
    let isFirstEffectRun = true
    
    effectDisposeRef.current = effect(() => {
      // 执行视图函数来收集依赖
      view()
      
      // 跳过首次执行，只在依赖变化时触发更新
      if (isFirstEffectRun) {
        isFirstEffectRun = false
        return
      }
      
      // 触发组件重新渲染
      if (typeof options?.scheduler === 'function') {
        options.scheduler(forceUpdate)
      } else {
        forceUpdate()
      }
    })
  }
  
  // 清理 effect 在组件卸载时
  useLayoutEffect(() => {
    return () => {
      if (effectDisposeRef.current) {
        effectDisposeRef.current()
        effectDisposeRef.current = null
      }
    }
  }, [])
  
  return result as ReturnType<T>
}
