import React, { ReactElement } from 'react';
import BasePlugin from './base';
import ViewSchema from '../models/ViewSchema';
import { get, isArray } from '../utils';
import { Bind } from 'lodash-decorators';
import { resolverBasic } from '../core/resolver';
import { Inject } from 'plugin-decorator';
import { action, observable, toJS } from 'mobx';

declare module '../models/ViewSchema' {
  export default interface ViewSchema {
    '#field': any;
  }
}

export default class AntForm extends BasePlugin {
  public static pluginName: string = 'ant-form';

  public formMap: Record<string, any> = {};
  private formC2PMap: Record<string, string> = {};
  private formWrapMap: Record<string, any> = {};
  private formChildSet: WeakSet<ViewSchema> = new WeakSet<ViewSchema>();

  @observable
  private formFields = {};

  private static propNamesMap = {
    checked: ['Switch', 'Radio', 'CheckBox'],
    fileList: ['Upload', 'Upload.Dragger'],
  };
  private static getPropsName(model: ViewSchema) {
    for (const key of Object.keys(this.propNamesMap)) {
      const values = this.propNamesMap[key];
      if (values.includes(model['#view'])) {
        return key;
      }
    }

    return null;
  }

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

  protected transformValues = () => {
    Object.values(this.controller.model.viewDataMap).forEach(model => {
      if (model['#field']) {
        const { name } = model['#field'];
        if (!this.formFields.hasOwnProperty(model['#'])) {
          // @ts-ignore
          this.formFields[model['#']] = toJS(model.value);
          Object.defineProperty(model, 'value', {
            configurable: true,
            enumerable: false,
            get: () => this.formFields[model['#']],
            set: val => {
              this.formFields[model['#']] = val;
              const form = this.formMap[this.formC2PMap[model['#']]];
              if (form) {
                this.formMap[this.formC2PMap[model['#']]].setFieldsValue({ [name]: val });
              }
            },
          });
        }
      }
    });
  };

  public handleChange(form, props, e) {
    const { model } = props;
    const fieldName = get(model, '#field.name', false);
    if (fieldName) {
      const propName = get(model, '#field.valuePropName', AntForm.getPropsName(model) || 'value');

      this.setFormFields({
        [model['#']]: e.target ? e.target[propName] : e,
      });
    }
    props.onChange && props.onChange(e);
  }

  public handleSubmit(props, e) {
    e.preventDefault();
    const { form } = props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        // tslint:disable-next-line:no-unused-expression
        props.onSubmit && props.onSubmit(values);
      }
    });
  }

  @action
  private setFormFields(fieldsValue) {
    Object.assign(this.formFields, fieldsValue);
  }

  private createForm(schema: ViewSchema, component) {
    if (!this.formWrapMap[schema['#']]) {
      // @ts-ignore
      this.formWrapMap[schema['#']] = global.antd.Form.create({ name: schema['#'] })(component);

      schema.forEachChild(child => {
        this.formChildSet.add(child);
      });
    }

    return this.formWrapMap[schema['#']];
  }

  @Bind
  @Inject
  public getResolver(next, resolver1, schema?: ViewSchema) {
    let resolver = next();
    if (schema && (schema['#view'] === 'Form' || this.formChildSet.has(schema))) {
      resolver = resolverBasic;
    }
    return resolver;
  }

  @Bind
  @Inject
  public componentWrap(next, Component, schema: ViewSchema) {
    let AntFormWrapComponent = next();
    if (schema['#view'] === 'Form') {
      AntFormWrapComponent = this.createForm(
        schema,
        React.forwardRef((props: { model: ViewSchema; form: any; children: ReactElement[] }, ref) => {
          const model = props.model as ViewSchema;
          this.formMap[model['#']] = props.form;

          const form = props.form;
          const replaceChildren = AntForm.replaceFieldReactElement(props.children, childElement => {
            const childModel = childElement.props.model;
            this.formC2PMap[childModel['#']] = model['#'];
            const { name, ...restOptions } = childModel['#field'];

            // record form values
            if (childModel.value) {
              restOptions.initialValue = restOptions.initialValue || childModel.value;
            }

            // add onChange wrap
            const nextProps = {
              ...childElement.props,
              onChange: e => this.handleChange(props.form, childElement.props, e),
            };
            delete nextProps.value;

            return form.getFieldDecorator(name, restOptions)({
              ...childElement,
              props: nextProps,
            });
          });

          return React.createElement(Component, {
            ...props,
            ref,
            children: replaceChildren,
            onSubmit: e => this.handleSubmit(props, e),
          });
        }),
      );
    }
    return AntFormWrapComponent;
  }
}
