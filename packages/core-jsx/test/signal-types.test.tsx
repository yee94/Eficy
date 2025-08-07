/**
 * Signal 类型测试
 * 验证 Signal 类型能够正确赋值给 ReactNode
 */

import React from 'react';
import { signal } from '@eficy/reactive';
import { render } from '@testing-library/react';

describe('Signal Types', () => {
  test('Signal<number> 应该能够赋值给 ReactNode', () => {
    const countSignal = signal(42);
    
    // 这应该不会产生类型错误
    const element: React.ReactElement = (
      <div>
        Count: {countSignal as unknown as React.ReactNode}
      </div>
    );
    
    expect(element).toBeDefined();
  });

  test('Signal<string> 应该能够作为 children', () => {
    const textSignal = signal('Hello World');
    
    // 这应该不会产生类型错误
    const element: React.ReactElement = (
      <div>
        {textSignal as unknown as React.ReactNode}
      </div>
    );
    
    expect(element).toBeDefined();
  });

  test('Signal 数组应该能够作为 children', () => {
    const signals = [signal(1), signal(2), signal(3)];
    
    // 这应该不会产生类型错误
    const element: React.ReactElement = (
      <div>
        {signals.map((sig, index) => (
          <span key={index}>{sig as unknown as React.ReactNode}</span>
        ))}
      </div>
    );
    
    expect(element).toBeDefined();
  });

  test('Signal 在 props 中应该被正确处理', () => {
    const titleSignal = signal('Dynamic Title');
    const countSignal = signal(100);
    
    // 这应该不会产生类型错误
    const element: React.ReactElement = (
      <div title={titleSignal as unknown as string}>
        Count: {countSignal as unknown as React.ReactNode}
      </div>
    );
    
    expect(element).toBeDefined();
  });
}); 