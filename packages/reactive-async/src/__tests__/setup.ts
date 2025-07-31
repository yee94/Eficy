import 'reflect-metadata';
import { vi } from 'vitest';

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

// Mock fetch for testing
global.fetch = vi.fn();

// Mock window focus events
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true,
}); 