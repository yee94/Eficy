import 'reflect-metadata';
import { type ReactElement } from 'react';
import { DependencyContainer, container as tsyringeContainer } from 'tsyringe';
import type { IEficyConfig, IEficySchema, IExtendOptions } from '../interfaces';
import type EficyNode from '../models/EficyNode';
import EficyNodeStore from '../models/EficyNodeStore';
import RenderNodeTree from '../models/RenderNodeTree';
import ComponentRegistry from '../services/ComponentRegistry';
import ConfigService from '../services/ConfigService';

export default class Eficy {
  private configService: ConfigService;
  private componentRegistry: ComponentRegistry;
  private eficyNodeStore: EficyNodeStore | null = null;
  private renderNodeTree: RenderNodeTree | null = null;
  private container: DependencyContainer;

  constructor() {
    // 初始化依赖注入容器
    this.setupContainer();

    // 获取服务实例
    this.configService = this.container.resolve(ConfigService);
    this.componentRegistry = this.container.resolve(ComponentRegistry);
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
  private buildRenderNodeTree(eficyNodeStore: EficyNodeStore): RenderNodeTree {
    // 使用 tsyringe 获取 RenderNodeTree 实例
    const renderNodeTree = this.container.resolve(RenderNodeTree);
    const rootNode = eficyNodeStore.root;

    if (rootNode) {
      renderNodeTree.createElement(rootNode);
    }

    return renderNodeTree;
  }

  /**
   * 根据Schema创建React元素 (保持原有API)
   */
  createElement(schema: IEficySchema): ReactElement | null {
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

    this.renderNodeTree = this.buildRenderNodeTree(this.eficyNodeStore);

    return this.renderNodeTree.rootRenderNode;
  }

  /**
   * 兼容性方法：根据Schema创建React元素（保持原有方法名）
   */
  createElementFromSchema(schema: IEficySchema): ReactElement | null {
    return this.createElement(schema);
  }

  /**
   * 渲染Schema到DOM节点 (保持原有API)
   */
  render(schema: IEficySchema, container: string | HTMLElement): void {
    import('react-dom/client').then(({ createRoot }) => {
      const element = this.createElement(schema);
      const containerElement = typeof container === 'string' ? document.querySelector(container) : container;

      if (!containerElement) {
        throw new Error(`Container element not found: ${container}`);
      }

      const root = createRoot(containerElement);
      root.render(element);
    });
  }

  /**
   * 兼容性方法：渲染Schema到DOM节点（保持原有方法名）
   */
  renderSchema(schema: IEficySchema, container: string | HTMLElement): void {
    this.render(schema, container);
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
   * 获取统计信息
   */
  get stats() {
    return {
      nodeTree: this.eficyNodeStore?.stats || null,
      renderTree: this.renderNodeTree?.stats || null,
    };
  }
}
