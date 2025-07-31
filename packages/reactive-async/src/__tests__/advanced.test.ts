import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { asyncSignal } from '../core/asyncSignal';

describe('asyncSignal 高级功能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('轮询功能', () => {
    it('应该支持轮询请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ count: 1 });
      const result = asyncSignal(mockService, {
        pollingInterval: 1000,
        manual: true,
      });

      await result.run();
      expect(mockService).toHaveBeenCalledTimes(1);

      // 推进时间到第一次轮询
      vi.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockService).toHaveBeenCalledTimes(2);

      // 推进时间到第二次轮询
      vi.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockService).toHaveBeenCalledTimes(3);
    });

    it('应该在取消时停止轮询', async () => {
      const mockService = vi.fn().mockResolvedValue({ count: 1 });
      const result = asyncSignal(mockService, {
        pollingInterval: 1000,
        manual: true,
      });

      await result.run();
      result.cancel();

      // 推进时间，不应该再调用服务
      vi.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockService).toHaveBeenCalledTimes(1);
    });
  });

  describe('防抖功能', () => {
    it('应该支持防抖请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        debounceWait: 300,
        manual: true,
      });

      // 快速连续调用
      result.run('param1');
      result.run('param2');
      result.run('param3');

      // 等待防抖时间
      vi.advanceTimersByTime(300);
      await new Promise(resolve => setTimeout(resolve, 0));

      // 应该只调用一次，使用最后一个参数
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith('param3');
    });
  });

  describe('节流功能', () => {
    it('应该支持节流请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        throttleWait: 1000,
        manual: true,
      });

      // 快速连续调用
      result.run('param1');
      result.run('param2');
      result.run('param3');

      await new Promise(resolve => setTimeout(resolve, 0));

      // 应该只调用一次，使用第一个参数
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith('param1');

      // 等待节流时间后再次调用
      vi.advanceTimersByTime(1000);
      result.run('param4');
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockService).toHaveBeenCalledTimes(2);
      expect(mockService).toHaveBeenCalledWith('param4');
    });
  });

  describe('重试功能', () => {
    it('应该支持重试机制', async () => {
      const error = new Error('Network error');
      const mockService = vi.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ name: 'success' });

      const result = asyncSignal(mockService, {
        retryCount: 2,
        retryInterval: 1000,
        manual: true,
      });

      const promise = result.run();
      expect(result.loading).toBe(true);

      // 等待第一次重试
      vi.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 0));

      // 等待第二次重试
      vi.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 0));

      const data = await promise;
      expect(data).toEqual({ name: 'success' });
      expect(mockService).toHaveBeenCalledTimes(3);
    });

    it('应该在重试次数用完后失败', async () => {
      const error = new Error('Network error');
      const mockService = vi.fn().mockRejectedValue(error);

      const result = asyncSignal(mockService, {
        retryCount: 2,
        retryInterval: 1000,
        manual: true,
      });

      const promise = result.run();

      // 等待所有重试完成
      vi.advanceTimersByTime(2000);
      await new Promise(resolve => setTimeout(resolve, 0));

      await expect(promise).rejects.toThrow('Network error');
      expect(mockService).toHaveBeenCalledTimes(3); // 初始调用 + 2次重试
    });
  });

  describe('缓存功能', () => {
    it('应该支持缓存机制', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        cacheKey: 'test-cache',
        cacheTime: 5000,
        manual: true,
      });

      // 第一次请求
      await result.run('param1');
      expect(mockService).toHaveBeenCalledTimes(1);

      // 第二次请求应该使用缓存
      await result.run('param1');
      expect(mockService).toHaveBeenCalledTimes(1); // 没有再次调用

      // 使用不同参数应该重新请求
      await result.run('param2');
      expect(mockService).toHaveBeenCalledTimes(2);
    });

    it('应该在缓存过期后重新请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        cacheKey: 'test-cache',
        cacheTime: 1000,
        manual: true,
      });

      // 第一次请求
      await result.run('param1');
      expect(mockService).toHaveBeenCalledTimes(1);

      // 等待缓存过期
      vi.advanceTimersByTime(1000);

      // 再次请求应该重新调用服务
      await result.run('param1');
      expect(mockService).toHaveBeenCalledTimes(2);
    });
  });

  describe('窗口焦点刷新', () => {
    it('应该在窗口获得焦点时刷新', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        refreshOnWindowFocus: true,
        manual: true,
      });

      // 初始请求
      await result.run();
      expect(mockService).toHaveBeenCalledTimes(1);

      // 模拟窗口获得焦点
      window.dispatchEvent(new Event('focus'));
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockService).toHaveBeenCalledTimes(2);
    });
  });

  describe('条件请求', () => {
    it('应该在 ready 为 false 时不发起请求', () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        ready: false,
        manual: true,
      });

      expect(mockService).not.toHaveBeenCalled();
    });

    it('应该在 ready 为 true 时发起请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        ready: true,
      });

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockService).toHaveBeenCalledTimes(1);
    });
  });

  describe('依赖刷新', () => {
    it('应该在依赖变化时重新请求', async () => {
      let userId = 'user1';
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      
      const result = asyncSignal(() => mockService(userId), {
        refreshDeps: [userId],
        manual: true,
      });

      // 第一次请求
      await result.run();
      expect(mockService).toHaveBeenCalledWith('user1');

      // 改变依赖
      userId = 'user2';
      await result.run();
      expect(mockService).toHaveBeenCalledWith('user2');
    });
  });

  describe('数据保鲜', () => {
    it('应该在数据保鲜期内不重新请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        staleTime: 5000,
        cacheTime: 10000,
        manual: true,
      });

      // 第一次请求
      await result.run();
      expect(mockService).toHaveBeenCalledTimes(1);

      // 在保鲜期内再次请求
      vi.advanceTimersByTime(2000);
      await result.run();
      expect(mockService).toHaveBeenCalledTimes(1); // 没有重新请求

      // 超过保鲜期后再次请求
      vi.advanceTimersByTime(4000);
      await result.run();
      expect(mockService).toHaveBeenCalledTimes(2); // 重新请求
    });
  });
}); 