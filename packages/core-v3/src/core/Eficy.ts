import 'reflect-metadata'
import { container } from 'tsyringe'
import React, { type ReactElement } from 'react'
import type { IEficyConfig, IExtendOptions, IEficySchema } from '../interfaces'
import type EficyNode from '../models/EficyNode'
import EficyNodeTree from '../models/EficyNodeTree'
import RenderNodeTree from '../models/RenderNodeTree'
import RenderNode from '../components/RenderNode'
import ConfigService from '../services/ConfigService'
import ComponentRegistry from '../services/ComponentRegistry'

export default class Eficy {
  private configService: ConfigService
  private componentRegistry: ComponentRegistry
  private eficyNodeTree: EficyNodeTree | null = null
  private renderNodeTree: RenderNodeTree | null = null

  constructor() {
    // 初始化依赖注入容器
    this.setupContainer()
    
    // 获取服务实例
    this.configService = container.resolve(ConfigService)
    this.componentRegistry = container.resolve(ComponentRegistry)
  }

  private setupContainer(): void {
    // 注册服务到容器
    if (!container.isRegistered(ConfigService)) {
      container.registerSingleton(ConfigService)
    }
    if (!container.isRegistered(ComponentRegistry)) {
      container.registerSingleton(ComponentRegistry)
    }
    if (!container.isRegistered(EficyNodeTree)) {
      container.registerSingleton(EficyNodeTree)
    }
    if (!container.isRegistered(RenderNodeTree)) {
      container.registerSingleton(RenderNodeTree)
    }
  }

  /**
   * 配置Eficy实例
   */
  config(options: IEficyConfig): this {
    this.configService.set('config', options)
    
    if (options.componentMap) {
      this.componentRegistry.extend(options.componentMap)
    }
    
    return this
  }

  /**
   * 扩展已有配置
   */
  extend(options: IExtendOptions): this {
    this.configService.extend(options)
    
    if (options.componentMap) {
      this.componentRegistry.extend(options.componentMap)
    }
    
    return this
  }

  /**
   * 将 IEficySchema 转换为 EficyNodeTree
   */
  private schemaToNodeTree(schema: IEficySchema): EficyNodeTree {
    if (!schema || !schema.views) {
      throw new Error('Schema must have views property')
    }

    // 使用 tsyringe 获取 EficyNodeTree 实例
    const nodeTree = container.resolve(EficyNodeTree)
    nodeTree.build(schema.views)
    
    return nodeTree
  }

  /**
   * 构建 RenderNodeTree
   */
  private buildRenderNodeTree(eficyNodeTree: EficyNodeTree): RenderNodeTree {
    // 使用 tsyringe 获取 RenderNodeTree 实例
    const renderNodeTree = container.resolve(RenderNodeTree)
    const rootNode = eficyNodeTree.root
    
    if (rootNode) {
      renderNodeTree.buildFromEficyNode(rootNode, RenderNode)
    }
    
    return renderNodeTree
  }

  /**
   * 根据Schema创建React元素 (保持原有API)
   */
  createElement(schema: IEficySchema): ReactElement | null {
    if (!schema) {
      throw new Error('Schema cannot be null or undefined')
    }

    if (!schema.views) {
      throw new Error('Schema must have views property')
    }

    if (schema.views.length === 0) {
      return null
    }

    // 将 Schema 转换为 NodeTree
    this.eficyNodeTree = this.schemaToNodeTree(schema)
    this.renderNodeTree = this.buildRenderNodeTree(this.eficyNodeTree)
    
    const componentMap = this.componentRegistry.getAll()

    // 获取根节点
    const rootNode = this.eficyNodeTree.root
    if (!rootNode) {
      return null
    }

    // 如果根节点只有一个子节点且根节点是容器，直接渲染子节点
    if (rootNode['#view'] === 'div' && rootNode['#'] === 'root' && rootNode['#children'].length === 1) {
      const childNode = rootNode['#children'][0]
      return React.createElement(RenderNode, { 
        key: childNode['#'] || childNode.id,
        eficyNode: childNode, 
        componentMap 
      })
    }

    // 如果根节点有多个子节点，渲染所有子节点
    if (rootNode['#children'].length > 1) {
      const children = rootNode['#children'].map((childNode, index) => {
        return React.createElement(RenderNode, { 
          key: childNode['#'] || childNode.id || index, 
          eficyNode: childNode, 
          componentMap 
        })
      })
      return React.createElement(React.Fragment, null, ...children)
    }

    // 默认情况：渲染根节点本身
    return React.createElement(RenderNode, { 
      eficyNode: rootNode, 
      componentMap 
    })
  }

  /**
   * 兼容性方法：根据Schema创建React元素（保持原有方法名）
   */
  createElementFromSchema(schema: IEficySchema): ReactElement | null {
    return this.createElement(schema)
  }

  /**
   * 渲染Schema到DOM节点 (保持原有API)
   */
  render(schema: IEficySchema, container: string | HTMLElement): void {
    import('react-dom/client').then(({ createRoot }) => {
      const element = this.createElement(schema)
      const containerElement = typeof container === 'string' 
        ? document.querySelector(container) 
        : container

      if (!containerElement) {
        throw new Error(`Container element not found: ${container}`)
      }

      const root = createRoot(containerElement)
      root.render(element)
    })
  }

  /**
   * 兼容性方法：渲染Schema到DOM节点（保持原有方法名）
   */
  renderSchema(schema: IEficySchema, container: string | HTMLElement): void {
    this.render(schema, container)
  }

  /**
   * 根据Schema获取内部的NodeTree (新增方法，用于高级用法)
   */
  getNodeTree(schema: IEficySchema): EficyNodeTree {
    const nodeTree = this.schemaToNodeTree(schema)
    this.eficyNodeTree = nodeTree
    return nodeTree
  }

  /**
   * 获取当前的 EficyNodeTree
   */
  get nodeTree(): EficyNodeTree | null {
    return this.eficyNodeTree
  }

  /**
   * 获取当前的 RenderNodeTree
   */
  get renderTree(): RenderNodeTree | null {
    return this.renderNodeTree
  }

  /**
   * 根据Schema获取特定节点 (新增方法，用于操作节点)
   */
  getNode(schema: IEficySchema, nodeId: string): EficyNode | null {
    const nodeTree = this.schemaToNodeTree(schema)
    return nodeTree.findNode(nodeId)
  }

  /**
   * 从当前树中查找节点
   */
  findNode(nodeId: string): EficyNode | null {
    if (!this.eficyNodeTree) {
      return null
    }
    return this.eficyNodeTree.findNode(nodeId)
  }

  /**
   * 从当前 RenderNodeTree 中查找 RenderNode
   */
  findRenderNode(nodeId: string): ReactElement | null {
    if (!this.renderNodeTree) {
      return null
    }
    return this.renderNodeTree.findRenderNode(nodeId)
  }

  /**
   * 更新节点并同步更新 RenderNode
   */
  updateNode(nodeId: string, data: any): void {
    if (this.eficyNodeTree) {
      this.eficyNodeTree.updateNode(nodeId, data)
      
      // 同步更新 RenderNode
      if (this.renderNodeTree) {
        const updatedNode = this.eficyNodeTree.findNode(nodeId)
        if (updatedNode) {
          this.renderNodeTree.updateRenderNode(nodeId, updatedNode)
        }
      }
    }
  }

  /**
   * 添加子节点并同步更新 RenderNode
   */
  addChild(parentId: string, childData: any): EficyNode | null {
    if (!this.eficyNodeTree) {
      return null
    }
    
    const newNode = this.eficyNodeTree.addChild(parentId, childData)
    
    // 同步添加 RenderNode
    if (newNode && this.renderNodeTree) {
      this.renderNodeTree.addRenderNode(newNode)
    }
    
    return newNode
  }

  /**
   * 移除子节点并同步清理 RenderNode
   */
  removeChild(parentId: string, childId: string): void {
    if (this.eficyNodeTree) {
      this.eficyNodeTree.removeChild(parentId, childId)
      
      // 同步移除 RenderNode
      if (this.renderNodeTree) {
        this.renderNodeTree.removeRenderNode(childId)
      }
    }
  }

  /**
   * 清空所有树
   */
  clear(): void {
    if (this.eficyNodeTree) {
      this.eficyNodeTree.clear()
    }
    if (this.renderNodeTree) {
      this.renderNodeTree.clear()
    }
    this.eficyNodeTree = null
    this.renderNodeTree = null
  }

  /**
   * 获取统计信息
   */
  get stats() {
    return {
      nodeTree: this.eficyNodeTree?.stats || null,
      renderTree: this.renderNodeTree?.stats || null
    }
  }
}