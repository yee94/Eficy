import React from 'react';
import { IView } from '../interface';
import { compose, filterUndefined, get, isArray, isEficyView, mapObjectDeep, mergeClassName, pickBy } from '../utils';
import Config from '../constants/Config';
import ViewSchema from '../models/ViewSchema';
import { toJS } from 'mobx';

export interface IResolverOptions {
  componentMap?: any;
  onRegister?: (schema: ViewSchema, componentRef) => void;
  componentWrap?: <T>(component: T, schema: ViewSchema) => T;
}

/**
 * transform prop list to a normal js ,except ViewSchema
 * such as style
 * @param props
 * @returns {any}
 */
const transformPropsList = props => mapObjectDeep(props, obj => (isEficyView(obj) ? obj : toJS(obj)));

/**
 * filter "#xxxxxxx" prop option
 * @param props
 */
const filterViewProps = props => pickBy(props, (value, key) => !/^#/.test(key));

export default function resolver(schema: IView | IView[], options?: IResolverOptions) {
  const { componentMap = window[Config.defaultComponentMapName] || {}, onRegister = null, componentWrap = null } =
    options || {};

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
    // transformPropsList,
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
