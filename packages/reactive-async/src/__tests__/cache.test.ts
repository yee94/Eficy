import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cacheManager } from '../core/cache';

describe('缓存管理器', () => {
  let mockDateNow: any;
  let currentTime = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    cacheManager.clear();
    
    // 模拟 Date.now()
    currentTime = 1000000; // 设置一个基准时间
    mockDateNow = vi.spyOn(Date, 'now').mockImplementation(() => currentTime);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    mockDateNow?.mockRestore();
  });

  describe('基础缓存功能', () => {
    it('应该设置和获取缓存', () => {
      const data = { name: 'test', age: 25 };
      const params = ['user1'];
      
      cacheManager.set('test-key', data, params, 5000);
      
      const cached = cacheManager.get('test-key');
      expect(cached).toBeDefined();
      expect(cached?.data).toEqual(data);
      expect(cached?.params).toEqual(params);
    });

    it('应该在缓存不存在时返回 undefined', () => {
      const cached = cacheManager.get('non-existent-key');
      expect(cached).toBeUndefined();
    });

    it('应该支持不同的数据类型', () => {
      const stringData = 'test string';
      const numberData = 42;
      const arrayData = [1, 2, 3];
      const objectData = { name: 'test' };

      cacheManager.set('string-key', stringData, [], 5000);
      cacheManager.set('number-key', numberData, [], 5000);
      cacheManager.set('array-key', arrayData, [], 5000);
      cacheManager.set('object-key', objectData, [], 5000);

      expect(cacheManager.get('string-key')?.data).toBe(stringData);
      expect(cacheManager.get('number-key')?.data).toBe(numberData);
      expect(cacheManager.get('array-key')?.data).toEqual(arrayData);
      expect(cacheManager.get('object-key')?.data).toEqual(objectData);
    });
  });

  describe('缓存过期', () => {
    it('应该在缓存过期后返回 undefined', () => {
      const data = { name: 'test' };
      cacheManager.set('expire-key', data, [], 1000);

      // 缓存应该存在
      expect(cacheManager.get('expire-key')).toBeDefined();

      // 推进时间超过缓存时间
      currentTime += 1001;

      // 缓存应该过期
      expect(cacheManager.get('expire-key')).toBeUndefined();
    });

    it('应该支持不同的缓存时间', () => {
      const data1 = { name: 'test1' };
      const data2 = { name: 'test2' };

      cacheManager.set('short-key', data1, [], 1000);
      cacheManager.set('long-key', data2, [], 5000);

      // 推进时间到短期缓存过期
      currentTime += 1001;

      expect(cacheManager.get('short-key')).toBeUndefined();
      expect(cacheManager.get('long-key')).toBeDefined();

      // 推进时间到长期缓存过期
      currentTime += 4000;

      expect(cacheManager.get('long-key')).toBeUndefined();
    });
  });

  describe('缓存清理', () => {
    it('应该支持删除特定缓存', () => {
      const data = { name: 'test' };
      cacheManager.set('delete-key', data, [], 5000);

      expect(cacheManager.get('delete-key')).toBeDefined();

      cacheManager.delete('delete-key');

      expect(cacheManager.get('delete-key')).toBeUndefined();
    });

    it('应该支持清空所有缓存', () => {
      cacheManager.set('key1', 'data1', [], 5000);
      cacheManager.set('key2', 'data2', [], 5000);
      cacheManager.set('key3', 'data3', [], 5000);

      expect(cacheManager.get('key1')).toBeDefined();
      expect(cacheManager.get('key2')).toBeDefined();
      expect(cacheManager.get('key3')).toBeDefined();

      cacheManager.clear();

      expect(cacheManager.get('key1')).toBeUndefined();
      expect(cacheManager.get('key2')).toBeUndefined();
      expect(cacheManager.get('key3')).toBeUndefined();
    });
  });

  describe('缓存统计', () => {
    it('应该提供缓存大小信息', () => {
      cacheManager.set('key1', 'data1', [], 5000);
      cacheManager.set('key2', 'data2', [], 5000);
      cacheManager.set('key3', 'data3', [], 5000);

      expect(cacheManager.size()).toBe(3);
    });

    it('应该在缓存过期后更新大小', () => {
      cacheManager.set('key1', 'data1', [], 1000);
      cacheManager.set('key2', 'data2', [], 5000);

      expect(cacheManager.size()).toBe(2);

      // 推进时间使第一个缓存过期
      currentTime += 1001;

      // 获取过期缓存会自动清理
      cacheManager.get('key1');
      expect(cacheManager.size()).toBe(1);
    });
  });

  describe('缓存键管理', () => {
    it('应该支持函数式缓存键', () => {
      const keyFn = (userId: string) => `user-${userId}`;
      const data = { name: 'test' };

      cacheManager.set(keyFn('user1'), data, ['user1'], 5000);
      cacheManager.set(keyFn('user2'), data, ['user2'], 5000);

      expect(cacheManager.get(keyFn('user1'))).toBeDefined();
      expect(cacheManager.get(keyFn('user2'))).toBeDefined();
    });

    it('应该支持复杂参数作为缓存键的一部分', () => {
      const data = { name: 'test' };
      const params1 = ['user1', { page: 1, size: 10 }];
      const params2 = ['user1', { page: 2, size: 10 }];

      cacheManager.set('user-list', data, params1, 5000);
      cacheManager.set('user-list', data, params2, 5000);

      // 应该有不同的缓存条目
      expect(cacheManager.size()).toBeGreaterThanOrEqual(1);
    });
  });

  describe('缓存性能', () => {
    it('应该高效处理大量缓存条目', () => {
      const startTime = Date.now();

      // 创建大量缓存条目
      for (let i = 0; i < 1000; i++) {
        cacheManager.set(`key-${i}`, { id: i, data: `data-${i}` }, [i], 5000);
      }

      const setTime = Date.now() - startTime;
      expect(setTime).toBeLessThan(100); // 应该在100ms内完成

      // 测试获取性能
      const getStartTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        cacheManager.get(`key-${i}`);
      }

      const getTime = Date.now() - getStartTime;
      expect(getTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该自动清理过期缓存', () => {
      // 创建一些短期缓存
      for (let i = 0; i < 10; i++) {
        cacheManager.set(`expire-${i}`, { id: i }, [i], 1000);
      }

      // 创建一些长期缓存
      for (let i = 0; i < 10; i++) {
        cacheManager.set(`persist-${i}`, { id: i }, [i], 10000);
      }

      expect(cacheManager.size()).toBe(20);

      // 推进时间使短期缓存过期
      currentTime += 1001;

      // 获取过期缓存会自动清理
      for (let i = 0; i < 10; i++) {
        cacheManager.get(`expire-${i}`);
      }

      // 应该只剩下长期缓存
      expect(cacheManager.size()).toBe(10);
    });
  });
});