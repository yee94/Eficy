import React from 'react';
import { IView } from '../interface';
import { compose, filterUndefined, get, isArray, isEficyView, mergeClassName } from '../utils';
import Config from '../constants/Config';
import { observer } from 'mobx-react-lite';
import ViewSchema from '../models/ViewSchema';

export interface IResolverOptions {
  componentMap?: any;
  onRegister?: (schema: ViewSchema, componentRef) => void;
  componentWrap?: <T>(component: T, schema: ViewSchema) => T;
  componentRenderWrap?: <T>(component: T, props: any) => T;
}

export default function resolver(schema: IView | IView[], options?: IResolverOptions) {
  const {
    componentMap = window[Config.defaultComponentMapName] || {},
    onRegister = null,
    componentWrap = null,
    componentRenderWrap = null,
  } = options || {};

  if (schema instanceof Array) {
    return schema.map(s => resolver(s, options));
  }

  const registerComponent = ref => {
    if (onRegister) {
      onRegister(schema, ref);
    }
  };

  const transformViewComponent = props =>
    Object.keys(props).reduce((prev, next) => {
      const value = props[next];
      if ((isArray(value) && value.every(isEficyView)) || isEficyView(value)) {
        prev[next] = resolver(value, options);
      } else {
        prev[next] = value;
      }
      return prev;
    }, {});

  const {
    '#': id,
    '#view': componentName,
    '#restProps': restProps,
    '#children': childrenSchema,
    className: configClassName,
    ...modelRestProps
  } = schema;

  let Component = get(componentMap, schema['#view']);

  if (!Component) {
    throw new Error(`Not found "${schema['#view']}" component`);
  }

  if (componentWrap) {
    console.log('component wrap create', componentName);
    Component = componentWrap(Component, schema);
  }

  const componentProps = compose(
    transformViewComponent,
    filterUndefined,
  )({
    ...modelRestProps,
    ...restProps,
    key: id,
    className: mergeClassName(configClassName, `eid-${id}`, `e-${componentName}`),
    ref: onRegister ? registerComponent : undefined,
    children: childrenSchema,
  });

  return React.createElement(
    observer(props => {
      const childProps = {
        ...componentProps,
        ...props,
        model: schema,
      };
      let WrapComponent = Component;
      if (componentRenderWrap) {
        console.log('component render wrap', componentName);
        WrapComponent = componentRenderWrap(Component, childProps);
      }
      return React.isValidElement(WrapComponent) ? WrapComponent : <WrapComponent {...childProps} />;
    }),
  );
}
