import '@testing-library/jest-dom'

// 全局测试设置
global.ResizeObserver = global.ResizeObserver || class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟 requestIdleCallback
if (!global.requestIdleCallback) {
  global.requestIdleCallback = (callback: IdleRequestCallback) => {
    return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1)
  }
}

if (!global.cancelIdleCallback) {
  global.cancelIdleCallback = (id: number) => {
    clearTimeout(id)
  }
} 