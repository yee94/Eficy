import EficyController from '../core/Controller';
import { IEficySchema } from '../interface';
import { Plugin } from 'plugin-decorator';

export default class BasePlugin extends Plugin {
  protected controller: EficyController;

  public loadOptions(data: IEficySchema & any): void {
    // need to extends
  }

  public bindController(param: EficyController) {
    this.controller = param;
  }
}
