import { action, computed, makeObservable, observable } from '@eficy/reactive';
import { inject, injectable } from 'tsyringe';
import type { IViewData } from '../interfaces';
import type { IBuildSchemaNodeContext, IProcessPropsContext } from '../interfaces/lifecycle';
import { HookType } from '../interfaces/lifecycle';
import { PluginManager } from '../services/PluginManager';
import EficyNode from './EficyNode';

/**
 * Eficy Node 节点平铺 Store
 */
@injectable()
export default class EficyModelTree {
  @observable
  private rootNode: EficyNode;

  private pluginManager: PluginManager;

  @computed
  get nodeMap(): Record<string, EficyNode> {
    const nodeMap = {
      [this.rootNode.id]: this.rootNode,
    };
    this.rootNode.each((node) => {
      nodeMap[node.id] = node;
    });
    return nodeMap;
  }

  private rootData: IViewData | null = null;

  /**
   * 构建完整的EficyNode树 - 由内向外递归构建
   */
  @action
  async build(views: IViewData | IViewData[]): Promise<void> {
    // 由内向外递归构建EficyNode树，使用生命周期钩子
    const viewsArray = Array.isArray(views) ? views : [views];

    this.rootNode = await this.buildNodeWithHooks(
      {
        '#': '__eficy_root',
        '#view': '<>',
        '#children': viewsArray,
      },
      {
        parent: null,
        path: [],
      },
    );
  }

  /**
   * 使用钩子构建单个节点
   */
  private async buildNodeWithHooks(
    viewData: IViewData,
    { parent, path }: { parent?: EficyNode; path?: string[] },
  ): Promise<EficyNode> {
    const context: IBuildSchemaNodeContext = {
      parent,
      path: path || [],
    };

    return await this.pluginManager.executeHook(HookType.BUILD_SCHEMA_NODE, viewData, context, async () => {
      const { '#children': children, ...rest } = viewData;
      const node = new EficyNode(rest);

      const processedProps = await this.pluginManager.executeHook(
        HookType.PROCESS_PROPS,
        node.props,
        {
          eficyNode: node,
          originalProps: { ...node.props },
        } as IProcessPropsContext,
        async () => node.props,
      );
      
      // 更新动态属性，确保插件对 props 的修改生效
      node.dynamicProps = { ...processedProps };

      // 递归构建子节点
      if (children && Array.isArray(children)) {
        const childNodes = await Promise.all(
          children.map((childData) => this.buildNodeWithHooks(childData, { parent: node, path: [...path, node.id] })),
        );
        node.setChildren(childNodes);
      }

      return node;
    });
  }

  /**
   * 获取根节点
   */
  @computed
  get root(): EficyNode | null {
    return this.rootNode;
  }

  /**
   * 获取所有节点映射
   */
  @computed
  get nodes(): Record<string, EficyNode> {
    return this.nodeMap;
  }

  /**
   * 根据ID查找节点
   */
  findNode(nodeId: string): EficyNode | null {
    return this.nodeMap[nodeId] || null;
  }

  /**
   * 更新节点数据
   */
  @action
  updateNode(nodeId: string, data: Partial<IViewData>): void {
    const node = this.findNode(nodeId);
    if (!node) {
      console.error('❌ Node not found:', nodeId);
      return;
    }

    // 更新节点数据
    Object.keys(data).forEach((key) => {
      if (key !== '#children') {
        // 子节点更新需要特殊处理
        node.updateField(key, data[key]);
      }
    });

    // 处理子节点更新
    if (data['#children']) {
      const newChildren = data['#children'].map((childData) => new EficyNode(childData));
      node.setChildren(newChildren);
    }
  }

  /**
   * 添加子节点
   */
  @action
  addChild(parentId: string, childData: IViewData): EficyNode | null {
    const parent = this.findNode(parentId);
    if (!parent) {
      console.error('❌ Parent node not found:', parentId);
      return null;
    }

    const child = new EficyNode(childData);
    parent.addChild(child);

    return child;
  }

  /**
   * 移除子节点
   */
  @action
  removeChild(parentId: string, childId: string): void {
    const parent = this.findNode(parentId);
    if (!parent) {
      console.error('❌ Parent node not found:', parentId);
      return;
    }

    parent.removeChild(childId);

    // 从节点映射中移除
    if (this.nodeMap[childId]) {
      delete this.nodeMap[childId];
    }
  }

  /**
   * 重建整个树
   */
  @action
  rebuild(): void {
    if (this.rootData) {
      this.build(this.rootData);
    }
  }

  /**
   * 清空树
   */
  @action
  clear(): void {
    this.rootNode = null;
    this.rootData = null;
  }

  /**
   * 获取树的统计信息
   */
  @computed
  get stats() {
    return {
      totalNodes: Object.keys(this.nodeMap).length,
      rootNodeId: this.rootNode?.id || null,
    };
  }

  /**
   * 序列化整个树为JSON
   */
  toJSON(): IViewData | null {
    return this.rootNode?.toJSON() || null;
  }

  /**
   * 从JSON构建树
   */
  static fromJSON(data: IViewData | IViewData[], pluginManager: PluginManager): EficyModelTree {
    const tree = new EficyModelTree(pluginManager);
    tree.build(data);
    return tree;
  }

  constructor(@inject(PluginManager) pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
    makeObservable(this);
  }
}
