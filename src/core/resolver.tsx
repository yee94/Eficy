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
  isPlainObject,
  Logs,
  mapDeep,
  mergeClassName,
  pickBy,
} from '../utils';
import ViewNode from '../models/ViewNode';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';

export interface IResolverOptions {
  componentMap?: any;
  onRegister?: (schema: ViewNode, componentRef) => void;
  componentWrap?: <T>(component: T, schema: ViewNode) => T;
  getResolver?: <T>(resolverNext?: T, schema?: ViewNode) => T;
}

const filterProps = obj => !isPlainObject(obj) || isEficyView(obj);

/**
 * transform prop list to a normal js ,except ViewNode
 * such as style
 * @param props
 * @returns {any}
 */
const transformPropsList = props =>
  mapDeep(props, obj => (filterProps(obj) ? obj : toJS(obj)), {
    isIncludeArray: true,
    exceptFns: [filterProps],
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
        Object.keys(obj).forEach(objKey => {
          const value = obj[objKey];
          if (typeof value === 'function') {
            obj[objKey] = eficyWrap(value, resultSchema => resolverNext(resultSchema, options));
          }
        });
        return obj;
      },
      {
        isIncludeArray: true,
        exceptFns: [obj => !isPlainObject(obj)],
      },
    );

  /**
   * transform children ViewNode
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
    '#if': ifRenderComponent = true,
    '#view': componentName,
    '#restProps': restProps,
    '#children': childrenSchema,
    '#content': content,
    '#staticProps': staticProps,
    className: configClassName,
    key,
    ...modelRestProps
  } = schema;

  if (!ifRenderComponent) {
    return null;
  }

  let Component = get(componentMap, schema['#view']);

  if (!Component) {
    // throw new Error(`Not found "${schema['#view']}" component`);
    // may be div, span
    Component = schema['#view'];
  }

  if (componentWrap) {
    if (!wrapMap.get(schema)) {
      // console.log('component wrap create', componentName);
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
    ...staticProps,
    ...modelRestProps,
    ...restProps,
    key: 'key' in schema ? key : id,
    className: mergeClassName(configClassName, `eid-${id}`, `e-${componentName}`),
    children: childrenSchema,
  });

  componentProps.model = schema;
  componentProps.ref = onRegister ? registerComponent : undefined;

  const { children = [], ...childProps } = componentProps;

  if (content) {
    children.push(content);
  }

  return React.createElement(Component, childProps, ...children);
}

export default function observerResolver(schema: IView | IView[], options?: IResolverOptions) {
  const { componentMap = {} } = options || {};
  const hasRenderFn = get(componentMap, `${schema['#view']}.prototype.render`, false);

  if (!hasRenderFn) {
    // if there has not render function just return Basic Component result
    return resolverBasic(schema, options);
  }

  // return props to Mobx React element to keep type.props right. Eg. Tabs -> Tabs.TabPane
  const restProps = runInAction(() => transformPropsList(schema['#restProps']));

  const memoElement = React.createElement(
    observer(props => {
      schema['#staticProps'] && Object.assign(schema['#staticProps'], props);

      const end = Logs.Performance(`rerender "${schema['#view']}" time`);
      const result = resolverBasic(schema, options);
      end();
      return result;
    }),
    {
      ...restProps,
      key: 'key' in schema ? schema.key : `observer_${schema['#'] || generateUid()}`,
    },
  );

  return memoElement;
}
