import BasePlugin from './base';
import { IRequest } from './Request';
import { generateUid, pick, toArr } from '../utils';
import { ViewNode } from '../models';
import { Bind } from 'lodash-decorators';
import { Inject } from 'plugin-decorator';
import * as React from 'react';
import createReplacer from '../utils/relaceVariable';
import { action } from 'mobx';

interface ITableView extends ViewNode {
  '#view': 'Table';
  '#request': IRequest;
  pagination: any;
  columns: any[];
}

interface IRequestParams {
  pagination: { current: number; pageSize: number; total: number };
  sorter: Record<string, string>;
  filters: Record<string, string[]>;
  _beforeExtend?: string;
}

export default class AntTable extends BasePlugin {
  public static pluginName: string = 'ant-table';

  protected transformValues = options => {
    if (!options) {
      Object.values(this.controller.model.viewDataMap).forEach(model => {
        model['#view'] === 'Table' && this.applyTableProperty(model as any);
      });
    }
  };
  private tableWrapMap = new WeakMap();
  private tableStates: Record<string, IRequestParams> = {};

  /**
   * resolver tableSchema
   * @param tableView
   */
  private applyTableProperty(tableView: ITableView) {
    tableView['#request'] = this.getTableRequest(tableView);

    tableView.pagination = {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: total => `Total ${total} items`,
      ...tableView.pagination,
    };

    this.initTableState(tableView);
  }

  /**
   * change table request, add preset request config
   * @param tableView
   */
  private getTableRequest(tableView: ITableView): IRequest {
    const tableId = tableView['#'] || generateUid();
    const originConfig = tableView['#request'];
    const before = toArr(originConfig.before || []);
    const format = toArr(originConfig.format || []);
    const autoAddConfig = {
      '#': `request_${tableId}`,
      method: 'POST',
      immediately: true,
    };

    const requestConfig: IRequest = Object.assign({}, autoAddConfig, originConfig);
    const beforeInside = config => {
      config.data = this.getRequestParams(tableView, config.data);

      return {
        action: 'update',
        data: { '#': tableId, loading: true },
      };
    };
    requestConfig.before = [beforeInside, ...before];

    const formatInside = () => ({
      action: 'update',
      data: { '#': tableId, loading: false },
    });
    requestConfig.format = [formatInside, ...format];

    return requestConfig;
  }

  /**
   * get table request params
   * @param model
   * @returns {{pagination: {}, sorter: {}, filters: {}}}
   * @param extendParams
   */
  protected getRequestParams(model: ITableView, extendParams?: Record<string, any>): IRequestParams {
    const { pagination = {} as any, sorter = {}, filters = {}, _beforeExtend: before = {} } =
      this.tableStates[model['#']] || ({} as IRequestParams);

    const tableState = { pagination, sorter, filters };

    const userParams = createReplacer({ tableState })(extendParams);

    if (JSON.stringify(userParams) !== before) {
      pagination.current = 1;
      this.changeTwoWayBindValue(model);
    }

    this.tableStates[model['#']]._beforeExtend = JSON.stringify(userParams);

    return { ...tableState, ...(userParams || {}) };
  }

  @Bind
  @Inject
  public componentWrap(next, Component, schema: ViewNode) {
    let SyncWrapComponent = next();
    if (schema['#view'] === 'Table') {
      SyncWrapComponent = this.getSyncWrapComponent(Component);
    }
    return SyncWrapComponent;
  }

  private getSyncWrapComponent(Component) {
    if (!this.tableWrapMap.get(Component)) {
      this.tableWrapMap.set(
        Component,
        React.forwardRef((props: any, ref) =>
          React.createElement(Component, {
            ...props,
            ref,
            onChange: (...args) => this.handleChange(props, ...args),
          }),
        ),
      );
    }

    return this.tableWrapMap.get(Component);
  }

  private initTableState(tableView: ITableView) {
    let { pagination = {} } = tableView;
    pagination = { ...pagination };
    pagination.current = pagination.defaultCurrent || 1;
    pagination = pick(pagination, 'current,pageSize,total'.split(','));

    const filters = tableView.columns.reduce((previousValue, currentValue) => {
      if (currentValue.filters && currentValue.filteredValue) {
        previousValue[currentValue.dataIndex] = currentValue.filteredValue;
      }
      return previousValue;
    }, {});

    const sorter = tableView.columns.reduce((previousValue, currentValue) => {
      if (currentValue.sorter === true && currentValue.defaultSortOrder) {
        previousValue[currentValue.dataIndex] = currentValue.defaultSortOrder;
      }
      return previousValue;
    }, {});

    this.tableStates[tableView['#']] = { pagination, filters, sorter };
  }

  private handleChange(props: { model: ITableView; onChange?: any }, ...args) {
    let [pagination, filters, sorter] = args;
    const { model } = props;

    pagination = pick(pagination, 'current,pageSize,total'.split(','));
    if (!Array.isArray(sorter)) {
      sorter = !!sorter ? [sorter] : [];
    }
    sorter = sorter.reduce((prev, sorterOne) => Object.assign(prev, { [sorterOne.field]: sorterOne.order }), {});

    const { columns } = model;
    filters = Object.keys(filters).reduce((prev, componentKey) => {
      const column = columns.find(c => c.key === componentKey);
      prev[column ? column.dataIndex || componentKey : componentKey] = filters[componentKey];
      return prev;
    }, {});

    this.tableStates[model['#']] = { ...(this.tableStates[model['#']] || {}), pagination, filters, sorter };

    this.controller.request(model['#request']);

    this.changeTwoWayBindValue(model);

    props.onChange && props.onChange(...args);
  }

  /**
   * change some table value
   * @param model
   */
  @action
  private changeTwoWayBindValue(model) {
    const { filters, pagination } = this.tableStates[model['#']];
    const column = model.columns.find(col => !!col.filteredValue);
    if (model instanceof ViewNode) {
      model.update({ pagination });
    }
    if (column) {
      column.filteredValue = filters[column.dataIndex] || [];
    }
  }

  public destroyPlugin() {
    super.destroyPlugin();
    this.tableStates = {};
    // @ts-ignore
    this.tableWrapMap = undefined;
  }
}
