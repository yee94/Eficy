import { IEficySchema, IPlugin } from '../interface';
import { Field, Vmo } from '@vmojs/base';
import { observable } from 'mobx';
import ViewSchema from './ViewSchema';
import isArray from 'lodash/isArray';

export default class EficySchema extends Vmo implements IEficySchema {
  @Field
  public plugins: IPlugin[];

  @observable
  public views: ViewSchema[];

  protected load(data: IEficySchema): this {
    super.load(data);

    if (isArray(data.views)) {
      this.views = data.views.map(viewData => new ViewSchema(viewData));
    }

    return this;
  }
}
