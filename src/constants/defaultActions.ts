import Config from './Config';
import Controller from '../core/Controller';
import { IEficySchema, IView } from '../interface';
import { isObject } from '../utils';

export type IAction = (params: any, controller: Controller) => void;

const defaultActions: Record<string, IAction> = {
  success: (params: { msg: string }) => Config.successAlert(params),
  fail: (params: { msg: string }) => Config.failAlert(params),
  jump(params: { duration?: number; href: string }) {
    const { duration = 500 } = params;
    setTimeout(() => (location.href = params.href || location.href), duration);
  },
  successLink(params: { msg: string; duration?: number; href: string }) {
    this.success(params);
    this.jump(params);
  },
  failLink(params: { msg: string; duration?: number; href: string }) {
    this.fail(params);
    this.jump(params);
  },
  update(params: Record<string, IView> | IView | IView[], controller: Controller) {
    if (isObject(params) && !('#' in params)) {
      // @ts-ignore
      params = Object.entries(params).map(([id, item]) => ({ '#': id, ...item }));
    }
    controller.model.update({ views: params instanceof Array ? params : [params] });
  },
  overwrite(params: IView | IView[], controller: Controller) {
    if (isObject(params) && !('#' in params)) {
      // @ts-ignore
      params = Object.entries(params).map(([id, item]) => ({ '#': id, ...item }));
    }
    controller.model.overwrite({ views: params instanceof Array ? params : [params] });
  },
  refresh(params: IEficySchema, controller: Controller) {
    controller.model.load(params);
  },
  reload(params: IEficySchema, controller: Controller) {
    controller.reload(params);
  },
};

export default defaultActions;
