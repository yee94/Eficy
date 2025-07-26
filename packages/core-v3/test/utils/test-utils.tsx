import React from 'react';
import { render, RenderResult, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/**
 * 创建独立的测试环境
 * 解决并行测试中 screen 对象共享的问题
 */
export class TestEnvironment {
  private container: HTMLElement;
  private renderResult: RenderResult | null = null;

  constructor() {
    // 为每个测试创建独立的容器
    this.container = document.createElement('div');
    this.container.id = `test-container-${Date.now()}-${Math.random()}`;
    document.body.appendChild(this.container);
  }

  /**
   * 渲染组件到独立的容器中
   */
  render(element: React.ReactElement): RenderResult {
    // 清理之前的渲染结果
    if (this.renderResult) {
      this.renderResult.unmount();
    }

    // 渲染到独立容器
    this.renderResult = render(element, { container: this.container });
    return this.renderResult;
  }

  /**
   * 清理测试环境
   */
  cleanup() {
    if (this.renderResult) {
      this.renderResult.unmount();
      this.renderResult = null;
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container;
  }
}

/**
 * 创建测试环境的工厂函数
 */
export function createTestEnvironment(): TestEnvironment {
  return new TestEnvironment();
}

/**
 * 测试套件装饰器，自动处理清理
 */
export function withCleanup<T extends any[], R>(
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    try {
      return fn(...args);
    } finally {
      cleanup();
    }
  };
}

/**
 * 异步测试套件装饰器
 */
export function withAsyncCleanup<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } finally {
      cleanup();
    }
  };
}

// 自动清理钩子
afterEach(() => {
  cleanup();
}); 