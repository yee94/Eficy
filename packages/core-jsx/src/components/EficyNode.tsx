import { isSignal, mapSignals } from '@eficy/reactive';
import { useObserver } from '@eficy/reactive-react';
import type { ComponentType } from 'react';
import { forwardRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HookType } from '../constants';
import { useEficyContext } from '../contexts/EficyContext';
import type { ComponentRegistry } from '../services/ComponentRegistry';
import { isReactivePropKey, stripReactiveSuffix } from '../utils/reactiveProps';

export interface EficyNodeProps {
  type: string | ComponentType<any>;
  props: Record<string, any>;
  key?: string;
}

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

function resolveReactiveProps(props: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key of Object.keys(props)) {
    if (isReactivePropKey(key)) {
      const realKey = stripReactiveSuffix(key);
      const signalValue = props[key];
      if (isSignal(signalValue)) {
        result[realKey] = signalValue.value;
      } else {
        result[realKey] = signalValue;
      }
    } else {
      result[key] = props[key];
    }
  }

  return result;
}

const EficyNodeInner = forwardRef(({ type, props }: EficyNodeProps, ref) => {
  const eficyContext = useEficyContext();

  const renderResult = useObserver(() => {
    const reactiveResolved = resolveReactiveProps(props);
    const resolvedProps = mapSignals(reactiveResolved);

    let Component = resolveComponent(type, eficyContext?.componentRegistry);

    if (eficyContext?.pluginManager) {
      Component = eficyContext.pluginManager.executeHook(
        HookType.RENDER,
        {
          props: resolvedProps,
          type: type,
        },
        () => Component,
      );
    }

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

    return <Component {...resolvedProps} ref={ref} />;
  });

  return renderResult;
});

export const EficyNode = forwardRef((props: EficyNodeProps, ref) => {
  const { type, props: props2, ...rest } = props;
  const mergedProps = { ...rest, ...props.props };
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('[Eficy V3] Render Error:', error);
        console.error('Component Stack:', info.componentStack);
      }}
    >
      <EficyNodeInner {...props} props={mergedProps} ref={ref as any} />
    </ErrorBoundary>
  );
});

EficyNode.displayName = 'EficyNode';

function resolveComponent(
  type: string | ComponentType<any>,
  componentRegistry?: ComponentRegistry,
): string | ComponentType<any> | null {
  if (type === undefined || type === null) {
    console.error('[Eficy V3] Component type is undefined or null.');
    return null;
  }

  if (isValidReactComponent(type)) {
    return type;
  }

  if (typeof type === 'symbol') {
    return type;
  }

  if (typeof type === 'string') {
    if (isNativeHTMLTag(type)) {
      return type;
    }
    return componentRegistry?.resolve(type);
  }

  return null;
}

function isValidReactComponent(component: any): boolean {
  if (!component) return false;
  if (component.$$typeof) return true;

  if (typeof component === 'function') {
    if (component.displayName || component.name) return true;
    if (component.render && typeof component.render === 'function') return true;
    if (component.type && typeof component.type === 'function') return true;
    if (component.prototype && typeof component.prototype.render === 'function') return true;

    const functionName = component.name || component.displayName;
    if (functionName && functionName.length > 0 && functionName !== 'anonymous') return true;
  }

  return false;
}

function isNativeHTMLTag(tagName: string): boolean {
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
    'style',
  ]);
  return nativeTags.has(tagName.toLowerCase());
}
