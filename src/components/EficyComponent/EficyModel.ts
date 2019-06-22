import { ViewSchema } from '../../models';
import { IPlugin, IView } from '../../interface';
import { Field } from '@vmojs/base';

export default class EficyModel extends ViewSchema {
  @Field
  public '#view': string = 'Eficy';
  @Field
  public views: IView[];
  @Field
  public plugins?: IPlugin[];
}
