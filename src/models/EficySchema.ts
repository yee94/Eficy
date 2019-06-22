import { action, computed, observable } from 'mobx';
import { Field, Vmo } from '@vmojs/base';
import ViewSchema from './ViewSchema';
import { IEficySchema, IPlugin, IView } from '../interface';
import { isArray } from '../utils';
import { Hook } from 'plugin-decorator';
import Config from '../constants/Config';
import loadComponentModels from '../utils/loadComponentModels';

export default class EficySchema extends Vmo implements IEficySchema {
  @Field
  public plugins: IPlugin[];

  @observable
  public views: ViewSchema[];
  private readonly componentLibrary: Record<string, any>;

  @computed
  public get viewDataMap(): Record<string, ViewSchema> {
    return this.views.reduce((prev, next) => Object.assign(prev, next.viewDataMap), {});
  }

  constructor(data: IEficySchema, componentLibrary = global[Config.defaultComponentMapName] || {}) {
    super({});
    this.componentLibrary = componentLibrary;
    this.load(data);
  }

  @action
  public load(data: IEficySchema): this {
    super.load(data);

    const componentModels = loadComponentModels(this.componentLibrary);

    this.views = [];
    if (isArray(data.views)) {
      this.views = data.views.map(viewData => new ViewSchema(viewData, componentModels));
    }

    return this;
  }

  @Hook
  public updateViews(data: IEficySchema, cb: (viewSchema: ViewSchema, viewData: IView) => void) {
    const viewMap = this.viewDataMap;
    if (isArray(data.views)) {
      data.views.forEach(viewData => {
        const viewModel = viewMap[viewData['#']] as ViewSchema;
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
