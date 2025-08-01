import 'reflect-metadata';
import { Computed, makeObservable } from '@eficy/reactive';
import React, { type ReactElement } from 'react';
import { DependencyContainer, container as tsyringeContainer } from 'tsyringe';
import type { IEficyConfig, IEficySchema, IExtendOptions } from '../interfaces';
import { HookType, type ILifecyclePlugin } from '../interfaces/lifecycle';
import type EficyNode from '../models/EficyNode';
import EficyModelTree from '../models/EficyModelTree';
import DomTree from '../models/DomTree';
import ComponentRegistry from '../services/ComponentRegistry';
import ConfigService from '../services/ConfigService';
import { PluginManager } from '../services/PluginManager';
import { LifecycleEventEmitter } from '../services/LifecycleEventEmitter';
import { EficyProvider } from '../contexts/EficyContext';
import type { IEficyContextValue } from '../contexts/EficyContext';
import { generateUid } from '../utils';
import once from '../utils/decorators/once';

export default class Eficy {
  private configService: ConfigService;
  private componentRegistry: ComponentRegistry;
  private models: EficyModelTree | null = null;
  private doms: DomTree | null = null;
  private container: DependencyContainer;
  private pluginManager: PluginManager;
  private lifecycleEventEmitter: LifecycleEventEmitter;

  constructor() {
    // 初始化依赖注入容器
    this.setupContainer();

    // 获取服务实例
    this.configService = this.container.resolve(ConfigService);
    this.componentRegistry = this.container.resolve(ComponentRegistry);
    this.pluginManager = this.container.resolve(PluginManager);
    this.lifecycleEventEmitter = this.container.resolve(LifecycleEventEmitter);
    makeObservable(this);
  }

  private setupContainer(): void {
    const container = tsyringeContainer.createChildContainer();
    this.container = container;
    // 注册服务到容器
    if (!container.isRegistered(ConfigService)) {
      container.registerSingleton(ConfigService);
    }
    if (!container.isRegistered(ComponentRegistry)) {
      container.registerSingleton(ComponentRegistry);
    }
    if (!container.isRegistered(EficyModelTree)) {
      container.registerSingleton(EficyModelTree);
    }
    if (!container.isRegistered(DomTree)) {
      container.registerSingleton(DomTree);
    }
    if (!container.isRegistered(PluginManager)) {
      container.registerSingleton(PluginManager);
    }
    if (!container.isRegistered(LifecycleEventEmitter)) {
      container.registerSingleton(LifecycleEventEmitter);
    }
  }

  /**
   * 配置Eficy实例
   */
  config(options: IEficyConfig): this {
    this.configService.set('config', options);

    if (options.componentMap) {
      this.componentRegistry.extend(options.componentMap);
    }

    return this;
  }

  /**
   * 扩展已有配置
   */
  extend(options: IExtendOptions): this {
    this.configService.extend(options);

    if (options.componentMap) {
      this.componentRegistry.extend(options.componentMap);
    }

    return this;
  }

  /**
   * 将 IEficySchema 转换为 EficyModelTree
   */
  private async schemaToNodeTree(schema: IEficySchema): Promise<EficyModelTree> {
    if (!schema || !schema.views) {
      throw new Error('Schema must have views property');
    }

    // 使用 tsyringe 获取 EficyModelTree 实例
    const nodeTree = this.container.resolve(EficyModelTree);
    await nodeTree.build(schema.views);

    return nodeTree;
  }

  /**
   * 构建 DomTree
   */
  private async buildRenderNodeTree(eficyModelTree: EficyModelTree): Promise<DomTree> {
    // 使用 tsyringe 获取 DomTree 实例
    const domTree = this.container.resolve(DomTree);
    const rootNode = eficyModelTree.root;

    if (rootNode) {
      await domTree.createElement(rootNode);
    }

    return domTree;
  }

  /**
   * 根据Schema创建React元素 (保持原有API)
   */
  async createElement(schema: IEficySchema): Promise<ReactElement | null> {
    await this.init();

    if (!schema) {
      throw new Error('Schema cannot be null or undefined');
    }

    if (!schema.views) {
      throw new Error('Schema must have views property');
    }

    if (schema.views.length === 0) {
      return null;
    }

    // 将 Schema 转换为 NodeTree
    this.models = await this.schemaToNodeTree(schema);

    this.doms = await this.buildRenderNodeTree(this.models);

    // 包装在 EficyProvider 中
    const contextValue: IEficyContextValue = {
      lifecycleEventEmitter: this.lifecycleEventEmitter,
      pluginManager: this.pluginManager,
      componentRegistry: this.componentRegistry,
    };

    return React.createElement(EficyProvider, { value: contextValue }, this.doms.rootRenderNode);
  }

  /**
   * 兼容性方法：根据Schema创建React元素（保持原有方法名）
   */
  async createElementFromSchema(schema: IEficySchema): Promise<ReactElement | null> {
    return await this.createElement(schema);
  }

  /**
   * 渲染Schema到DOM节点 (保持原有API)
   */
  async render(schema: IEficySchema, container: string | HTMLElement): Promise<void> {
    const { createRoot } = await import('react-dom/client');
    const element = await this.createElement(schema);
    const containerElement = typeof container === 'string' ? document.querySelector(container) : container;

    if (!containerElement) {
      throw new Error(`Container element not found: ${container}`);
    }

    const root = createRoot(containerElement);
    root.render(element);
  }

  /**
   * 兼容性方法：渲染Schema到DOM节点（保持原有方法名）
   */
  async renderSchema(schema: IEficySchema, container: string | HTMLElement): Promise<void> {
    await this.render(schema, container);
  }

  /**
   * 根据Schema获取内部的NodeTree (新增方法，用于高级用法)
   */
  async getNodeTree(schema: IEficySchema): Promise<EficyModelTree> {
    const nodeTree = await this.schemaToNodeTree(schema);
    this.models = nodeTree;
    return nodeTree;
  }

  /**
   * 获取当前的 EficyModelTree
   */
  get nodeTree(): EficyModelTree | null {
    return this.models;
  }

  /**
   * 获取当前的 DomTree
   */
  get renderTree(): DomTree | null {
    return this.doms;
  }

  /**
   * 根据Schema获取特定节点 (新增方法，用于操作节点)
   */
  async getNode(schema: IEficySchema, nodeId: string): Promise<EficyNode | null> {
    const nodeTree = await this.schemaToNodeTree(schema);
    return nodeTree.findNode(nodeId);
  }

  /**
   * 从当前树中查找节点
   */
  findNode(nodeId: string): EficyNode | null {
    if (!this.models) {
      return null;
    }
    return this.models.findNode(nodeId);
  }

  /**
   * 从当前 DomTree 中查找 RenderNode
   */
  findRenderNode(nodeId: string): ReactElement | null {
    if (!this.doms) {
      return null;
    }
    return this.doms.findRenderNode(nodeId);
  }

  /**
   * 更新节点并同步更新 RenderNode
   */
  updateNode(nodeId: string, data: any): void {
    if (this.models) {
      this.models.updateNode(nodeId, data);

      // 同步更新 RenderNode
      if (this.doms) {
        const updatedNode = this.models.findNode(nodeId);
        if (updatedNode) {
          this.doms.updateRenderNode(nodeId, updatedNode);
        }
      }
    }
  }

  /**
   * 添加子节点并同步更新 RenderNode
   */
  addChild(parentId: string, childData: any): EficyNode | null {
    if (!this.models) {
      return null;
    }

    const newNode = this.models.addChild(parentId, childData);

    // 同步添加 RenderNode
    if (newNode && this.doms) {
      this.doms.addRenderNode(newNode);
    }

    return newNode;
  }

  /**
   * 移除子节点并同步清理 RenderNode
   */
  removeChild(parentId: string, childId: string): void {
    if (this.models) {
      this.models.removeChild(parentId, childId);

      // 同步移除 RenderNode
      if (this.doms) {
        this.doms.removeRenderNode(childId);
      }
    }
  }

  /**
   * 清空所有树
   */
  clear(): void {
    if (this.models) {
      this.models.clear();
    }
    if (this.doms) {
      this.doms.clear();
    }
    this.models = null;
    this.doms = null;
  }

  /**
   * 注册插件
   */
  registerPlugin(plugin: ILifecyclePlugin): void {
    this.pluginManager.register(plugin);
  }

  /**
   * 卸载插件
   */
  unregisterPlugin(pluginName: string): void {
    this.pluginManager.unregister(pluginName);
  }

  /**
   * 获取插件管理器
   */
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  /**
   * 获取生命周期事件发射器
   */
  getLifecycleEventEmitter(): LifecycleEventEmitter {
    return this.lifecycleEventEmitter;
  }

  @once()
  async init(): Promise<void> {
    await this.pluginManager.executeHook(HookType.INIT, this, {
      config: this.configService.get('config'),
      componentMap: this.componentRegistry.getAll(),
      eficy: this,
    });
  }

  /**
   * 获取统计信息
   */
  @Computed
  get stats() {
    return {
      nodeTree: this.models?.stats || null,
      renderTree: this.doms?.stats || null,
      plugins: this.pluginManager.getHookStats(),
      lifecycleEvents: this.lifecycleEventEmitter.getStatistics(),
    };
  }

}
