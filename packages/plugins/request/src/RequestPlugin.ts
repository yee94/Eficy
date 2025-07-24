import { BasePlugin, TOKENS, IRequestConfig, IActionProps } from '@eficy/core-v2';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { merge } from 'lodash';

export interface RequestPluginOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  interceptors?: {
    request?: (config: AxiosRequestConfig) => AxiosRequestConfig;
    response?: (response: any) => any;
    error?: (error: any) => any;
  };
}

export class RequestPlugin extends BasePlugin {
  name = 'request';
  priority = 100;
  
  private axiosInstance: AxiosInstance;
  private options: RequestPluginOptions;

  constructor(options: RequestPluginOptions = {}) {
    super();
    this.options = options;
    this.axiosInstance = this.createAxiosInstance();
  }

  protected onInstall(): void {
    // Register request service
    this.registerInstance('axios', this.axiosInstance);
    
    // Register request action
    const actionHandler = this.resolve(TOKENS.ACTION_HANDLER);
    actionHandler.registerAction('request', this.handleRequestAction.bind(this));
  }

  protected onUninstall(): void {
    const actionHandler = this.resolve(TOKENS.ACTION_HANDLER);
    actionHandler.unregisterAction('request');
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.options.baseURL,
      timeout: this.options.timeout || 10000,
      headers: this.options.headers,
    });

    // Setup interceptors
    if (this.options.interceptors?.request) {
      instance.interceptors.request.use(this.options.interceptors.request);
    }

    if (this.options.interceptors?.response) {
      instance.interceptors.response.use(
        this.options.interceptors.response,
        this.options.interceptors.error
      );
    }

    return instance;
  }

  private async handleRequestAction(data: IRequestConfig, controller: any): Promise<void> {
    try {
      const response = await this.executeRequest(data);
      
      if (data.format && typeof data.format === 'function') {
        const actionProps: IActionProps = data.format(response);
        if (actionProps && actionProps.action) {
          await controller.run(actionProps, false);
        }
      }
    } catch (error) {
      console.error('Request failed:', error);
      
      // Execute fail action if available
      await controller.run({
        action: 'fail',
        data: {
          message: error instanceof Error ? error.message : 'Request failed',
          error
        }
      }, false);
    }
  }

  async executeRequest(config: IRequestConfig): Promise<any> {
    const requestConfig: AxiosRequestConfig = {
      url: config.url,
      method: config.method || 'GET',
      data: config.data,
      params: config.params,
      headers: config.headers,
    };

    const response = await this.axiosInstance.request(requestConfig);
    return response.data;
  }

  updateConfig(options: Partial<RequestPluginOptions>): void {
    this.options = merge(this.options, options);
    this.axiosInstance = this.createAxiosInstance();
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}