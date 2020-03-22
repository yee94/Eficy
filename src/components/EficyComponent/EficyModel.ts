import { ViewNode } from '../../models';
import { IPlugin, IView } from '../../interface';
import { Field } from '@vmojs/base';
import EficyController from '../../core/Controller';
import { action, computed, observable } from 'mobx';
import { get } from '../../utils';
import UnEnumerable from '../../utils/decorators/UnEnumerable';

export default class EficyModel extends ViewNode {
  @Field
  public '#view': string = 'Eficy';
  @Field
  public views: IView[];
  @Field
  public plugins?: IPlugin[];
  @Field
  public events?: any;
  @Field
  public requests?: any;

  @UnEnumerable
  @observable.ref
  public controller?: EficyController;

  @computed
  public get models() {
    return this.controller ? this.controller.models : {};
  }

  @computed
  public get parentModels() {
    return get(this, 'controller.parentController.models', []);
  }

  @action.bound
  public bindController(controller: EficyController) {
    this.controller = controller;
  }

  @action.bound
  public removeController() {
    this.controller = undefined;
  }
}
