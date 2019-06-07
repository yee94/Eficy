import React from 'react';
import { IView } from '../interface';
import resolver, { IResolverOptions } from './resolver';
import { mergeClassName } from '../utils';

type IResolverContainerOptions = IResolverOptions & {
  containerName?: string;
};

export default function resolverContainer(schema: IView | IView[], options?: IResolverContainerOptions) {
  const { containerName = '', ...restOpt } = options || {};

  const idProps = containerName ? { id: containerName } : {};
  return (
    <div {...idProps} className={mergeClassName('eficy-container', `${containerName}`)}>
      {resolver(schema, restOpt)}
    </div>
  );
}
