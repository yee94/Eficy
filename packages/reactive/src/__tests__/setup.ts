import 'reflect-metadata';

// Mock browser APIs
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.requestIdleCallback = (cb: IdleRequestCallback) => {
  return setTimeout(cb, 0);
};

global.cancelIdleCallback = (id: number) => {
  clearTimeout(id);
}; 