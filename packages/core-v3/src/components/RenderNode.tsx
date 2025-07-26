import React, { memo } from 'react'
import type { ComponentType } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { observer } from '@eficy/reactive-react'
import type { IRenderNodeProps } from '../interfaces'
import ViewNode from '../models/ViewNode'

// 自定义错误回退组件
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div style={{ color: 'red', border: '1px solid red', padding: '8px', margin: '4px' }}>
      <h4>Something went wrong</h4>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </details>
      <button onClick={resetErrorBoundary} style={{ marginTop: '8px' }}>
        Try again
      </button>
    </div>
  )
}

// 主渲染组件 - 使用observer包装以支持响应式
const RenderNodeInner: React.FC<IRenderNodeProps> = observer(({ viewNode, componentMap = {} }: IRenderNodeProps) => {
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
})

// 使用memo优化的RenderNode
const RenderNode = memo((props: IRenderNodeProps) => {
  // 使用react-error-boundary替代自定义ErrorBoundary
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('RenderNode Error:', error, info)
      }}
    >
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