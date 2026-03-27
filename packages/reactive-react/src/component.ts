import type { FC } from 'react';
import { observer } from './observer';
import type { IObserverOptions, ReactFC } from './types';

export function component<P = object>(fn: ReactFC<P>, options?: IObserverOptions): FC<P> {
  return observer(fn, options);
}
