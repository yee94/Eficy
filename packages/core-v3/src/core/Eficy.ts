import 'reflect-metadata'
import { container } from 'tsyringe'
import React from 'react'
import type { ReactElement } from 'react'
import type { IEficyConfig, IEficySchema, IExtendOptions } from '../interfaces'
import ViewNode from '../models/ViewNode'
import RenderNode from '../components/RenderNode'
import ConfigService from '../services/ConfigService'
import ComponentRegistry from '../services/ComponentRegistry'

export default class Eficy {
  private configService: ConfigService
  private componentRegistry: ComponentRegistry

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
   * 根据Schema创建React元素
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

    const componentMap = this.componentRegistry.getAll()

    // 如果只有一个根视图，直接渲染
    if (schema.views.length === 1) {
      const viewNode = new ViewNode(schema.views[0])
      return React.createElement(RenderNode, { viewNode, componentMap })
    }

    // 多个根视图，使用Fragment包装
    const children = schema.views.map((viewData, index) => {
      const viewNode = new ViewNode(viewData)
      return React.createElement(RenderNode, { 
        key: viewNode['#'] || index, 
        viewNode, 
        componentMap 
      })
    })

    return React.createElement(React.Fragment, null, ...children)
  }

  /**
   * 渲染Schema到DOM节点
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
} 