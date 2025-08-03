import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { asyncSignal } from '../core/asyncSignal';

describe('asyncSignal 高级功能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('轮询功能', () => {
    it('应该支持轮询请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ count: 1 });
      const result = asyncSignal(mockService, {
        pollingInterval: 100, // 使用较短的间隔进行测试
        manual: true,
      });

      await result.run();
      expect(mockService).toHaveBeenCalledTimes(1);

      // 等待轮询间隔
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockService).toHaveBeenCalledTimes(2);

      // 再等待一次轮询
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockService).toHaveBeenCalledTimes(3);

      // 停止轮询
      result.cancel();
    }, 10000);

    it('应该在取消时停止轮询', async () => {
      const mockService = vi.fn().mockResolvedValue({ count: 1 });
      const result = asyncSignal(mockService, {
        pollingInterval: 100,
        manual: true,
      });

      await result.run();
      expect(mockService).toHaveBeenCalledTimes(1);

      // 立即取消
      result.cancel();

      // 等待轮询间隔，不应该再调用
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockService).toHaveBeenCalledTimes(1);
    }, 5000);
  });

  describe('防抖功能', () => {
    it('应该支持防抖请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        debounceWait: 100,
        manual: true,
      });

      // 快速连续调用
      result.run('param1');
      result.run('param2');
      result.run('param3');

      // 等待防抖时间
      await new Promise(resolve => setTimeout(resolve, 150));

      // 应该只调用一次，使用最后一个参数
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith('param3');
    }, 5000);
  });

  describe('节流功能', () => {
    it('应该支持节流请求', async () => {
      const mockService = vi.fn().mockResolvedValue({ name: 'test' });
      const result = asyncSignal(mockService, {
        throttleWait: 100,
        manual: true,
      });

      // 快速连续调用
      result.run('param1');
      result.run('param2');
      result.run('param3');

      // 应该立即调用一次
      expect(mockService).toHaveBeenCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith('param1');

      // 等待节流时间后再次调用
      await new Promise(resolve => setTimeout(resolve, 150));
      result.run('param4');
      
      // Lodash throttle 可能会有尾随调用，所以调用次数可能是 2 或 3
      expect(mockService.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(mockService.mock.calls.length).toBeLessThanOrEqual(3);
      expect(mockService).toHaveBeenCalledWith('param4');
    }, 5000);
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
        retryInterval: 100,
        manual: true,
      });

      const data = await result.run();
      expect(data).toEqual({ name: 'success' });
      expect(mockService).toHaveBeenCalledTimes(3);
    }, 10000);

    it('应该在重试次数用完后失败', async () => {
      const error = new Error('Network error');
      const mockService = vi.fn().mockRejectedValue(error);

      const result = asyncSignal(mockService, {
        retryCount: 2,
        retryInterval: 100,
        manual: true,
      });

      await expect(result.run()).rejects.toThrow('Network error');
      expect(mockService).toHaveBeenCalledTimes(3); // 初始调用 + 2次重试
    }, 10000);
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
        cacheTime: 100,
        manual: true,
      });

      // 第一次请求
      await result.run('param1');
      expect(mockService).toHaveBeenCalledTimes(1);

      // 立即再次请求，应该使用缓存
      await result.run('param1');
      expect(mockService).toHaveBeenCalledTimes(1);

      // 等待缓存过期
      await new Promise(resolve => setTimeout(resolve, 150));

      // 再次请求应该重新调用服务
      await result.run('param1');
      expect(mockService).toHaveBeenCalledTimes(2);
    }, 5000);
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
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockService).toHaveBeenCalledTimes(1);
    }, 5000);
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
        cacheKey: 'stale-test',
        staleTime: 200,
        cacheTime: 500,
        manual: true,
      });

      // 第一次请求
      await result.run();
      expect(mockService).toHaveBeenCalledTimes(1);

      // 在保鲜期内再次请求
      await new Promise(resolve => setTimeout(resolve, 100));
      await result.run();
      expect(mockService).toHaveBeenCalledTimes(1); // 没有重新请求

      // 超过保鲜期后再次请求
      await new Promise(resolve => setTimeout(resolve, 150));
      await result.run();
      expect(mockService).toHaveBeenCalledTimes(2); // 重新请求
    }, 10000);
  });
});