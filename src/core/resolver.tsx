import React from 'react';
import { IView } from '../interface';
import {
  compose,
  eficyWrap,
  filterUndefined,
  generateUid,
  get,
  isArray,
  isEficyView,
  Logs,
  mapDeep,
  mergeClassName,
  pickBy,
} from '../utils';
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
const transformPropsList = props =>
  mapDeep(props, obj => (isEficyView(obj) ? obj : toJS(obj)), {
    isIncludeArray: true,
    exceptFns: [obj => isEficyView(obj)],
  });

/**
 * filter "#xxxxxxx" prop option
 * @param props
 */
const filterViewProps = props => pickBy(props, (value, key) => !/^#/.test(key));

const wrapMap = new WeakMap();

export function resolverBasic(schema: IView | IView[], options?: IResolverOptions): any {
  const {
    componentMap = {},
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

  /**
   * transform function result to resolver data
   * eg.
   *  data => ({'#view':'a',href:"baidu.com"})
   *  to : data => <a href="baidu.com" />
   * @param props
   * @returns {any}
   */
  const transformFunctionResult = props =>
    mapDeep(
      props,
      obj => {
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (typeof value === 'function') {
            obj[key] = eficyWrap(value, resultSchema => resolverNext(resultSchema, options));
          }
        });
        return obj;
      },
      { isIncludeArray: true },
    );

  /**
   * transform children ViewSchema
   * @param props
   * @returns {{}}
   */
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
    // throw new Error(`Not found "${schema['#view']}" component`);
    Component = schema['#view'];
  }

  if (componentWrap) {
    if (!wrapMap.get(schema)) {
      console.log('component wrap create', componentName);
      wrapMap.set(schema, componentWrap(Component, schema));
    }
    Component = wrapMap.get(schema);
  }

  const componentProps = compose(
    transformFunctionResult,
    transformViewComponent,
    transformPropsList,
    filterViewProps,
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
  return React.createElement(
    observer(() => {
      const end = Logs.Performance(`rerender "${schema['#view']}" time`);
      const result = resolverBasic(schema, options);
      end();
      return result;
    }),
    {
      key: `observer_${schema['#'] || generateUid()}`,
    },
  );
}
