import Config from './Config';
import Controller from '../core/Controller';
import { IView } from '../interface';

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
  update(params: { views: IView[] }, controller: Controller) {
    controller.model.update(params);
  },
  overwrite(params: { views: IView[] }, controller: Controller) {
    controller.model.overwrite(params);
  },
};

export default defaultActions;
