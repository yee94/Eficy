/**
 * EficyNode - 处理包含 signals 的响应式组件
 *
 * 基于现有的 RenderNode 逻辑，简化并专注于 signals 响应式处理
 */

import React, { memo, ComponentType } from 'react';
import { isSignal } from '@eficy/reactive';
import { ErrorBoundary } from 'react-error-boundary';
import { useEficyContext } from '../contexts/EficyContext';
import { useObserver } from '@eficy/reactive-react';
import { ComponentRegistry } from '../services/ComponentRegistry';
import mapValues from 'lodash/mapValues';

export interface EficyNodeProps {
  type: string | ComponentType<any>;
  props: Record<string, any>;
  key?: string;
}

// 错误回退组件
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div
    style={{
      color: 'red',
      border: '1px solid red',
      padding: '8px',
      margin: '4px',
      borderRadius: '4px',
      backgroundColor: '#ffe6e6',
    }}
  >
    <h4>Render Error</h4>
    <details>
      <summary>Details</summary>
      <pre style={{ fontSize: '12px', overflow: 'auto' }}>{error.message}</pre>
    </details>
    <button
      onClick={resetErrorBoundary}
      style={{
        marginTop: '8px',
        padding: '4px 8px',
        fontSize: '12px',
        cursor: 'pointer',
      }}
    >
      Retry
    </button>
  </div>
);

// 处理 signals 的内部组件
const EficyNodeInner: React.FC<EficyNodeProps> = ({ type, props, key }) => {
  const eficyContext = useEficyContext();

  // 使用 useObserver 来监听 signals 的变化
  const renderResult = useObserver(() => {
    // 解析 props 中的 signals
    const resolvedProps = resolveSignalProps(props);

    // 获取实际的组件
    const Component = resolveComponent(type, eficyContext?.componentRegistry);

    if (!Component) {
      console.error(`[Eficy V3] Component "${String(type)}" not found`);
      return (
        <div
          style={{
            color: 'red',
            background: '#ffe6e6',
            padding: '8px',
            border: '1px solid red',
            borderRadius: '4px',
          }}
        >
          Component "{String(type)}" not found
        </div>
      );
    }

    // 渲染组件
    return <Component {...resolvedProps} />;
  });

  return renderResult;
};

// 主要的 EficyNode 组件
export const EficyNode = memo<EficyNodeProps>(
  (props) => (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('[Eficy V3] Render Error:', error);
        console.error('Component Stack:', info.componentStack);
      }}
    >
      <EficyNodeInner {...props} />
    </ErrorBoundary>
  ),
  // 只有当 type 或 props 引用发生变化时才重新渲染
  (prevProps, nextProps) => {
    return prevProps.type === nextProps.type && prevProps.props === nextProps.props;
  },
);

EficyNode.displayName = 'EficyNode';

/**
 * 解析 props 中的 signals
 */
function resolveSignalProps(props: Record<string, any>): Record<string, any> {
  if (!props || typeof props !== 'object') {
    return props;
  }

  return mapValues(props, (value, key) => {
    if (key === 'children') {
      const children = Array.isArray(value) ? value : [value];

      return children.map((child) => {
        if (isSignal(child)) {
          return child();
        }
        return child;
      });
    }
    if (isSignal(value)) {
      return value();
    }
    return value;
  });
}

/**
 * 解析组件类型
 */
function resolveComponent(
  type: string | ComponentType<any>,
  componentRegistry?: ComponentRegistry,
): string | ComponentType<any> | null {
  // 检查是否是有效的 React 组件
  if (isValidReactComponent(type)) {
    return type;
  }

  // 如果是字符串
  if (typeof type === 'string') {
    // 首先检查是否是原生 HTML 标签
    if (isNativeHTMLTag(type)) {
      return type;
    }

    // 然后从组件注册表中查找
    if (componentRegistry && componentRegistry.has(type)) {
      return componentRegistry.get(type)!;
    }

    // 如果都找不到，返回 null
    return null;
  }

  return null;
}

/**
 * 检查是否是有效的 React 组件
 */
function isValidReactComponent(component: any): boolean {
  // 检查是否是 React 组件的基本特征
  if (!component) {
    return false;
  }

  // 检查是否有 $$typeof 属性（React 组件的标识）
  if (component.$$typeof) {
    return true;
  }

  // 检查是否是函数组件（有 displayName 或 name）
  if (typeof component === 'function') {
    // 检查是否有 React 组件的特征
    if (component.displayName || component.name) {
      return true;
    }

    // 检查是否是 React.forwardRef 创建的组件
    if (component.render && typeof component.render === 'function') {
      return true;
    }

    // 检查是否是 React.memo 包装的组件
    if (component.type && typeof component.type === 'function') {
      return true;
    }

    // 检查是否是类组件（有 prototype 和 render 方法）
    if (component.prototype && typeof component.prototype.render === 'function') {
      return true;
    }

    // 对于简单的函数组件，检查是否返回 JSX 或 React 元素
    // 这里我们假设如果函数有合理的名称，就认为是组件
    const functionName = component.name || component.displayName;
    if (functionName && functionName.length > 0 && functionName !== 'anonymous') {
      return true;
    }
  }

  return false;
}

/**
 * 检查是否是原生 HTML 标签
 */
function isNativeHTMLTag(tagName: string): boolean {
  // 简单的检查，可以根据需要扩展
  const nativeTags = new Set([
    'div',
    'span',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'img',
    'button',
    'input',
    'textarea',
    'select',
    'option',
    'ul',
    'ol',
    'li',
    'table',
    'tr',
    'td',
    'th',
    'thead',
    'tbody',
    'header',
    'footer',
    'main',
    'section',
    'article',
    'aside',
    'nav',
    'form',
    'label',
    'br',
    'hr',
    'strong',
    'em',
    'code',
    'pre',
  ]);

  return nativeTags.has(tagName.toLowerCase());
}
