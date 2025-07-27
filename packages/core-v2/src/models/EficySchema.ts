import { action, computed, observable } from 'mobx';
import { Field, Vmo } from '@vmojs/base';
import ViewNode, { ExtendsViewNode } from './ViewNode';
import { IEficySchema, IPlugin, IView } from '../interface';
import { get, isArray } from '../utils';
import { Hook, Plugin } from 'plugin-decorator';
import loadComponentModels from '../utils/loadComponentModels';

export default class EficySchema extends Plugin implements IEficySchema {
  public plugins: IPlugin[];

  @observable
  public views: ExtendsViewNode[];
  private readonly componentLibrary: Record<string, any>;

  @computed
  public get viewDataMap(): Record<string, ExtendsViewNode> {
    return this.views.reduce((prev, next) => Object.assign(prev, next.viewDataMap), {});
  }

  /**
   * get ViewModel by key , include children
   * eg. eficy.alert
   * @param key
   * @returns {unknown}
   */
  public getViewModel(key: string): ExtendsViewNode {
    const steps = `${key}`.split('.');
    const viewMap = this.viewDataMap;
    return steps.reduce(
      (previousValue, currentValue) =>
        previousValue ? get(previousValue, `models.${currentValue}`) : viewMap[currentValue],
      null,
    );
  }

  constructor(data: IEficySchema, componentLibrary = {}) {
    super({});
    this.componentLibrary = componentLibrary;
    this.load(data);
  }

  @action
  public load(data: IEficySchema): this {
    this.plugins = data.plugins;

    const componentModels = loadComponentModels(this.componentLibrary);

    this.views = [];
    if (isArray(data.views)) {
      this.views = data.views.map((viewData) => new ViewNode(viewData, componentModels));
    }

    return this;
  }

  @Hook
  public updateViews(data: IEficySchema, cb: (viewNode: ViewNode, viewData: IView) => void) {
    if (isArray(data.views)) {
      data.views.forEach((viewData) => {
        const viewModel = this.getViewModel(viewData['#']) as ViewNode;
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
