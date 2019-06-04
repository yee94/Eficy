import { IView } from '../interface';
import * as CSS from 'csstype';
import { Vmo } from '@vmojs/base';
import { Field } from '@vmojs/base/bundle';
import { generateUid } from '../utils';

export default class ViewSchema extends Vmo implements IView {
  @Field
  public '#view': string;
  @Field
  public '#': string;
  @Field
  public '#className': string;
  @Field
  public '#style': CSS.Properties;

  protected load(data: IView): this {
    if (!data['#']) {
      data['#'] = generateUid();
    }

    Object.keys(data).forEach(key => {
      this[key] = data[key];
    });

    return this;
  }
}
