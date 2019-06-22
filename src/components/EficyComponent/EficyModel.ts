import { ViewSchema } from '../../models';
import { IPlugin, IView } from '../../interface';
import { Field } from '@vmojs/base';
import EficyController from '../../core/Controller';
import { action, computed, observable } from 'mobx';

export default class EficyModel extends ViewSchema {
  @Field
  public '#view': string = 'Eficy';
  @Field
  public views: IView[];
  @Field
  public plugins?: IPlugin[];
  @Field
  public events?: any;

  @observable.ref
  public '#controller'?: EficyController;

  @computed
  public get models() {
    return this['#controller'] ? this['#controller'].models : {};
  }

  @action.bound
  public bindController(controller: EficyController) {
    this['#controller'] = controller;
  }

  @action.bound
  public removeController(controller: EficyController) {
    this['#controller'] = undefined;
  }
}
