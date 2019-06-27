import EficyController from '../core/Controller';
import { IEficySchema } from '../interface';
import { Plugin } from 'plugin-decorator';

export default class BasePlugin extends Plugin {
  protected controller: EficyController;
  protected transformValues: any; // transform schema values hook
  protected disposeArr: Array<() => void> = [];

  public loadOptions(data: IEficySchema & any): void {
    // need to extends
  }

  public bindController(param: EficyController) {
    this.controller = param;

    if (this.transformValues) {
      this.transformValues();

      const transformFn = (next, newData: IEficySchema) => {
        next();
        this.transformValues(newData);
      };
      // @ts-ignore
      this.controller.model.updateViews.addHook(transformFn);
      this.disposeArr.push(
        // @ts-ignore
        () => this.controller.model.updateViews.removeHook(transformFn),
      );
    }
  }

  public destroyPlugin() {
    while (this.disposeArr.length) {
      const disposeFn = this.disposeArr.pop();
      disposeFn && disposeFn();
    }

    // @ts-ignore
    this.controller = undefined;
  }
}
