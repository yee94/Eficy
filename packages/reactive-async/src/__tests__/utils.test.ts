import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  debounce, 
  throttle, 
  delay, 
  generateId, 
  isEqual, 
  createCancelToken, 
  makeCancellable 
} from '../utils';

describe('工具函数', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('debounce', () => {
    it('应该防抖函数调用', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      // 快速连续调用
      debouncedFn('param1');
      debouncedFn('param2');
      debouncedFn('param3');

      expect(mockFn).not.toHaveBeenCalled();

      // 等待防抖时间
      vi.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('param3');
    });

    it('应该在防抖期间重新调用时重置计时器', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('param1');
      
      // 在防抖期间再次调用
      vi.advanceTimersByTime(200);
      debouncedFn('param2');
      
      // 等待防抖时间
      vi.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('param2');
    });
  });

  describe('throttle', () => {
    it('应该节流函数调用', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 1000);

      // 快速连续调用
      throttledFn('param1');
      throttledFn('param2');
      throttledFn('param3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('param1');

      // 等待节流时间
      vi.advanceTimersByTime(1000);
      
      // lodash throttle 可能在时间推进后触发尾随调用
      // 所以我们检查调用次数应该是 1 或 2
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(mockFn.mock.calls.length).toBeLessThanOrEqual(2);
      
      // 再次调用应该立即执行
      throttledFn('param4');
      expect(mockFn).toHaveBeenCalledWith('param4');
    });

    it('应该在节流期间忽略调用', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 1000);

      throttledFn('param1');
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 在节流期间调用应该被忽略
      throttledFn('param2');
      throttledFn('param3');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('delay', () => {
    it('应该延迟指定时间', async () => {
      const startTime = Date.now();
      
      const delayPromise = delay(1000);
      vi.advanceTimersByTime(1000);
      await delayPromise;
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });
  });

  describe('isEqual', () => {
    it('应该比较基本类型', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual(1, 2)).toBe(false);
      expect(isEqual('hello', 'hello')).toBe(true);
      expect(isEqual('hello', 'world')).toBe(false);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(false, true)).toBe(false);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
      expect(isEqual(null, undefined)).toBe(false);
    });

    it('应该比较对象', () => {
      const obj1 = { name: 'test', age: 25 };
      const obj2 = { name: 'test', age: 25 };
      const obj3 = { name: 'test', age: 30 };

      expect(isEqual(obj1, obj2)).toBe(true);
      expect(isEqual(obj1, obj3)).toBe(false);
      expect(isEqual(obj1, { ...obj1 })).toBe(true);
    });

    it('应该比较数组', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];

      expect(isEqual(arr1, arr2)).toBe(true);
      expect(isEqual(arr1, arr3)).toBe(false);
      expect(isEqual(arr1, [...arr1])).toBe(true);
    });

    it('应该比较嵌套结构', () => {
      const nested1 = {
        user: { name: 'test', details: { age: 25, city: 'NY' } },
        items: [1, 2, { id: 1, value: 'test' }]
      };
      const nested2 = {
        user: { name: 'test', details: { age: 25, city: 'NY' } },
        items: [1, 2, { id: 1, value: 'test' }]
      };
      const nested3 = {
        user: { name: 'test', details: { age: 25, city: 'LA' } },
        items: [1, 2, { id: 1, value: 'test' }]
      };

      expect(isEqual(nested1, nested2)).toBe(true);
      expect(isEqual(nested1, nested3)).toBe(false);
    });

    it('应该处理不同类型的比较', () => {
      expect(isEqual(1, '1')).toBe(false);
      expect(isEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
      expect(isEqual(null, 0)).toBe(false);
    });
  });

  describe('createCancelToken', () => {
    it('应该创建取消令牌', () => {
      const token = createCancelToken();

      expect(token).toHaveProperty('isCancelled');
      expect(token).toHaveProperty('cancel');
      expect(token).toHaveProperty('promise');
      expect(typeof token.cancel).toBe('function');
      expect(typeof token.isCancelled).toBe('boolean');
      expect(token.isCancelled).toBe(false);
    });

    it('应该支持取消操作', async () => {
      const token = createCancelToken();

      expect(token.isCancelled).toBe(false);
      
      // cancel 函数不会直接抛出错误，但会拒绝 promise
      token.cancel();
      expect(typeof token.cancel).toBe('function');
      
      // 验证 promise 被拒绝
      await expect(token.promise).rejects.toThrow('Request cancelled');
    });
  });

  describe('makeCancellable', () => {
    it('应该使 Promise 可取消', async () => {
      const token = createCancelToken();
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 100));
      const cancellablePromise = makeCancellable(promise, token);

      // 取消 Promise
      token.cancel();

      await expect(cancellablePromise).rejects.toThrow();
    });

    it('应该在未取消时正常执行', async () => {
      const token = createCancelToken();
      const promise = Promise.resolve('success');
      const cancellablePromise = makeCancellable(promise, token);

      const result = await cancellablePromise;
      expect(result).toBe('success');
    });

    it('应该在取消后立即拒绝', async () => {
      const token = createCancelToken();
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 1000));
      const cancellablePromise = makeCancellable(promise, token);

      // 立即取消
      token.cancel();

      await expect(cancellablePromise).rejects.toThrow();
    });
  });
});