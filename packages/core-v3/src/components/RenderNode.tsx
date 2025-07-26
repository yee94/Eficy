import { useObserver } from '@eficy/reactive-react';
import type { ComponentType, FC } from 'react';
import { createElement, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { IRenderNodeProps } from '../interfaces';

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
  );
};

// 主渲染组件 - 使用useObserver(view)模式来追踪响应式数据
const RenderNodeInner: FC<IRenderNodeProps> = ({ eficyNode, componentMap = {}, childrenMap }: IRenderNodeProps) => {
  if (!childrenMap || !eficyNode) {
    throw new Error('childrenMap and eficyNode are required');
  }
  // 正确地在组件顶层调用useObserver hook
  const renderResult = useObserver(() => {
    const componentName = eficyNode['#view'];
    const shouldRender = eficyNode.shouldRender;
    const props = eficyNode.props;

    // 检查是否应该渲染
    if (!shouldRender) {
      return null;
    }

    const Component = componentMap[componentName] as ComponentType<any>;

    // 组件不存在的错误处理
    if (!Component) {
      console.error(`❌ Component "${componentName}" not found in componentMap`);
      return (
        <div style={{ color: 'red', background: '#ffe6e6', padding: '8px', border: '1px solid red' }}>
          Component "{componentName}" not found
        </div>
      );
    }
    const children = (() => {
      if (Array.isArray(eficyNode.children)) {
        return eficyNode.children.map((child) => childrenMap.get(child.id));
      }
      return eficyNode.children;
    })();

    // 创建最终props
    const finalProps = {
      ...props,
      children,
    };

    // 如果Component是字符串（原生HTML标签）
    if (typeof Component === 'string') {
      return createElement(Component, finalProps);
    }

    // 如果Component是React组件
    return <Component {...finalProps} />;
  });

  // 返回useObserver的结果
  return renderResult;
};

// 使用memo优化的RenderNode
const RenderNode = memo(
  (props: IRenderNodeProps) => {
    // 使用react-error-boundary替代自定义ErrorBoundary
    return (
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, info) => {
          console.error('💥 RenderNode Error:', error, info);
        }}
      >
        <RenderNodeInner {...props} />
      </ErrorBoundary>
    );
  },
  (prevProps, nextProps) => {
    // 自定义比较函数，只有viewNode发生变化时才重新渲染
    return prevProps.eficyNode === nextProps.eficyNode && prevProps.componentMap === nextProps.componentMap;
  },
);

RenderNode.displayName = 'RenderNode';

export default RenderNode;
