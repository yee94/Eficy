import { describe, it, expect } from 'vitest';
import once from './once';

describe('@once() 装饰器', () => {
  it('应该确保方法只执行一次', () => {
    let executionCount = 0;
    
    class TestClass {
      @once()
      expensiveOperation() {
        executionCount++;
        return `result-${executionCount}`;
      }
    }

    const instance = new TestClass();
    
    // 第一次调用
    const result1 = instance.expensiveOperation();
    expect(result1).toBe('result-1');
    expect(executionCount).toBe(1);
    
    // 第二次调用应该返回相同结果，但不增加执行次数
    const result2 = instance.expensiveOperation();
    expect(result2).toBe('result-1');
    expect(executionCount).toBe(1);
    
    // 第三次调用
    const result3 = instance.expensiveOperation();
    expect(result3).toBe('result-1');
    expect(executionCount).toBe(1);
  });

  it('应该正确处理异步方法', async () => {
    let executionCount = 0;
    
    class TestClass {
      @once()
      async asyncOperation() {
        executionCount++;
        await new Promise(resolve => setTimeout(resolve, 10));
        return `async-result-${executionCount}`;
      }
    }

    const instance = new TestClass();
    
    // 第一次调用
    const result1 = await instance.asyncOperation();
    expect(result1).toBe('async-result-1');
    expect(executionCount).toBe(1);
    
    // 第二次调用应该返回相同结果
    const result2 = await instance.asyncOperation();
    expect(result2).toBe('async-result-1');
    expect(executionCount).toBe(1);
  });

  it('应该正确处理带参数的方法', () => {
    let executionCount = 0;
    
    class TestClass {
      @once()
      methodWithParams(param1: string, param2: number) {
        executionCount++;
        return `${param1}-${param2}-${executionCount}`;
      }
    }

    const instance = new TestClass();
    
    // 第一次调用
    const result1 = instance.methodWithParams('test', 123);
    expect(result1).toBe('test-123-1');
    expect(executionCount).toBe(1);
    
    // 第二次调用（即使参数不同）应该返回第一次的结果
    const result2 = instance.methodWithParams('different', 456);
    expect(result2).toBe('test-123-1');
    expect(executionCount).toBe(1);
  });

  it('应该为不同的实例分别缓存', () => {
    let executionCount = 0;
    
    class TestClass {
      @once()
      operation() {
        executionCount++;
        return `instance-result-${executionCount}`;
      }
    }

    const instance1 = new TestClass();
    const instance2 = new TestClass();
    
    // 第一个实例
    const result1 = instance1.operation();
    expect(result1).toBe('instance-result-1');
    expect(executionCount).toBe(1);
    
    // 第二个实例应该重新执行
    const result2 = instance2.operation();
    expect(result2).toBe('instance-result-2');
    expect(executionCount).toBe(2);
    
    // 再次调用第一个实例应该返回缓存结果
    const result3 = instance1.operation();
    expect(result3).toBe('instance-result-1');
    expect(executionCount).toBe(2);
  });

  it('应该正确处理返回 undefined 的方法', () => {
    let executionCount = 0;
    
    class TestClass {
      @once()
      voidMethod() {
        executionCount++;
        return undefined;
      }
    }

    const instance = new TestClass();
    
    const result1 = instance.voidMethod();
    expect(result1).toBeUndefined();
    expect(executionCount).toBe(1);
    
    const result2 = instance.voidMethod();
    expect(result2).toBeUndefined();
    expect(executionCount).toBe(1);
  });

  it('应该支持多个方法使用 @once() 装饰器', () => {
    let count1 = 0;
    let count2 = 0;
    
    class TestClass {
      @once()
      method1() {
        count1++;
        return `method1-${count1}`;
      }
      
      @once()
      method2() {
        count2++;
        return `method2-${count2}`;
      }
    }

    const instance = new TestClass();
    
    // 调用第一个方法
    const result1 = instance.method1();
    expect(result1).toBe('method1-1');
    expect(count1).toBe(1);
    
    // 调用第二个方法
    const result2 = instance.method2();
    expect(result2).toBe('method2-1');
    expect(count2).toBe(1);
    
    // 再次调用两个方法
    const result3 = instance.method1();
    const result4 = instance.method2();
    expect(result3).toBe('method1-1');
    expect(result4).toBe('method2-1');
    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });
}); 