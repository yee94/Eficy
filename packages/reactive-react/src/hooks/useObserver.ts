import { useSignals } from "@preact/signals-react/runtime"

// 重载定义：支持两种使用方式
export function useObserver(): void
export function useObserver<T extends () => unknown>(view: T): ReturnType<T>

export function useObserver<T extends () => unknown>(view?: T): any {
  // 使用 @preact/signals-react 的 useSignals 来自动追踪响应式依赖
  useSignals()
  
  // 方式一：useSignals() 风格 - 直接调用 useObserver()
  if (!view) {
    return
  }
  
  // 方式二：传统的 useObserver(view) 方式
  // 由于 useSignals() 已经设置了响应式追踪，直接执行 view 函数即可
  return view()
}

// 直接导出 @preact/signals-react 的 useSignals
export { useSignals }
