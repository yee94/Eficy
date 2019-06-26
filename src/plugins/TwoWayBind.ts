import BasePlugin from './base';
import ViewSchema from '../models/ViewSchema';
import { Bind } from 'lodash-decorators';
import { Inject } from 'plugin-decorator';
import * as React from 'react';
import { get } from '../utils';

declare module '../models/ViewSchema' {
  export default interface ViewSchema {
    '#bindValuePropName': string;
    value: any;
  }
}

export default class TwoWayBind extends BasePlugin {
  public static pluginName: string = 'two-way-bind';
  public static defaultBindFields = ['value', 'checked'];
  public defaultOptions = {
    bindFields: TwoWayBind.defaultBindFields,
  };
  private syncWrapMap = new Map();

  constructor(options?: any) {
    super(options);
    this.options = Object.assign({}, this.defaultOptions, options);
    this.options.bindFields.push(TwoWayBind.defaultBindFields);
  }

  protected handleChange(props, e) {
    const { model } = props;
    const propName = get(
      model,
      '#bindValuePropName',
      Object.keys(model).find(val => this.options.bindFields.includes(val)),
    );

    if (propName) {
      model.update({
        [propName]: e.target ? e.target[propName] : e,
      });
    }
    props.onChange && props.onChange(e);
  }

  @Bind
  @Inject
  public componentWrap(next, Component, schema: ViewSchema) {
    let SyncWrapComponent = next();
    if (['#bindValuePropName', ...this.options.bindFields].some(field => schema.hasOwnProperty(field))) {
      SyncWrapComponent = this.getSyncWrapComponent(Component);
    }
    return SyncWrapComponent;
  }

  private getSyncWrapComponent(Component) {
    if (!this.syncWrapMap.get(Component)) {
      this.syncWrapMap.set(
        Component,
        React.forwardRef((props: { model: ViewSchema }, ref) =>
          React.createElement(Component, {
            ...props,
            ref,
            onChange: e => this.handleChange(props, e),
          }),
        ),
      );
    }

    return this.syncWrapMap.get(Component);
  }

  public destroyPlugin() {
    this.syncWrapMap.clear();
    super.destroyPlugin();
  }
}
