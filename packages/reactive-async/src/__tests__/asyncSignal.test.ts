import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { asyncSignal } from '../core/asyncSignal';

describe('asyncSignal', () => {
 
  describe('基础功能', () => {
    it('应该创建 asyncSignal 并返回正确的结构', () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('loading');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('run');
      expect(result).toHaveProperty('refresh');
      expect(result).toHaveProperty('cancel');
      expect(result).toHaveProperty('mutate');
      expect(result).toHaveProperty('computed');
    });

    it('应该自动执行服务函数', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService);

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual({ name: 'test' });
      expect(result.loading).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('应该处理服务函数错误', async () => {
      const error = new Error('Network error');
      const mockService = vi.fn().mockRejectedValue(error);
      const result = asyncSignal(mockService, { manual: true });

      // 手动触发请求并等待错误
      try {
        await result.run();
      } catch (e) {
        // 预期的错误，忽略
      }

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(result.data).toBeUndefined();
      expect(result.loading).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('手动模式', () => {
    it('应该支持手动触发模式', () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, { manual: true });

      expect(mockService).not.toHaveBeenCalled();
      expect(result.loading).toBe(false);
    });

    it('应该手动触发请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, { manual: true });

      const promise = result.run();
      expect(result.loading).toBe(true);

      const data = await promise;
      expect(data).toEqual({ name: 'test' });
      expect(result.data).toEqual({ name: 'test' });
      expect(result.loading).toBe(false);
    });
  });

  describe('回调函数', () => {
    it('应该调用 onSuccess 回调', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onBefore = vi.fn();
      const onFinally = vi.fn();

      const result = asyncSignal(mockService, {
        onSuccess,
        onError,
        onBefore,
        onFinally,
      });

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(onBefore).toHaveBeenCalledWith([]);
      expect(onSuccess).toHaveBeenCalledWith({ name: 'test' }, []);
      expect(onFinally).toHaveBeenCalledWith([], { name: 'test' }, undefined);
      expect(onError).not.toHaveBeenCalled();
    });

    it('应该调用 onError 回调', async () => {
      const error = new Error('Network error');
      const mockService = vi.fn().mockRejectedValue(error);
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onBefore = vi.fn();
      const onFinally = vi.fn();

      const result = asyncSignal(mockService, {
        onSuccess,
        onError,
        onBefore,
        onFinally,
        manual: true,
      });

      // 手动触发请求并等待错误
      try {
        await result.run();
      } catch (e) {
        // 预期的错误，忽略
      }

      expect(onBefore).toHaveBeenCalledWith([]);
      expect(onError).toHaveBeenCalledWith(error, []);
      expect(onFinally).toHaveBeenCalledWith([], undefined, error);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('数据修改', () => {
    it('应该支持直接修改数据', () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, { manual: true });

      result.mutate({ name: 'updated' });
      expect(result.data).toEqual({ name: 'updated' });
    });

    it('应该支持函数式修改数据', () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, { manual: true });

      result.mutate((oldData) => {
        if (!oldData) return { name: 'new' };
        return { ...oldData, name: 'updated' };
      });

      expect(result.data).toEqual({ name: 'new' });
    });
  });

  describe('刷新功能', () => {
    it('应该支持刷新请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, { manual: true });

      // 第一次请求
      await result.run('param1');
      expect(mockService).toHaveBeenCalledWith('param1');

      // 刷新请求
      await result.refresh();
      expect(mockService).toHaveBeenCalledWith('param1');
      expect(mockService).toHaveBeenCalledTimes(2);
    });
  });

  describe('取消功能', () => {
    it('应该支持取消请求', async () => {
      const mockService = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ name: 'test' }), 100))
      );
      const result = asyncSignal(mockService, { manual: true });

      const promise = result.run();
      result.cancel();

      await expect(promise).rejects.toThrow();
    });
  });

  describe('计算属性', () => {
    it('应该支持计算属性', () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, { manual: true });

      const computed = result.computed((state) => {
        if (state.loading) return 'loading';
        if (state.error) return 'error';
        if (state.data) return (state.data as any).name;
        return 'no data';
      });

      expect(computed).toBeDefined();
      expect(typeof computed).toBe('function');
    });
  });

  describe('初始数据', () => {
    it('应该支持初始数据', () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const initialData = { name: 'initial' };
      const result = asyncSignal(mockService, { 
        manual: true,
        initialData 
      });

      expect(result.data).toEqual(initialData);
    });
  });

  describe('格式化结果', () => {
    it('应该支持格式化结果', async () => {
      const mockService = vi.fn().mockResolvedValue({ 
        data: { name: 'test' },
        status: 200 
      });
      const formatResult = vi.fn().mockImplementation((response) => response.data);
      
      const result = asyncSignal(mockService, { formatResult });

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(formatResult).toHaveBeenCalledWith({ 
        data: { name: 'test' },
        status: 200 
      });
      expect(result.data).toEqual({ name: 'test' });
    });
  });
});