import { observable, computed, action, ObservableClass } from '@eficy/reactive';
import ViewNode from './ViewNode';
import type { IEficySchema, IPlugin } from '../interfaces';
import { isArray } from '../utils';

export default class EficySchema extends ObservableClass implements IEficySchema {
  public plugins: IPlugin[];

  @observable
  public views: ViewNode[] = [];

  @computed
  public get viewDataMap(): Record<string, ViewNode> {
    const result: Record<string, ViewNode> = {};
    
    // 合并所有顶级视图的 viewDataMap
    this.views.forEach(view => {
      Object.assign(result, view.viewDataMap);
    });
    
    return result;
  }

  /**
   * get ViewModel by key , include children
   * eg. eficy.alert
   * @param key
   * @returns {ViewNode | null}
   */
  public getViewModel(key: string): ViewNode | null {
    const steps = `${key}`.split('.');
    const viewMap = this.viewDataMap;
    return steps.reduce<ViewNode | null>(
      (previousValue, currentValue) =>
        previousValue ? previousValue.models[currentValue] : viewMap[currentValue],
      null,
    );
  }

  constructor(data: IEficySchema) {
    super();
    this.load(data);
  }

  @action
  public load(data: IEficySchema): this {
    this.plugins = data.plugins;

    this.views = [];
    if (isArray(data.views)) {
      this.views = data.views.map((viewData) => new ViewNode(viewData));
    }

    return this;
  }

  public updateViews(data: IEficySchema, cb: (viewNode: ViewNode, viewData: any) => void) {
    if (isArray(data.views)) {
      data.views.forEach((viewData) => {
        const viewModel = this.getViewModel(viewData['#']);
        if (viewModel) {
          cb(viewModel, viewData);
        }
      });
    }
  }

  @action
  public update(data: IEficySchema) {
    this.updateViews(data, (viewModel, viewData) => viewModel.update(viewData));
  }

  @action
  public overwrite(data: IEficySchema) {
    this.updateViews(data, (viewModel, viewData) => viewModel.overwrite(viewData));
  }
}
