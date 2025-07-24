import React, { useMemo, useCallback } from 'react';
import { useSignalValue } from 'reactjs-signal';
import { ViewNode } from '../models/ViewNode';
import { ComponentRegistry } from '../core/ComponentRegistry';
import { VariableReplacer } from '../utils/VariableReplacer';
import { ActionHandler } from '../core/ActionHandler';

interface EficyRendererProps {
  node: ViewNode;
  componentRegistry: ComponentRegistry;
  variableReplacer: VariableReplacer;
  actionHandler: ActionHandler;
  context?: Record<string, any>;
}

interface RenderedNodeProps {
  node: ViewNode;
  componentRegistry: ComponentRegistry;
  variableReplacer: VariableReplacer;
  actionHandler: ActionHandler;
  context?: Record<string, any>;
}

const RenderedNode: React.FC<RenderedNodeProps> = ({
  node,
  componentRegistry,
  variableReplacer,
  actionHandler,
  context = {}
}) => {

  const isVisible = useMemo(() => {
    return node.isVisible();
  }, [node]);

  const Component = useMemo(() => {
    return componentRegistry.getComponent(node.type);
  }, [componentRegistry, node.type]);

  const processedProps = useMemo(() => {
    const props = node.props;
    const processedContext = {
      ...context,
      node,
      actionHandler,
    };
    
    return variableReplacer.replaceWithContext(props, processedContext);
  }, [node.props, variableReplacer, context, node, actionHandler]);

  const handleEvent = useCallback((eventName: string, ...args: any[]) => {
    const handler = processedProps[eventName];
    if (typeof handler === 'function') {
      handler(...args);
    }
  }, [processedProps]);

  const enhancedProps = useMemo(() => {
    const enhanced = { ...processedProps };
    
    // Convert event handlers
    Object.keys(enhanced).forEach(key => {
      if (key.startsWith('@') && typeof enhanced[key] === 'function') {
        const eventName = key.substring(1);
        const originalHandler = enhanced[key];
        
        enhanced[`on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`] = (...args: any[]) => {
          originalHandler(...args);
        };
        
        delete enhanced[key];
      }
    });

    return enhanced;
  }, [processedProps]);

  const children = useMemo(() => {
    if (node.children.length === 0) {
      return enhancedProps.children;
    }
    
    return node.children
      .filter(child => child.isVisible())
      .map(child => (
        <RenderedNode
          key={child.id}
          node={child}
          componentRegistry={componentRegistry}
          variableReplacer={variableReplacer}
          actionHandler={actionHandler}
          context={context}
        />
      ));
  }, [node.children, enhancedProps.children, componentRegistry, variableReplacer, actionHandler, context]);

  if (!isVisible) {
    return null;
  }

  if (!Component) {
    console.warn(`Component "${node.type}" not found in component registry`);
    return (
      <div style={{ color: 'red', border: '1px solid red', padding: '4px' }}>
        Component "{node.type}" not found
      </div>
    );
  }

  const { key: _, ...propsWithoutKey } = enhancedProps;
  const finalProps = {
    ...propsWithoutKey,
    'data-eficy-id': node.id,
    'data-eficy-type': node.type,
  };

  return (
    <Component key={node.id} {...finalProps}>
      {children}
    </Component>
  );
};

export const EficyRenderer: React.FC<EficyRendererProps> = ({
  node,
  componentRegistry,
  variableReplacer,
  actionHandler,
  context = {}
}) => {
  return (
    <RenderedNode
      node={node}
      componentRegistry={componentRegistry}
      variableReplacer={variableReplacer}
      actionHandler={actionHandler}
      context={context}
    />
  );
};

export default EficyRenderer;