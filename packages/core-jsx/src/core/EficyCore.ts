/**
 * EficyCore - 核心管理类
 *
 * 基于 tsyringe 的依赖注入系统，管理组件注册、插件等
 */

import 'reflect-metadata';

import { ComponentType } from 'react';
import { container } from 'tsyringe';
import type { DependencyContainer } from 'tsyringe';
import { ComponentRegistry } from '../services/ComponentRegistry';
import { EventEmitter } from '../services/EventEmitter';
import { PluginManager } from '../services/PluginManager';

export class Eficy {
  private _container: DependencyContainer;
  private _componentRegistry: ComponentRegistry;
  private _pluginManager: PluginManager;
  private _eventEmitter: EventEmitter;

  constructor() {
    // 创建子容器
    this._container = container.createChildContainer();

    // 注册核心服务
    this.setupServices();

    // 获取服务实例
    this._componentRegistry = this._container.resolve(ComponentRegistry);
    this._pluginManager = this._container.resolve(PluginManager);
    this._eventEmitter = this._container.resolve(EventEmitter);
  }

  /**
   * 设置核心服务
   */
  private setupServices(): void {
    this._container.register('Container', {
      useFactory: () => this._container,
    });

    if (!this._container.isRegistered(PluginManager)) {
      this._container.registerSingleton(PluginManager);
    }

    if (!this._container.isRegistered(EventEmitter)) {
      this._container.registerSingleton(EventEmitter);
    }
  }

  /**
   * 创建子实例
   */
  createChild(): Eficy {
    const child = new Eficy();

    // 子实例可以访问父实例的组件注册表
    const parentComponents = this._componentRegistry.getAll();
    child._componentRegistry.registerBatch(parentComponents);

    return child;
  }

  /**
   * 注册组件
   */
  registerComponent(name: string, component: ComponentType<any>): this {
    this._componentRegistry.register(name, component);
    return this;
  }

  /**
   * 批量注册组件
   */
  registerComponents(components: Record<string, ComponentType<any>>): this {
    this._componentRegistry.registerBatch(components);
    return this;
  }

  /**
   * 获取组件
   */
  getComponent(name: string): ComponentType<any> | undefined {
    return this._componentRegistry.get(name);
  }

  /**
   * 获取所有组件
   */
  getAllComponents(): Record<string, ComponentType<any>> {
    return this._componentRegistry.getAll();
  }

  /**
   * 获取组件注册表
   */
  get componentRegistry(): ComponentRegistry {
    return this._componentRegistry;
  }

  /**
   * 获取插件管理器
   */
  get pluginManager(): PluginManager {
    return this._pluginManager;
  }

  /**
   * 获取事件发射器
   */
  get eventEmitter(): EventEmitter {
    return this._eventEmitter;
  }

  /**
   * 获取容器实例
   */
  get container(): DependencyContainer {
    return this._container;
  }

  /**
   * 解析依赖
   */
  resolve<T>(token: string | symbol | Function): T {
    return this._container.resolve<T>(token as any);
  }

  install: typeof PluginManager.prototype.register = (...args) => {
    return this._pluginManager.register(...args);
  };

  /**
   * 销毁实例
   */
  dispose(): void {
    // 清理事件监听器
    this._eventEmitter.removeAllListeners();

    // 清理插件
    this._pluginManager.dispose();

    // 清理组件注册表
    this._componentRegistry.clear();
  }
}
