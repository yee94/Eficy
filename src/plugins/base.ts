import EficyController from '../core/Controller';
import { IEficySchema } from '../interface';
import { Plugin } from 'plugin-decorator';

export default class BasePlugin extends Plugin {
  protected controller: EficyController;
  protected transformValues: any; // transform schema values hook

  public loadOptions(data: IEficySchema & any): void {
    // need to extends
  }

  public bindController(param: EficyController) {
    this.controller = param;

    if (this.transformValues) {
      console.time('transform');
      this.transformValues();
      console.timeEnd('transform');

      // @ts-ignore
      this.controller.model.updateViews.addHook((next, newData: IEficySchema) => {
        next();
        this.transformValues(newData);
      });
    }
  }

  public destroyPlugin() {
    // need to extends
  }
}
