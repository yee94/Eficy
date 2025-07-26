import { injectable } from 'tsyringe';
import { observable, computed, action, ObservableClass, makeObservable } from '@eficy/reactive';
import EficyNode from './EficyNode';
import type { IViewData } from '../interfaces';

/**
 * Eficy Node 节点平铺 Store
 */
@injectable()
export default class EficyNodeStore {
  @observable
  private rootNode: EficyNode;

  private nodeMap: Record<string, EficyNode> = {};
  private rootData: IViewData | null = null;

  /**
   * 构建完整的EficyNode树 - 由内向外递归构建
   */
  @action
  build(views: IViewData | IViewData[]): void {
    // 清空现有数据
    this.nodeMap = {};

    // 由内向外递归构建EficyNode树
    this.rootNode = new EficyNode({
      '#': '__eficy_root',
      '#view': '<>',
      '#children': Array.isArray(views) ? views : [views],
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
    this.nodeMap = {};
    this.rootData = null;
  }

  /**
   * 获取树的统计信息
   */
  @computed
  get stats() {
    return {
      totalNodes: Object.keys(this.nodeMap).length,
      rootNodeId: this.rootNode?.['#'] || null,
      hasRoot: !!this.rootNode,
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
  static fromJSON(data: IViewData | IViewData[]): EficyNodeStore {
    const tree = new EficyNodeStore();
    tree.build(data);
    return tree;
  }

  constructor() {
    makeObservable(this);
  }
}
