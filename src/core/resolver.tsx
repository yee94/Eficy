import React from 'react';
import { IView } from '../interface';
import { compose, filterUndefined, get, isArray, isEficyView, mapDeep, mergeClassName, pickBy } from '../utils';
import Config from '../constants/Config';
import ViewSchema from '../models/ViewSchema';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

export interface IResolverOptions {
  componentMap?: any;
  onRegister?: (schema: ViewSchema, componentRef) => void;
  componentWrap?: <T>(component: T, schema: ViewSchema) => T;
  getResolver?: <T>(resolverNext?: T, schema?: ViewSchema) => T;
}

/**
 * transform prop list to a normal js ,except ViewSchema
 * such as style
 * @param props
 * @returns {any}
 */
const transformPropsList = props => mapDeep(props, obj => (isEficyView(obj) ? obj : toJS(obj)));

/**
 * filter "#xxxxxxx" prop option
 * @param props
 */
const filterViewProps = props => pickBy(props, (value, key) => !/^#/.test(key));

export function resolverBasic(schema: IView | IView[], options?: IResolverOptions): any {
  const {
    componentMap = window[Config.defaultComponentMapName] || {},
    onRegister = null,
    componentWrap = null,
    // tslint:disable-next-line:no-shadowed-variable
    getResolver = (tmp1, schema?: any) => tmp1,
  } = options || {};

  const resolverNext = getResolver(observerResolver, schema);

  if (schema instanceof Array) {
    return schema.map(s => resolverNext(s, options));
  }

  const registerComponent = ref => {
    if (onRegister) {
      onRegister(schema, ref);
    }
  };

  const transformViewComponent = props =>
    Object.keys(props).reduce((prev, next) => {
      const value = props[next];
      if (isArray(value) && value.every(isEficyView)) {
        prev[next] = value.map(t => resolverNext(t, options));
      } else if (isEficyView(value)) {
        prev[next] = resolverNext(value, options);
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
    '#content': content,
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
    transformPropsList,
    filterViewProps,
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

  componentProps.model = schema;

  const { children = [], ...childProps } = componentProps;

  if (content) {
    children.push(content);
  }

  return React.createElement(Component, childProps, ...children);
}

export default function observerResolver(schema: IView | IView[], options?: IResolverOptions) {
  return React.createElement(observer(() => resolverBasic(schema, options)), { key: `observer_${schema['#']}` });
}
