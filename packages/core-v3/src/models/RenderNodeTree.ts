import { action, batch, computed, effect, makeObservable, observable } from '@eficy/reactive';
import { createElement, type ReactElement, type ReactNode } from 'react';
import { inject, injectable } from 'tsyringe';
import RenderNode from '../components/RenderNode';
import ComponentRegistry from '../services/ComponentRegistry';
import EficyNode from './EficyNode';
import xorBy from 'lodash/xorBy';

/**
 * RenderNode 树管理器
 * 专门处理 React 元素的构建和映射，与 EficyNodeStore 解耦
 */
@injectable()
export default class RenderNodeTree {
  @observable
  private renderNodeCache: Map<string, ReactElement> = new Map();
  private previousChildren: Map<string, ReactElement[]> = new Map();

  constructor(@inject(ComponentRegistry) private componentRegistry: ComponentRegistry) {
    makeObservable(this);
  }

  /**
   * 从内向外构建所有RenderNode的映射关系
   * 基于现有的 EficyNodeStore 构建 RenderNode 映射
   */
  @action
  public createElement(eficyNode: EficyNode): ReactElement | null {
    if (!eficyNode) {
      return null;
    }

    // 从内向外递归构建RenderNode映射
    const doBuild = (eficyNode: EficyNode) => {
      const nodeId = eficyNode['#'];

      // 如果已经有缓存，直接返回
      if (nodeId && this.renderNodeCache.has(nodeId)) {
        return this.renderNodeCache.get(nodeId)!;
      }

      effect(() => {
        if (!eficyNode.children) {
          return;
        }
        if (!Array.isArray(eficyNode.children) || !(eficyNode.children[0] instanceof EficyNode)) {
          return eficyNode.children;
        }

        batch(() => {
          const currentChildren = this.previousChildren.get(nodeId) ?? [];
          const nextNodes = eficyNode.children as EficyNode[];
          const nextKeys = new Set(nextNodes.map((child) => child.id));

          // 移除已经不存在的子节点
          const removedChildren = currentChildren.filter((child) => !nextKeys.has(child.key));
          removedChildren.forEach((child) => {
            this.renderNodeCache.delete(child.key as string);
          });

          const nextChildren = nextNodes.map((child: EficyNode) => doBuild(child)) as ReactElement[];
          this.previousChildren.set(nodeId, nextChildren);
        });
      });

      const renderNode = this.createRenderNode(eficyNode);
      if (nodeId) {
        this.renderNodeCache.set(nodeId, renderNode);
      }

      return renderNode;
    };

    return doBuild(eficyNode);
  }

  /**
   * 为单个EficyNode创建RenderNode的工厂方法
   */
  private createRenderNode(eficyNode: EficyNode): ReactElement {
    // 从注入的 ComponentRegistry 获取组件映射
    const componentMap = this.componentRegistry.getAll();

    return createElement(RenderNode, {
      key: eficyNode.id,
      eficyNode,
      componentMap,
      childrenMap: this.renderNodeCache,
    });
  }

  /**
   * 获取根RenderNode
   */
  @computed
  get rootRenderNode(): ReactElement | null {
    // 根据缓存中的第一个节点作为根节点
    const firstEntry = this.renderNodeCache.entries().next();
    return firstEntry.done ? null : firstEntry.value[1];
  }

  /**
   * 通过nodeId查找RenderNode
   */
  findRenderNode(nodeId: string): ReactElement | null {
    return this.renderNodeCache.get(nodeId) || null;
  }

  /**
   * 获取所有RenderNode映射
   */
  @computed
  get renderNodes(): Record<string, ReactElement> {
    const result: Record<string, ReactElement> = {};
    this.renderNodeCache.forEach((renderNode, nodeId) => {
      result[nodeId] = renderNode;
    });
    return result;
  }

  /**
   * 更新特定节点的RenderNode
   */
  @action
  updateRenderNode(nodeId: string, eficyNode: EficyNode): void {
    // 移除旧的缓存
    this.renderNodeCache.delete(nodeId);
    // 重新构建RenderNode
    this.createElement(eficyNode);
  }

  /**
   * 添加新的RenderNode
   */
  @action
  addRenderNode(eficyNode: EficyNode): ReactElement | null {
    return this.createElement(eficyNode);
  }

  /**
   * 移除RenderNode
   */
  @action
  removeRenderNode(nodeId: string): void {
    this.renderNodeCache.delete(nodeId);
  }

  /**
   * 清空所有RenderNode缓存
   */
  @action
  clear(): void {
    this.renderNodeCache.clear();
  }

  /**
   * 获取统计信息
   */
  @computed
  get stats() {
    return {
      totalRenderNodes: this.renderNodeCache.size,
    };
  }
}
