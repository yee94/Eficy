import React, { forwardRef, memo, Fragment, FC } from 'react';
import { useObserver } from './hooks/useObserver';
import type { IObserverOptions, IObserverProps, ReactFC } from './types';

// 简化的 hoist 实现，只复制必要的静态属性
function hoistStatics(target: unknown, source: unknown) {
  const keys = ['displayName', 'propTypes', 'defaultProps'] as const;
  for (const key of keys) {
    if (typeof source === 'object' && source !== null && key in source) {
      (target as Record<string, unknown>)[key] = (source as Record<string, unknown>)[key];
    }
  }
  return target;
}

export function observer<P = any>(component: ReactFC<P>, options?: IObserverOptions): FC<P> {
  const realOptions = {
    forwardRef: false,
    ...options,
  };

  const wrappedComponent = realOptions.forwardRef
    ? forwardRef((props: any, ref: any) => {
        return useObserver(() => component({ ...props, ref }));
      })
    : (props: any) => {
        return useObserver(() => component(props));
      };

  const memoComponent = memo(wrappedComponent);

  hoistStatics(memoComponent, component);

  if (realOptions.displayName) {
    memoComponent.displayName = realOptions.displayName;
  }

  return memoComponent;
}

export const Observer = observer((props: IObserverProps) => {
  const children = typeof props.children === 'function' ? props.children() : props.children;
  return React.createElement(Fragment, {}, children);
});
