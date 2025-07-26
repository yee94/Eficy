/**
 * EficyTree 构建工具
 * 
 * 负责将 EficyNodeStore 转换为 EficyNode 树结构
 * 采用内向外递归的方式，确保所有子节点都是真正的 EficyNode 实例
 */

import type { ComponentType } from 'react'
import EficyNode from '../models/EficyNode'
import type { IViewData, IEficyNodeStore } from '../interfaces'

/**
 * 构建 EficyNode 树 - 内向外递归
 * @param viewData 视图数据
 * @param componentMap 组件映射
 * @returns EficyNode 实例
 */
export function buildEficyNode(
  viewData: IViewData,
  componentMap: Record<string, ComponentType<any> | string> = {}
): EficyNode {
  // 首先处理子节点 - 内向外递归
  let processedChildren: EficyNode[] = []
  if (viewData['#children'] && viewData['#children'].length > 0) {
    processedChildren = viewData['#children'].map(childData => 
      buildEficyNode(childData, componentMap)
    )
  }
  
  // 创建当前节点的数据，不包含 #children（因为我们要手动设置）
  const { '#children': _, ...nodeDataWithoutChildren } = viewData
  
  // 先创建节点实例（不包含子节点）
  const eficyNode = new EficyNode(nodeDataWithoutChildren)
  
  // 手动设置已经构建好的子节点
  if (processedChildren.length > 0) {
    eficyNode['#children'] = processedChildren
    
    // 更新模型映射
    eficyNode.nodeMap = {}
    processedChildren.forEach(child => {
      if (child['#']) {
        eficyNode.nodeMap[child['#']] = child
      }
    })
  }
  
  return eficyNode
}

/**
 * 构建 EficyNode 树结构
 * @param nodeTree NodeTree 数据
 * @param componentMap 组件映射
 * @returns EficyNode 数组
 */
export function buildEficyTree(
  views: IViewData[],
  componentMap: Record<string, ComponentType<any> | string> = {}
): EficyNode[] {
  const eficyNodes = views.map(viewData => 
    buildEficyNode(viewData, componentMap)
  )
  
  return eficyNodes
}

/**
 * 从 React 元素创建 EficyNode（用于动态创建）
 * @param element React 元素
 * @returns EficyNode 实例
 */
export function createEficyNodeFromElement(element: React.ReactElement): EficyNode {
  const viewData: IViewData = {
    '#': element.key as string || undefined,
    '#view': typeof element.type === 'string' ? element.type : 'div',
    ...element.props
  }
  
  return new EficyNode(viewData)
}

/**
 * 验证 EficyNode 树结构
 * @param eficyNodes EficyNode 数组
 * @returns 验证结果
 */
export function validateEficyTree(eficyNodes: EficyNode[]): {
  valid: boolean
  errors: string[]
} {
  const errors = []
  
  function validateNode(node: EficyNode, path: string = '') {
    const currentPath = path ? `${path}.${node['#']}` : node['#']
    
    // 验证节点类型
    if (!(node instanceof EficyNode)) {
      errors.push(`Node at ${currentPath} is not an EficyNode instance`)
      return
    }
    
    // 验证必要字段
    if (!node['#view']) {
      errors.push(`Node at ${currentPath} missing #view field`)
    }
    
    // 验证子节点
    if (node['#children']) {
      node['#children'].forEach((child, index) => {
        validateNode(child, `${currentPath}[${index}]`)
      })
    }
  }
  
  eficyNodes.forEach((node, index) => {
    validateNode(node, `root[${index}]`)
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}