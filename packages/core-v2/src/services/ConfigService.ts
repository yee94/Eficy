import { injectable } from 'tsyringe';
import { merge, get, set, has, cloneDeep } from 'lodash';
import { IConfigService } from '../interfaces';

/**
 * 配置服务
 * 管理框架的全局配置，支持递归覆盖
 */
@injectable()
export class ConfigService implements IConfigService {
  private config: Record<string, unknown> = {
    // 默认配置
    defaultComponentMap: {},
    successAlert: ({ msg }: { msg: string }) => alert(`Success: ${msg}`),
    failAlert: ({ msg }: { msg: string }) => alert(`Error: ${msg}`),
    
    // 渲染相关配置
    needTransformPropsList: ['style'],
    loopExceptFns: [],
    
    // 请求相关配置
    requestTimeout: 5000,
    requestRetries: 3,
    
    // 开发模式配置
    debug: false,
    performance: false,
  };

  /**
   * 获取配置值
   */
  get<T>(key: string, defaultValue?: T): T {
    const value = get(this.config, key, defaultValue);
    return value as T;
  }

  /**
   * 设置配置值
   */
  set(key: string, value: unknown): void {
    set(this.config, key, value);
  }

  /**
   * 批量设置配置
   */
  setMany(config: Record<string, unknown>): void {
    Object.keys(config).forEach(key => {
      this.set(key, config[key]);
    });
  }

  /**
   * 扩展配置（递归合并）
   */
  extend(config: Record<string, unknown>): void {
    this.config = merge(cloneDeep(this.config), config);
  }

  /**
   * 检查配置是否存在
   */
  has(key: string): boolean {
    return has(this.config, key);
  }

  /**
   * 获取所有配置
   */
  getAll(): Record<string, unknown> {
    return cloneDeep(this.config);
  }

  /**
   * 重置配置为默认值
   */
  reset(): void {
    const defaultConfig = {
      defaultComponentMap: {},
      successAlert: ({ msg }: { msg: string }) => alert(`Success: ${msg}`),
      failAlert: ({ msg }: { msg: string }) => alert(`Error: ${msg}`),
      needTransformPropsList: ['style'],
      loopExceptFns: [],
      requestTimeout: 5000,
      requestRetries: 3,
      debug: false,
      performance: false,
    };
    
    this.config = cloneDeep(defaultConfig);
  }

  /**
   * 递归覆盖配置
   * 支持深度合并对象和数组
   */
  recursiveOverride(newConfig: Record<string, unknown>): void {
    this.config = this.deepMergeWithArrayConcat(this.config, newConfig);
  }

  /**
   * 深度合并，数组进行拼接而非替换
   */
  private deepMergeWithArrayConcat(target: unknown, source: unknown): unknown {
    if (Array.isArray(target) && Array.isArray(source)) {
      return [...target, ...source];
    }

    if (this.isPlainObject(target) && this.isPlainObject(source)) {
      const result = { ...target } as Record<string, unknown>;
      
      Object.keys(source).forEach(key => {
        const sourceValue = (source as Record<string, unknown>)[key];
        const targetValue = result[key];
        
        result[key] = this.deepMergeWithArrayConcat(targetValue, sourceValue);
      });
      
      return result;
    }

    return source;
  }

  /**
   * 检查是否为普通对象
   */
  private isPlainObject(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && obj !== null && obj.constructor === Object;
  }
} 