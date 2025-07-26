import React, { memo } from 'react'
import type { ComponentType, ErrorInfo } from 'react'
import type { IRenderNodeProps } from '../interfaces'
import ViewNode from '../models/ViewNode'

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RenderNode Error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', border: '1px solid red', padding: '8px', margin: '4px' }}>
          <h4>Something went wrong</h4>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
            <pre>{this.state.error?.stack}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

// 主渲染组件 - 暂时移除observer，后续补充响应式功能
const RenderNodeInner: React.FC<IRenderNodeProps> = ({ viewNode, componentMap = {} }) => {
  // 检查是否应该渲染
  if (!viewNode.shouldRender) {
    return null
  }

  const componentName = viewNode['#view']
  const Component = componentMap[componentName] as ComponentType<any>

  // 组件不存在的错误处理
  if (!Component) {
    console.error(`Component "${componentName}" not found in componentMap`)
    return (
      <div style={{ color: 'red', background: '#ffe6e6', padding: '8px', border: '1px solid red' }}>
        Component "{componentName}" not found
      </div>
    )
  }

  // 获取组件props
  const props = viewNode.props

  // 处理子节点
  let children = props.children

  // 如果children是ViewNode数组，递归渲染
  if (Array.isArray(children) && children.length > 0 && children[0] instanceof ViewNode) {
    children = children.map((child: ViewNode) => (
      <RenderNode
        key={child['#'] || child.id}
        viewNode={child}
        componentMap={componentMap}
      />
    ))
  }

  // 创建最终props
  const finalProps = {
    ...props,
    children
  }

  // 如果Component是字符串（原生HTML标签）
  if (typeof Component === 'string') {
    return React.createElement(Component, finalProps)
  }

  // 如果Component是React组件
  return React.createElement(Component, finalProps)
}

// 使用memo优化的RenderNode
const RenderNode = memo<IRenderNodeProps>((props) => {
  return (
    <ErrorBoundary>
      <RenderNodeInner {...props} />
    </ErrorBoundary>
  )
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有viewNode发生变化时才重新渲染
  return (
    prevProps.viewNode === nextProps.viewNode &&
    prevProps.componentMap === nextProps.componentMap
  )
})

RenderNode.displayName = 'RenderNode'

export default RenderNode 