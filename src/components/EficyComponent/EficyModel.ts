import { ViewSchema } from '../../models';
import { IEficySchema, IPlugin, IView } from '../../interface';
import { Field } from '@vmojs/base';

export default class EficyModel extends ViewSchema implements IEficySchema {
  @Field
  public '#view' = 'Eficy';
  @Field
  public views: IView[];
  @Field
  public plugins?: IPlugin[];
}
