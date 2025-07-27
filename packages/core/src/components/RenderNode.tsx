import { useObserver } from '@eficy/reactive-react';
import type { ComponentType, FC } from 'react';
import { createElement, memo, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { IRenderNodeProps } from '../interfaces';
import { processEventHandlers } from '../utils/eventHandlers';
import { useOptionalEficyContext } from '../contexts/EficyContext';
import { SYNC_SIDE_EFFECT_EVENTS, ASYNC_FLOW_EVENTS } from '../services/LifecycleEventEmitter';
import type { IRenderContext, IMountContext, IUnmountContext } from '../interfaces/lifecycle';

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

  // 获取 Eficy Context（可选）
  const eficyContext = useOptionalEficyContext();
  const [isMounted, setIsMounted] = useState(false);
  
  // 异步流程钩子状态管理
  const [asyncState, setAsyncState] = useState({
    isInitializing: false,
    isBuildingSchema: false,
    isResolvingComponent: false,
    isProcessingProps: false,
    isRendering: false,
    error: null as Error | null
  });

  // 处理 Mount/Unmount 生命周期钩子
  useEffect(() => {
    if (eficyContext?.lifecycleEventEmitter) {
      // 发射 Mount 事件
      const mountContext: IMountContext = {
        container: undefined,
        parentElement: undefined
      };

      // 发射同步副作用钩子，捕获错误以防止组件渲染中断
      try {
        eficyContext.lifecycleEventEmitter.emitSyncMount(mountContext);
      } catch (error) {
        console.error('Mount lifecycle hook error:', error);
        // 发射错误钩子
        eficyContext.lifecycleEventEmitter.emitSyncError(error as Error, {
          component: eficyNode['#view'],
          stack: (error as Error).stack || '',
          severity: 'medium',
          recoverable: true
        });
      }
      setIsMounted(true);

      // 清理函数 - 发射 Unmount 事件
      return () => {
        const unmountContext: IUnmountContext = {
          container: undefined,
          parentElement: undefined
        };

        // 发射同步副作用钩子，捕获错误
        try {
          eficyContext.lifecycleEventEmitter.emitSyncUnmount(unmountContext);
        } catch (error) {
          console.error('Unmount lifecycle hook error:', error);
          // 发射错误钩子
          eficyContext.lifecycleEventEmitter.emitSyncError(error as Error, {
            component: eficyNode['#view'],
            stack: (error as Error).stack || '',
            severity: 'medium',
            recoverable: true
          });
        }
        setIsMounted(false);
      };
    } else {
      setIsMounted(true);
    }
  }, [eficyContext, eficyNode.id]);

  // 正确地在组件顶层调用useObserver hook
  const renderResult = useObserver(() => {
    const componentName = eficyNode['#view'];
    const shouldRender = eficyNode.shouldRender;
    let props = eficyNode.props;

    // 检查是否应该渲染
    if (!shouldRender) {
      return null;
    }

    // 如果启用了生命周期钩子，并且有 eventEmitter
    if (eficyContext?.lifecycleEventEmitter) {
      // 尝试同步执行异步流程钩子（不阻塞渲染）
      // 这里使用fire-and-forget模式，不等待异步结果
      const executeAsyncHooksInBackground = async () => {
        try {
          // 创建 Render 上下文
          const renderContext: IRenderContext = {
            componentMap: eficyContext.componentRegistry?.getAll() || componentMap,
            isSSR: typeof window === 'undefined',
          };
          
          // 发射渲染异步流程钩子（后台执行）
          const customElement = await eficyContext.lifecycleEventEmitter.emitAsyncRender(eficyNode, renderContext);
          
          // 如果有自定义渲染结果，可以在这里处理
          if (customElement) {
            console.log('Custom render result:', customElement);
          }
        } catch (error) {
          console.error('Async render hook error:', error);
          setAsyncState(prev => ({ ...prev, error: error as Error }));
        }
      };
      
      // 在后台执行异步钩子，不阻塞渲染
      executeAsyncHooksInBackground();
    }

    // 获取组件 - 保持同步处理
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

    // 处理事件处理函数，添加 HandleEvent 和 BindEvent 钩子支持
    props = processEventHandlers(
      props, 
      eficyNode, 
      eficyContext?.lifecycleEventEmitter
    );
    
    // 如果有异步错误，显示错误信息
    if (asyncState.error) {
      return (
        <div style={{ color: 'red', background: '#ffe6e6', padding: '8px', border: '1px solid red' }}>
          Async Hook Error: {asyncState.error.message}
        </div>
      );
    }

    const children = (() => {
      // 处理响应式子节点
      if (Array.isArray(eficyNode.children) && eficyNode.children.length > 0) {
        // 如果是 EficyNode 实例数组，需要映射到对应的 ReactElement
        if (eficyNode.children[0] && typeof eficyNode.children[0] === 'object' && eficyNode.children[0].id) {
          return eficyNode.children.map((child) => childrenMap.get(child.id));
        }
        // 如果是普通数组，直接返回
        return eficyNode.children;
      }
      
      // 如果是文本内容
      if (eficyNode['#content']) {
        return eficyNode['#content'];
      }
      
      return null;
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
