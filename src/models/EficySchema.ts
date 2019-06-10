import { action, computed, observable } from 'mobx';
import { Field, Vmo } from '@vmojs/base';
import ViewSchema from './ViewSchema';
import { IEficySchema, IPlugin } from '../interface';
import { isArray } from '../utils';
import { IEvent } from '../plugins/Events';

export default class EficySchema extends Vmo implements IEficySchema {
  @Field
  public events: IEvent[];
  @Field
  public plugins: IPlugin[];

  @observable
  public views: ViewSchema[];

  @computed
  public get viewDataMap(): Record<string, ViewSchema> {
    return this.views.reduce((prev, next) => Object.assign(prev, next.viewDataMap), {});
  }

  @action
  protected load(data: IEficySchema): this {
    super.load(data);

    if (isArray(data.views)) {
      this.views = data.views.map(viewData => new ViewSchema(viewData));
    }

    return this;
  }

  @action
  public update(data: IEficySchema) {
    const viewMap = this.viewDataMap;
    if (isArray(data.views)) {
      data.views.map(viewData => {
        const viewModel = viewMap[viewData['#']] as ViewSchema;
        if (viewModel) {
          viewModel.update(viewData);
        }
      });
    }
  }
}
