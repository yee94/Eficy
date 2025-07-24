import { DependencyContainer } from 'tsyringe';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BasePlugin } from '../BasePlugin';
import { TOKENS } from '../../container/tokens';
import { IRequestConfig } from '../../interfaces';

/**
 * 请求插件
 * 处理HTTP请求相关功能
 */
export class RequestPlugin extends BasePlugin {
  public readonly name = 'request';
  public readonly version = '1.0.0';
  public readonly singleton = true;

  private axiosInstance?: AxiosInstance;

  protected onInstall(container: DependencyContainer, options?: any): void {
    // 创建axios实例
    this.axiosInstance = axios.create({
      timeout: options?.timeout || 5000,
      ...options?.axiosConfig
    });

    // 注册请求服务
    this.registerSingleton(TOKENS.REQUEST_SERVICE, {
      request: this.request.bind(this),
      get: this.get.bind(this),
      post: this.post.bind(this),
      put: this.put.bind(this),
      delete: this.delete.bind(this),
      setDefaultConfig: this.setDefaultConfig.bind(this),
      addInterceptor: this.addInterceptor.bind(this)
    });
  }

  protected onUninstall(container: DependencyContainer): void {
    this.axiosInstance = undefined;
  }

  /**
   * 通用请求方法
   */
  private async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    if (!this.axiosInstance) {
      throw new Error('RequestPlugin not initialized');
    }

    try {
      const response = await this.axiosInstance.request(config);
      return response.data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  /**
   * GET请求
   */
  private async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST请求
   */
  private async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT请求
   */
  private async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE请求
   */
  private async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * 设置默认配置
   */
  private setDefaultConfig(config: AxiosRequestConfig): void {
    if (this.axiosInstance) {
      Object.assign(this.axiosInstance.defaults, config);
    }
  }

  /**
   * 添加拦截器
   */
  private addInterceptor(type: 'request' | 'response', interceptor: any): number {
    if (!this.axiosInstance) {
      throw new Error('RequestPlugin not initialized');
    }

    if (type === 'request') {
      return this.axiosInstance.interceptors.request.use(
        interceptor.fulfilled,
        interceptor.rejected
      );
    } else {
      return this.axiosInstance.interceptors.response.use(
        interceptor.fulfilled,
        interceptor.rejected
      );
    }
  }

  /**
   * 执行请求配置
   */
  public async executeRequest(requestConfig: IRequestConfig, context?: any): Promise<any> {
    const { url, method = 'GET', params, data, format } = requestConfig;

    let result;
    switch (method.toUpperCase()) {
      case 'GET':
        result = await this.get(url, { params });
        break;
      case 'POST':
        result = await this.post(url, data, { params });
        break;
      case 'PUT':
        result = await this.put(url, data, { params });
        break;
      case 'DELETE':
        result = await this.delete(url, { params });
        break;
      default:
        throw new Error(`Unsupported request method: ${method}`);
    }

    // 格式化响应数据
    if (format && typeof format === 'function') {
      result = format(result);
    }

    return result;
  }
} 