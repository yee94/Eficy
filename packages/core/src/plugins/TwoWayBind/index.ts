import { Bind } from 'lodash-decorators';
import { Inject } from 'plugin-decorator';
import * as React from 'react';
import { get } from '../../utils';
import BasePlugin from '../base';
import ViewNode from '../../models/ViewNode';
import { defaultBindOptions, makeDefaultChangeFn } from './defaultConfig';

declare module '../../models/ViewNode' {
  export default interface ViewNode {
    '#bindValuePropName': string;
    value: any;
  }
}

// {onChange: (e) => ({value: e.target.value}) }
export type IChangeFn = Record<string, (...args: any) => Record<string, any>>;

export interface IBindOption {
  '#view': string;
  changeFns: IChangeFn;
}

export interface IPluginProps {
  bindOptions: IBindOption[];
  bindFields: string[];
}

/**
 * 用于数据双向绑定
 */
export default class TwoWayBind extends BasePlugin {
  public static pluginName: string = 'two-way-bind';
  public static defaultBindFields = ['value', 'checked'];
  public static uniq = true;

  public defaultOptions = {
    bindOptions: [],
    bindFields: TwoWayBind.defaultBindFields,
  };

  private syncWrapMap = new Map();
  public options: IPluginProps;

  constructor(options?: IPluginProps) {
    super(options);
    this.options = Object.assign({}, this.defaultOptions, options);
    this.options.bindOptions = [...defaultBindOptions, ...this.options.bindOptions];
    this.options.bindFields.concat(TwoWayBind.defaultBindFields);
  }

  protected getWrapProps<T>(props: T & { model: ViewNode }, changeFns: IChangeFn): T {
    const { model } = props;
    const appendProps = Object.entries(changeFns).reduce((prev, [key, handlerChangeFn]) => {
      const wrapFn = (...args) => {
        const fields = handlerChangeFn(...args);
        // {value: 2} or {fileList: []}
        model.update(fields);

        // keep props fn keep run
        key in props && props[key](...args);
      };
      return Object.assign(prev, { [key]: wrapFn });
    }, {});

    return Object.assign({}, props, appendProps);
  }

  @Bind
  @Inject
  public componentWrap(next, Component, schema: ViewNode) {
    let SyncWrapComponent = next();

    const changeFns = this.findChangeFnsBySchema(schema);

    if (changeFns) {
      SyncWrapComponent = this.getSyncWrapComponent(Component, changeFns);
    }
    return SyncWrapComponent;
  }

  private findChangeFnsBySchema(schema: ViewNode): IChangeFn | null {
    const bindOption = this.options.bindOptions.find(({ '#view': viewName }) => viewName === schema['#view']);
    if (bindOption) {
      return bindOption.changeFns;
    }

    const twoWayBindField = ['#bindValuePropName', ...this.options.bindFields].find((field) =>
      schema.hasOwnProperty(field),
    );

    if (twoWayBindField) {
      const field = get(schema, '#bindValuePropName', twoWayBindField);
      return makeDefaultChangeFn(field);
    }

    return null;
  }

  private getSyncWrapComponent(Component, changeFns: IChangeFn) {
    if (!this.syncWrapMap.get(Component)) {
      this.syncWrapMap.set(
        Component,
        React.forwardRef((props: { model: ViewNode }, ref) =>
          React.createElement(Component, {
            ref,
            ...this.getWrapProps(props, changeFns),
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
