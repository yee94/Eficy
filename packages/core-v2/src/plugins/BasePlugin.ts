import { DependencyContainer } from 'tsyringe';
import { IPlugin } from '../interfaces';

/**
 * 插件基类
 * 所有插件都应该继承此类或实现IPlugin接口
 */
export abstract class BasePlugin implements IPlugin {
  public abstract readonly name: string;
  public abstract readonly version: string;
  public readonly singleton: boolean = false;
  
  protected container?: DependencyContainer;
  protected options?: any;

  /**
   * 安装插件
   */
  install(container: DependencyContainer, options?: any): void {
    this.container = container;
    this.options = options;
    this.onInstall(container, options);
  }

  /**
   * 卸载插件
   */
  uninstall?(container: DependencyContainer): void {
    this.onUninstall?.(container);
    this.container = undefined;
    this.options = undefined;
  }

  /**
   * 配置插件
   */
  configure?(options: any): void {
    this.options = { ...this.options, ...options };
    this.onConfigure?.(options);
  }

  /**
   * 插件安装时调用
   */
  protected abstract onInstall(container: DependencyContainer, options?: any): void;

  /**
   * 插件卸载时调用（可选）
   */
  protected onUninstall?(container: DependencyContainer): void;

  /**
   * 插件配置时调用（可选）
   */
  protected onConfigure?(options: any): void;

  /**
   * 获取容器
   */
  protected getContainer(): DependencyContainer {
    if (!this.container) {
      throw new Error(`Plugin "${this.name}" is not installed`);
    }
    return this.container;
  }

  /**
   * 获取配置
   */
  protected getOptions(): any {
    return this.options || {};
  }

  /**
   * 注册服务到容器
   */
  protected registerService<T>(token: any, provider: any): void {
    this.getContainer().register(token, provider);
  }

  /**
   * 注册单例服务到容器
   */
  protected registerSingleton<T>(token: any, provider: any): void {
    this.getContainer().registerSingleton(token, provider);
  }

  /**
   * 解析服务
   */
  protected resolve<T>(token: any): T {
    return this.getContainer().resolve(token);
  }
} 