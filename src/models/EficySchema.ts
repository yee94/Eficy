import { action, computed, observable } from 'mobx';
import { Field, Vmo } from '@vmojs/base';
import ViewSchema, { ExtendsViewSchema } from './ViewSchema';
import { IEficySchema, IPlugin, IView } from '../interface';
import { cloneDeep, get, isArray } from '../utils';
import { Hook } from 'plugin-decorator';
import loadComponentModels from '../utils/loadComponentModels';

export default class EficySchema extends Vmo implements IEficySchema {
  @Field
  public plugins: IPlugin[];

  @observable
  public views: ExtendsViewSchema[];
  private readonly componentLibrary: Record<string, any>;

  @computed
  public get viewDataMap(): Record<string, ExtendsViewSchema> {
    return this.views.reduce((prev, next) => Object.assign(prev, next.viewDataMap), {});
  }

  /**
   * get ViewModel by key , include children
   * eg. eficy.alert
   * @param key
   * @returns {unknown}
   */
  public getViewModel(key: string): ExtendsViewSchema {
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
    this.load(cloneDeep(data));
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
    if (isArray(data.views)) {
      data.views.forEach(viewData => {
        const viewModel = this.getViewModel(viewData['#']) as ViewSchema;
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
