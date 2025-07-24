import 'reflect-metadata';
import { container, injectable, inject, singleton } from 'tsyringe';
import type { DependencyContainer, InjectionToken } from 'tsyringe';

/**
 * Eficy依赖注入容器
 * 基于tsyringe实现，管理所有服务和插件的生命周期
 */
export class EficyContainer {
  private childContainers = new Map<string, DependencyContainer>();
  private rootContainer: DependencyContainer;

  constructor(rootContainer?: DependencyContainer) {
    this.rootContainer = rootContainer || container;
  }

  /**
   * 注册服务到容器
   */
  register<T>(token: InjectionToken<T>, provider: any): this {
    this.rootContainer.register(token, provider);
    return this;
  }

  /**
   * 注册单例服务
   */
  registerSingleton<T>(token: InjectionToken<T>, provider: any): this {
    this.rootContainer.registerSingleton(token, provider);
    return this;
  }

  /**
   * 注册实例
   */
  registerInstance<T>(token: InjectionToken<T>, instance: T): this {
    this.rootContainer.registerInstance(token, instance);
    return this;
  }

  /**
   * 解析服务
   */
  resolve<T>(token: InjectionToken<T>): T {
    return this.rootContainer.resolve(token);
  }

  /**
   * 创建子容器，用于隔离不同实例的服务
   */
  createChildContainer(name: string): DependencyContainer {
    const childContainer = this.rootContainer.createChildContainer();
    this.childContainers.set(name, childContainer);
    return childContainer;
  }

  /**
   * 获取子容器
   */
  getChildContainer(name: string): DependencyContainer | undefined {
    return this.childContainers.get(name);
  }

  /**
   * 清理子容器
   */
  clearChildContainer(name: string): boolean {
    const child = this.childContainers.get(name);
    if (child) {
      child.clearInstances();
      return this.childContainers.delete(name);
    }
    return false;
  }

  /**
   * 清理所有子容器
   */
  clearAll(): void {
    this.childContainers.forEach((child) => {
      child.clearInstances();
    });
    this.childContainers.clear();
    this.rootContainer.clearInstances();
  }

  /**
   * 检查服务是否已注册
   */
  isRegistered<T>(token: InjectionToken<T>): boolean {
    return this.rootContainer.isRegistered(token);
  }
}

// 导出全局容器实例
export const eficyContainer = new EficyContainer();

// 导出装饰器和tokens
export { injectable, inject, singleton };
export type { InjectionToken, DependencyContainer }; 