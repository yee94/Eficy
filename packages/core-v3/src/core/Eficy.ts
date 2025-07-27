import { computed, makeObservable } from '@eficy/reactive';
import 'reflect-metadata';
import React, { type ReactElement } from 'react';
import { DependencyContainer, container as tsyringeContainer } from 'tsyringe';
import type { IEficyConfig, IEficySchema, IExtendOptions } from '../interfaces';
import type { ILifecyclePlugin } from '../interfaces/lifecycle';
import type EficyNode from '../models/EficyNode';
import EficyNodeStore from '../models/EficyNodeStore';
import RenderNodeTree from '../models/RenderNodeTree';
import ComponentRegistry from '../services/ComponentRegistry';
import ConfigService from '../services/ConfigService';
import { PluginManager } from '../services/PluginManager';
import { LifecycleEventEmitter } from '../services/LifecycleEventEmitter';
import { EficyProvider } from '../contexts/EficyContext';
import type { IEficyContextValue } from '../contexts/EficyContext';

export default class Eficy {
  private configService: ConfigService;
  private componentRegistry: ComponentRegistry;
  private eficyNodeStore: EficyNodeStore | null = null;
  private renderNodeTree: RenderNodeTree | null = null;
  private container: DependencyContainer;
  private pluginManager: PluginManager;
  private lifecycleEventEmitter: LifecycleEventEmitter;
  private enableLifecycleHooks: boolean = false;

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
    if (!container.isRegistered(EficyNodeStore)) {
      container.registerSingleton(EficyNodeStore);
    }
    if (!container.isRegistered(RenderNodeTree)) {
      container.registerSingleton(RenderNodeTree);
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
   * 将 IEficySchema 转换为 EficyNodeStore
   */
  private schemaToNodeTree(schema: IEficySchema): EficyNodeStore {
    if (!schema || !schema.views) {
      throw new Error('Schema must have views property');
    }

    // 使用 tsyringe 获取 EficyNodeStore 实例
    const nodeTree = this.container.resolve(EficyNodeStore);
    nodeTree.build(schema.views);

    return nodeTree;
  }

  /**
   * 构建 RenderNodeTree
   */
  private async buildRenderNodeTree(eficyNodeStore: EficyNodeStore): Promise<RenderNodeTree> {
    // 使用 tsyringe 获取 RenderNodeTree 实例
    const renderNodeTree = this.container.resolve(RenderNodeTree);
    const rootNode = eficyNodeStore.root;

    if (rootNode) {
      await renderNodeTree.createElement(rootNode);
    }

    return renderNodeTree;
  }

  /**
   * 根据Schema创建React元素 (保持原有API)
   */
  async createElement(schema: IEficySchema): Promise<ReactElement | null> {
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
    this.eficyNodeStore = this.schemaToNodeTree(schema);

    this.renderNodeTree = await this.buildRenderNodeTree(this.eficyNodeStore);

    // 包装在 EficyProvider 中
    const contextValue: IEficyContextValue = {
      lifecycleEventEmitter: this.lifecycleEventEmitter,
      pluginManager: this.pluginManager,
      componentRegistry: this.componentRegistry
    };

    return React.createElement(EficyProvider, { value: contextValue }, this.renderNodeTree.rootRenderNode);
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
  getNodeTree(schema: IEficySchema): EficyNodeStore {
    const nodeTree = this.schemaToNodeTree(schema);
    this.eficyNodeStore = nodeTree;
    return nodeTree;
  }

  /**
   * 获取当前的 EficyNodeStore
   */
  get nodeTree(): EficyNodeStore | null {
    return this.eficyNodeStore;
  }

  /**
   * 获取当前的 RenderNodeTree
   */
  get renderTree(): RenderNodeTree | null {
    return this.renderNodeTree;
  }

  /**
   * 根据Schema获取特定节点 (新增方法，用于操作节点)
   */
  getNode(schema: IEficySchema, nodeId: string): EficyNode | null {
    const nodeTree = this.schemaToNodeTree(schema);
    return nodeTree.findNode(nodeId);
  }

  /**
   * 从当前树中查找节点
   */
  findNode(nodeId: string): EficyNode | null {
    if (!this.eficyNodeStore) {
      return null;
    }
    return this.eficyNodeStore.findNode(nodeId);
  }

  /**
   * 从当前 RenderNodeTree 中查找 RenderNode
   */
  findRenderNode(nodeId: string): ReactElement | null {
    if (!this.renderNodeTree) {
      return null;
    }
    return this.renderNodeTree.findRenderNode(nodeId);
  }

  /**
   * 更新节点并同步更新 RenderNode
   */
  updateNode(nodeId: string, data: any): void {
    if (this.eficyNodeStore) {
      this.eficyNodeStore.updateNode(nodeId, data);

      // 同步更新 RenderNode
      if (this.renderNodeTree) {
        const updatedNode = this.eficyNodeStore.findNode(nodeId);
        if (updatedNode) {
          this.renderNodeTree.updateRenderNode(nodeId, updatedNode);
        }
      }
    }
  }

  /**
   * 添加子节点并同步更新 RenderNode
   */
  addChild(parentId: string, childData: any): EficyNode | null {
    if (!this.eficyNodeStore) {
      return null;
    }

    const newNode = this.eficyNodeStore.addChild(parentId, childData);

    // 同步添加 RenderNode
    if (newNode && this.renderNodeTree) {
      this.renderNodeTree.addRenderNode(newNode);
    }

    return newNode;
  }

  /**
   * 移除子节点并同步清理 RenderNode
   */
  removeChild(parentId: string, childId: string): void {
    if (this.eficyNodeStore) {
      this.eficyNodeStore.removeChild(parentId, childId);

      // 同步移除 RenderNode
      if (this.renderNodeTree) {
        this.renderNodeTree.removeRenderNode(childId);
      }
    }
  }

  /**
   * 清空所有树
   */
  clear(): void {
    if (this.eficyNodeStore) {
      this.eficyNodeStore.clear();
    }
    if (this.renderNodeTree) {
      this.renderNodeTree.clear();
    }
    this.eficyNodeStore = null;
    this.renderNodeTree = null;
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

  /**
   * 启用生命周期钩子
   */
  enableLifecycleHooksFeature(): void {
    this.enableLifecycleHooks = true;
  }

  /**
   * 禁用生命周期钩子
   */
  disableLifecycleHooksFeature(): void {
    this.enableLifecycleHooks = false;
  }

  /**
   * 检查生命周期钩子是否启用
   */
  isLifecycleHooksEnabled(): boolean {
    return this.enableLifecycleHooks;
  }

  /**
   * 获取统计信息
   */
  @computed
  get stats() {
    return {
      nodeTree: this.eficyNodeStore?.stats || null,
      renderTree: this.renderNodeTree?.stats || null,
      plugins: this.pluginManager.getHookStats(),
      lifecycleEvents: this.lifecycleEventEmitter.getStatistics(),
      lifecycleHooksEnabled: this.enableLifecycleHooks,
    };
  }
}
