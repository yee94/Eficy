import { injectable } from 'tsyringe'
import { observable, computed, action, ObservableClass } from '@eficy/reactive'
import EficyNode from './EficyNode'
import type { IViewData } from '../interfaces'

@injectable()
export default class EficyNodeTree extends ObservableClass {
  @observable
  private rootNode: EficyNode | null = null

  private nodeMap: Record<string, EficyNode> = {}
  private rootData: IViewData | null = null

  /**
   * 构建完整的EficyNode树 - 由内向外递归构建
   */
  @action
  build(views: IViewData | IViewData[]): void {
    // 处理单个view或多个views的情况
    if (Array.isArray(views)) {
      // 如果是数组，创建一个根容器
      this.rootData = {
        '#': 'root',
        '#view': 'div',
        '#children': views
      }
    } else {
      this.rootData = views
    }

    // 清空现有数据
    this.nodeMap = {}
    
    // 由内向外递归构建EficyNode树
    this.rootNode = this.buildNodeRecursively(this.rootData)
  }

  /**
   * 递归构建EficyNode - 由内向外的方式
   */
  private buildNodeRecursively(viewData: IViewData): EficyNode {
    // 首先创建当前节点（不包含子节点）
    const { '#children': _, ...nodeData } = viewData // 先移除子节点，稍后处理
    
    const node = new EficyNode(nodeData)
    
    // 将节点添加到映射表
    if (node['#']) {
      this.nodeMap[node['#']] = node
    }
    
    // 处理子节点 - 递归构建
    if (viewData['#children'] && Array.isArray(viewData['#children'])) {
      const children = viewData['#children'].map((childData) => {
        return this.buildNodeRecursively(childData)
      })
      
      // 设置子节点
      node.setChildren(children)
    }
    
    return node
  }

  /**
   * 获取根节点
   */
  @computed
  get root(): EficyNode | null {
    return this.rootNode
  }

  /**
   * 获取所有节点映射
   */
  @computed
  get nodes(): Record<string, EficyNode> {
    return this.nodeMap
  }

  /**
   * 根据ID查找节点
   */
  findNode(nodeId: string): EficyNode | null {
    return this.nodeMap[nodeId] || null
  }

  /**
   * 更新节点数据
   */
  @action
  updateNode(nodeId: string, data: Partial<IViewData>): void {
    const node = this.findNode(nodeId)
    if (!node) {
      console.error('❌ Node not found:', nodeId)
      return
    }

    // 更新节点数据
    Object.keys(data).forEach(key => {
      if (key !== '#children') { // 子节点更新需要特殊处理
        node.updateField(key, data[key])
      }
    })

    // 处理子节点更新
    if (data['#children']) {
      const newChildren = data['#children'].map(childData => 
        this.buildNodeRecursively(childData)
      )
      node.setChildren(newChildren)
    }
  }

  /**
   * 添加子节点
   */
  @action
  addChild(parentId: string, childData: IViewData): EficyNode | null {
    const parent = this.findNode(parentId)
    if (!parent) {
      console.error('❌ Parent node not found:', parentId)
      return null
    }

    const child = this.buildNodeRecursively(childData)
    parent.addChild(child)
    
    return child
  }

  /**
   * 移除子节点
   */
  @action
  removeChild(parentId: string, childId: string): void {
    const parent = this.findNode(parentId)
    if (!parent) {
      console.error('❌ Parent node not found:', parentId)
      return
    }

    parent.removeChild(childId)
    
    // 从节点映射中移除
    if (this.nodeMap[childId]) {
      delete this.nodeMap[childId]
    }
  }

  /**
   * 重建整个树
   */
  @action
  rebuild(): void {
    if (this.rootData) {
      this.build(this.rootData)
    }
  }

  /**
   * 清空树
   */
  @action
  clear(): void {
    this.rootNode = null
    this.nodeMap = {}
    this.rootData = null
  }

  /**
   * 获取树的统计信息
   */
  @computed
  get stats() {
    return {
      totalNodes: Object.keys(this.nodeMap).length,
      rootNodeId: this.rootNode?.['#'] || null,
      hasRoot: !!this.rootNode
    }
  }

  /**
   * 序列化整个树为JSON
   */
  toJSON(): IViewData | null {
    return this.rootNode?.toJSON() || null
  }

  /**
   * 从JSON构建树
   */
  static fromJSON(data: IViewData | IViewData[]): EficyNodeTree {
    const tree = new EficyNodeTree()
    tree.build(data)
    return tree
  }
}