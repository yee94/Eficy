import React from 'react';
import { IView } from '../interface';
import { filterUndefined, get, mergeClassName } from '../utils';
import Config from '../constants/Config';
import { observer } from 'mobx-react-lite';
import ViewSchema from '../models/ViewSchema';

interface IResolverOptions {
  componentMap?: any;
  containerName?: string;
  onRegister?: (schema: ViewSchema, componentRef) => void;
  componentWrap?: <T>(component: T, schema: ViewSchema) => T;
}

export default function resolver(schema: IView | IView[], options?: IResolverOptions) {
  const {
    componentMap = window[Config.defaultComponentMapName] || {},
    containerName = null,
    onRegister = null,
    componentWrap = null,
  } = options || {};
  // @ts-ignore
  const { containerName: tmp, ...childProps } = options || {};

  if (schema instanceof Array) {
    const idProps = containerName ? { id: containerName } : {};

    return (
      <div {...idProps} className={mergeClassName('eficy-container', `${containerName}`)}>
        {schema.map(s => resolver(s, childProps))}
      </div>
    );
  }

  const registerComponent = ref => {
    if (onRegister) {
      onRegister(schema, ref);
    }
  };

  let RenderComponent = observer(() => {
    const Component = get(componentMap, schema['#view']);

    if (!Component) {
      throw new Error(`Not found "${schema['#view']}" component`);
    }

    const {
      '#': id,
      '#view': componentName,
      '#props': restProps,
      '#children': childrenSchema,
      className: configClassName,
      ...modelRestProps
    } = schema;

    const componentProps = filterUndefined({
      ...modelRestProps,
      ...restProps,
      className: mergeClassName(configClassName, `eid-${id}`, `e-${componentName}`),
      ref: onRegister ? registerComponent : undefined,
      children: childrenSchema ? childrenSchema.map(s => resolver(s, childProps)) : undefined,
    });

    return <Component {...componentProps} key={id} />;
  });

  if (componentWrap) {
    RenderComponent = componentWrap(RenderComponent, schema);
  }

  return <RenderComponent />;
}
