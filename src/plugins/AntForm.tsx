import React from 'react';
import BasePlugin from './base';
import ViewSchema from '../models/ViewSchema';
import { get, Inject, isArray } from '../utils';
import { Bind } from 'lodash-decorators';
import { resolverBasic } from '../core/resolver';

export default class AntForm extends BasePlugin {
  public static pluginName: string = 'ant-form';

  public formMap: Record<string, any> = {};
  private formWrapMap: Record<string, any> = {};
  private formChildSet: WeakSet<ViewSchema> = new WeakSet<ViewSchema>();

  private static replaceFieldReactElement(children: any[] | any, cb: (child: any) => any): any {
    const verifyAndCallBack = child => {
      let newChild = child;
      const propsChildren = get(child, 'props.children', undefined);
      if (propsChildren) {
        const newProps = { ...child.props, children: this.replaceFieldReactElement(propsChildren, cb) };
        newChild = { ...child, props: newProps };
      }

      const field = get(child, 'props.model.#field', undefined);

      return field ? cb(child) : newChild;
    };
    if (isArray(children)) {
      return children.map(verifyAndCallBack);
    } else {
      return verifyAndCallBack(children);
    }
  }

  public handleSubmit(form, e) {
    e.preventDefault();
    form.validateFields((err, values) => {
      console.log(err, values);
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  private createForm(schema: ViewSchema, component) {
    if (!this.formWrapMap[schema['#']]) {
      // @ts-ignore
      this.formWrapMap[schema['#']] = window.antd.Form.create({ name: schema['#'] })(component);

      schema.forEachChild(child => {
        this.formChildSet.add(child);
      });
    }

    return this.formWrapMap[schema['#']];
  }

  @Bind
  @Inject
  public getResolver(next, resolver1, schema?: ViewSchema) {
    let resolver = resolver1;
    if (schema && (schema['#view'] === 'Form' || this.formChildSet.has(schema))) {
      resolver = resolverBasic;
    }
    next(resolver);
  }

  @Bind
  @Inject
  public componentWrap(next, Component, schema: ViewSchema) {
    let AntFormWrapComponent = Component;
    if (schema['#view'] === 'Form') {
      AntFormWrapComponent = this.createForm(
        schema,
        React.forwardRef((props, ref) => {
          const model = props.model as ViewSchema;
          this.formMap[model['#']] = props.form;

          const form = props.form;
          const replaceChildren = AntForm.replaceFieldReactElement(props.children, childElement => {
            const childModel = childElement.props.model;
            const { name, ...restOptions } = childModel['#field'];
            return form.getFieldDecorator(name, restOptions)(childElement);
          });

          return React.createElement(Component, {
            ...props,
            ref,
            children: replaceChildren,
            onSubmit: e => this.handleSubmit(props.form, e),
          });
        }),
      );
    }
    next(AntFormWrapComponent);
  }
}
