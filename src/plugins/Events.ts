import BasePlugin from './base';
import EficyController from '../core/Controller';

export interface IEvent {
  publisher:
    | string // form@onSubmit
    | {
        '#': string;
        action: string;
      };
  listeners: Array<{
    '#': string;
    fn: (...args: any[]) => void;
  }>;
}

export default class Events extends BasePlugin {
  public static pluginName: string = 'events';

  public bindController(param: EficyController) {
    super.bindController(param);
    const viewDataMap = this.controller.model.viewDataMap;
    console.log(viewDataMap, this.controller.model);
  }
}
