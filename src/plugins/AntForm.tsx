import React from 'react';
import BasePlugin from './base';
import ViewSchema from '../models/ViewSchema';
import { Inject } from '../utils';
import { Bind } from 'lodash-decorators';

export default class AntForm extends BasePlugin {
  public static pluginName: string = 'ant-form';

  public formMap: Record<string, any> = {};
  public formC2PMap: Record<string, string> = {};

  @Bind
  @Inject
  public componentRenderWrap(next, component, props) {
    const schema = props.model as ViewSchema;

    let newComponent = component;
    if (schema['#field']) {
      console.log('component is', component);
      const form = this.formMap[this.formC2PMap[schema['#']]];
      if (form) {
        const { name, ...restOptions } = schema['#field'];
        newComponent = form.getFieldDecorator(name, {
          initialValue: schema['#restProps'].value,
          ...restOptions,
        })(React.createElement(component, props));
      }
    }

    next(newComponent);
  }

  @Bind
  @Inject
  public componentWrap(next, component, schema: ViewSchema) {
    let newComponent = component;
    if (schema['#view'] === 'Form') {
      // @ts-ignore
      newComponent = window.antd.Form.create({ name: schema['#'] })(props => {
        this.formMap[schema['#']] = props.form;
        console.log(props.children);
        // console.log('Fuck', props,props.form.);
        return React.createElement(component, props);
      });

      schema.forEachChild(child => {
        if (child['#field']) {
          this.formC2PMap[child['#']] = schema['#'];
        }
      });
    }

    next(newComponent);
  }
}
