/**
 * 工具函数测试
 */

import { describe, it, expect, vi } from 'vitest';
import { signal } from '@eficy/reactive';
import {
  hasSignals,
  resolveSignals,
  generateId,
  safeCall,
  debounce,
  throttle,
  deepMerge
} from '../../src/utils';

describe('Utils', () => {
  describe('hasSignals', () => {
    it('应该检测到包含 signals 的对象', () => {
      const count = signal(0);
      const obj = {
        normalProp: 'value',
        signalProp: count
      };

      expect(hasSignals(obj)).toBe(true);
    });

    it('应该检测到嵌套对象中的 signals', () => {
      const count = signal(0);
      const obj = {
        nested: {
          signalProp: count
        }
      };

      expect(hasSignals(obj)).toBe(true);
    });

    it('应该检测到数组中的 signals', () => {
      const count = signal(0);
      const obj = {
        items: [1, 2, count]
      };

      expect(hasSignals(obj)).toBe(true);
    });

    it('不包含 signals 的对象应该返回 false', () => {
      const obj = {
        normalProp: 'value',
        numberProp: 42,
        arrayProp: [1, 2, 3],
        nestedProp: {
          innerProp: 'inner'
        }
      };

      expect(hasSignals(obj)).toBe(false);
    });

    it('null 和 undefined 应该返回 false', () => {
      expect(hasSignals(null)).toBe(false);
      expect(hasSignals(undefined)).toBe(false);
    });

    it('基本类型应该返回 false', () => {
      expect(hasSignals('string')).toBe(false);
      expect(hasSignals(42)).toBe(false);
      expect(hasSignals(true)).toBe(false);
    });
  });

  describe('resolveSignals', () => {
    it('应该解析对象中的 signals', () => {
      const count = signal(5);
      const name = signal('test');
      const obj = {
        count,
        name,
        static: 'value'
      };

      const resolved = resolveSignals(obj);

      expect(resolved).toEqual({
        count: 5,
        name: 'test',
        static: 'value'
      });
    });

    it('应该解析嵌套对象中的 signals', () => {
      const count = signal(10);
      const obj = {
        data: {
          counter: count,
          label: 'Counter'
        }
      };

      const resolved = resolveSignals(obj);

      expect(resolved).toEqual({
        data: {
          counter: 10,
          label: 'Counter'
        }
      });
    });

    it('应该解析数组中的 signals', () => {
      const count1 = signal(1);
      const count2 = signal(2);
      const arr = [count1, 'static', count2];

      const resolved = resolveSignals(arr);

      expect(resolved).toEqual([1, 'static', 2]);
    });

    it('应该处理单个 signal', () => {
      const count = signal(42);
      const resolved = resolveSignals(count);

      expect(resolved).toBe(42);
    });

    it('基本类型应该原样返回', () => {
      expect(resolveSignals('string')).toBe('string');
      expect(resolveSignals(42)).toBe(42);
      expect(resolveSignals(true)).toBe(true);
      expect(resolveSignals(null)).toBe(null);
      expect(resolveSignals(undefined)).toBe(undefined);
    });
  });

  describe('generateId', () => {
    it('应该生成唯一的 ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('应该支持自定义前缀', () => {
      const id = generateId('custom');

      expect(id).toMatch(/^custom_/);
    });

    it('应该包含计数器和时间戳', () => {
      const id = generateId('test');

      expect(id).toMatch(/^test_\d+_[a-z0-9]+$/);
    });
  });

  describe('safeCall', () => {
    it('应该正常执行函数', () => {
      const result = safeCall(() => 42, 0);

      expect(result).toBe(42);
    });

    it('应该在出错时返回回退值', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = safeCall(() => {
        throw new Error('Test error');
      }, 'fallback');

      expect(result).toBe('fallback');
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('应该支持复杂的回退值', () => {
      const fallback = { error: true, value: null };
      
      const result = safeCall(() => {
        throw new Error('Test error');
      }, fallback);

      expect(result).toBe(fallback);
    });
  });

  describe('debounce', () => {
    it('应该延迟执行函数', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该取消之前的调用', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该传递正确的参数', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 50);

      debouncedFn('arg1', 'arg2');

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    it('应该限制函数执行频率', async () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 150));
      
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('应该传递正确的参数', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn('arg1', 'arg2');

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('deepMerge', () => {
    it('应该深度合并对象', () => {
      const target = {
        a: 1,
        b: {
          c: 2,
          d: 3
        }
      };

      const source = {
        b: {
          d: 4,
          e: 5
        },
        f: 6
      };

      const result = deepMerge(target, source);

      expect(result).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 4,
          e: 5
        },
        f: 6
      });
    });

    it('应该修改目标对象', () => {
      const target = { a: 1 };
      const source = { b: 2 };

      deepMerge(target, source);

      expect(target).toEqual({ a: 1, b: 2 });
    });

    it('应该处理多个源对象', () => {
      const target = { a: 1 };
      const source1 = { b: 2 };
      const source2 = { c: 3 };

      const result = deepMerge(target, source1, source2);

      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 3
      });
    });

    it('应该处理空源对象', () => {
      const target = { a: 1 };

      const result = deepMerge(target);

      expect(result).toEqual({ a: 1 });
    });

    it('应该处理 null 和 undefined', () => {
      const target = { a: 1 };

      expect(() => {
        deepMerge(target, null as any, undefined as any);
      }).not.toThrow();
    });
  });
});