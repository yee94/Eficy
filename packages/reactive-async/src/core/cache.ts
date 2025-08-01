import type { CacheData } from '../types';

/**
 * 全局缓存管理器
 */
class CacheManager {
  private cache = new Map<string, CacheData<any>>();
  
  /**
   * 获取当前时间（支持测试环境的时间模拟）
   */
  private getCurrentTime(): number {
    return Date.now();
  }
  
  /**
   * 设置缓存
   */
  set<TData>(key: string, data: TData, params: any[], cacheTime: number): void {
    const now = this.getCurrentTime();
    this.cache.set(key, {
      data,
      params,
      time: now,
      expireTime: now + cacheTime
    });
  }
  
  /**
   * 获取缓存
   */
  get<TData>(key: string): CacheData<TData> | undefined {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return undefined;
    }
    
    // 检查是否过期
    if (this.getCurrentTime() > cached.expireTime) {
      this.cache.delete(key);
      return undefined;
    }
    
    return cached;
  }
  
  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    if (this.getCurrentTime() > cached.time) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// 全局缓存实例
export const cacheManager = new CacheManager();