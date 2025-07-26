import { injectable, inject } from 'tsyringe'
import { observable, computed, action, ObservableClass } from '@eficy/reactive'
import React, { type ReactElement } from 'react'
import type { IComponentMap } from '../interfaces'
import EficyNode from './EficyNode'
import ComponentRegistry from '../services/ComponentRegistry'

/**
 * RenderNode 树管理器
 * 专门处理 React 元素的构建和映射，与 EficyNodeTree 解耦
 */
@injectable()
export default class RenderNodeTree extends ObservableClass {
  @observable
  private renderNodeCache: Map<string, ReactElement> = new Map()

  @observable
  private renderNodeComponentRef: any = null

  constructor(
    @inject(ComponentRegistry) private componentRegistry: ComponentRegistry
  ) {
    super()
  }

  /**
   * 从内向外构建所有RenderNode的映射关系
   * 基于现有的 EficyNodeTree 构建 RenderNode 映射
   */
  @action
  buildFromEficyNode(rootNode: EficyNode, RenderNodeComponent: any): void {
    this.renderNodeComponentRef = RenderNodeComponent
    
    // 清空现有缓存
    this.renderNodeCache.clear()
    
    if (rootNode) {
      // 从内向外递归构建RenderNode映射
      this.buildRenderNodeRecursively(rootNode)
    }
  }

  /**
   * 递归构建RenderNode映射 - 从内向外的方式
   */
  private buildRenderNodeRecursively(eficyNode: EficyNode): ReactElement {
    const nodeId = eficyNode['#']
    
    // 如果已经有缓存，直接返回
    if (nodeId && this.renderNodeCache.has(nodeId)) {
      return this.renderNodeCache.get(nodeId)!
    }

    // 首先处理子节点 - 从内向外
    const children = eficyNode.props.children
    if (Array.isArray(children) && children.length > 0 && children[0] instanceof EficyNode) {
      // 递归构建子节点的RenderNode
      children.forEach((child: EficyNode) => {
        this.buildRenderNodeRecursively(child)
      })
    }

    // 然后创建当前节点的RenderNode
    const renderNode = this.createRenderNode(eficyNode)
    
    // 将RenderNode添加到缓存映射
    if (nodeId) {
      this.renderNodeCache.set(nodeId, renderNode)
    }
    
    return renderNode
  }

  /**
   * 为单个EficyNode创建RenderNode的工厂方法
   */
  createRenderNode(eficyNode: EficyNode): ReactElement {
    // 从注入的 ComponentRegistry 获取组件映射
    const componentMap = this.componentRegistry.getAll()
    
    if (!this.renderNodeComponentRef) {
      throw new Error('RenderNodeComponent is required for creating RenderNode')
    }
    
    return React.createElement(this.renderNodeComponentRef, {
      key: eficyNode['#'] || eficyNode.id,
      eficyNode,
      componentMap
    })
  }

  /**
   * 获取根RenderNode
   */
  @computed
  get rootRenderNode(): ReactElement | null {
    // 根据缓存中的第一个节点作为根节点
    const firstEntry = this.renderNodeCache.entries().next()
    return firstEntry.done ? null : firstEntry.value[1]
  }

  /**
   * 通过nodeId查找RenderNode
   */
  findRenderNode(nodeId: string): ReactElement | null {
    return this.renderNodeCache.get(nodeId) || null
  }

  /**
   * 获取所有RenderNode映射
   */
  @computed
  get renderNodes(): Record<string, ReactElement> {
    const result: Record<string, ReactElement> = {}
    this.renderNodeCache.forEach((renderNode, nodeId) => {
      result[nodeId] = renderNode
    })
    return result
  }

  /**
   * 更新特定节点的RenderNode
   */
  @action
  updateRenderNode(nodeId: string, eficyNode: EficyNode): void {
    if (this.renderNodeComponentRef) {
      // 移除旧的缓存
      this.renderNodeCache.delete(nodeId)
      // 重新构建RenderNode
      this.buildRenderNodeRecursively(eficyNode)
    }
  }

  /**
   * 添加新的RenderNode
   */
  @action
  addRenderNode(eficyNode: EficyNode): ReactElement | null {
    if (!this.renderNodeComponentRef) {
      return null
    }
    
    return this.buildRenderNodeRecursively(eficyNode)
  }

  /**
   * 移除RenderNode
   */
  @action
  removeRenderNode(nodeId: string): void {
    this.renderNodeCache.delete(nodeId)
  }

  /**
   * 清空所有RenderNode缓存
   */
  @action
  clear(): void {
    this.renderNodeCache.clear()
    this.renderNodeComponentRef = null
  }

  /**
   * 获取统计信息
   */
  @computed
  get stats() {
    return {
      totalRenderNodes: this.renderNodeCache.size,
      hasComponentMap: true, // 总是有，因为从 ComponentRegistry 注入
      hasRenderNodeComponent: !!this.renderNodeComponentRef
    }
  }
} 