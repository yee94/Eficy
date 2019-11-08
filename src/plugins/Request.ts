import BasePlugin from './base';
import EficyController from '../core/Controller';
import axios, { Method } from 'axios';
import { IActionProps, IEficySchema } from '../interface';
import { cloneDeep, generateUid, isArray, isEficyAction, toArr } from '../utils';

declare module '../core/Controller' {
  export default interface EficyController {
    request: (requestParams: IRequest & { '#'?: string } | string) => Promise<IActionProps>;
  }
}

type IBefore = (config: any, controller: EficyController) => IActionProps | void;
type IFormat = (beforeData: any) => IActionProps;

export interface IRequest {
  '#'?: string;
  url?: string;
  immediately?: boolean;
  method?: Method;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  before?: IBefore | IBefore[];
  format?: IFormat | IFormat[];
}

export default class Request extends BasePlugin {
  public static pluginName: string = 'request';
  private needImmediatelyRequests: IRequest[] = [];
  public static defaultFormat(resData): IActionProps {
    return resData;
  }
  public static async request(requestParams: IRequest): Promise<IActionProps | IActionProps[]> {
    const {
      url = '',
      headers = {},
      method = 'GET',
      data = {},
      params = {},
      format = this.defaultFormat,
    } = requestParams;

    try {
      const res = await axios({ url, method, data, params, headers });
      if (!res.data) {
        throw new Error('no data return');
      }
      debugger
      const result = toArr(format).map(formatFn => formatFn(res.data));
      return result.length === 1 ? result[0] : result;
    } catch (e) {
      return {
        action: 'fail',
        data: { msg: e.message },
      };
    }
  }

  public loadOptions(data: IEficySchema & { requests?: IRequest | IRequest[] }) {
    let { requests } = data;
    if (requests && !isArray(requests)) {
      requests = [requests];
    }
    this.options.requests = requests || [];
  }

  private requestMap: Record<string, IRequest> = {};

  public async request(requestParams: IRequest & { '#'?: string } | string) {
    if (typeof requestParams === 'string') {
      requestParams = { '#': requestParams };
    }
    const { '#': id = '', ...restConfig } = requestParams;
    const presetRequestConfig = this.requestMap[id] || {};

    const requestConfig = this.controller.replaceVariables(
      cloneDeep(Object.assign({}, presetRequestConfig, restConfig)),
    );

    if (requestConfig.before) {
      toArr(requestConfig.before).forEach(before => {
        const beforeAction = before(requestConfig, this.controller);
        if (beforeAction && isEficyAction(beforeAction)) {
          this.controller.run(beforeAction);
        }
      });
    }

    const action = await Request.request(requestConfig);

    toArr(action).forEach(act => this.controller.run(act));

    return action;
  }

  public bindController(param: EficyController) {
    super.bindController(param);
    this.controller.request = this.request.bind(this);
    this.options.requests.forEach(request => this.addRequest(request));
    this.loadViewRequest();
    this.runImmediatelyRequests();
  }

  private loadViewRequest() {
    const viewDataMap = this.controller.model.viewDataMap;
    Object.keys(viewDataMap).forEach(key => {
      const { '#request': requestOpt } = viewDataMap[key] as any;
      if (requestOpt) {
        this.addRequest(requestOpt);
      }
    });
  }

  private addRequest(request: IRequest) {
    if (!request['#']) {
      request['#'] = generateUid();
    }

    if (request.immediately === true) {
      this.needImmediatelyRequests.push(request);
    }

    this.requestMap[request['#']] = request;
  }

  private runImmediatelyRequests() {
    this.needImmediatelyRequests.forEach(this.request.bind(this));
  }
}
