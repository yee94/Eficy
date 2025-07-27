import { injectable } from 'tsyringe';
import { merge, cloneDeep } from 'lodash';
import type { IEficyConfig, IExtendOptions } from '../interfaces';

@injectable()
export default class ConfigService {
  private config: IEficyConfig = {
    componentMap: {},
  };

  get<T = any>(key: string): T {
    const keys = key.split('.');
    let result: any = this.config;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return undefined as T;
      }
    }

    return result as T;
  }

  set(key: string, value: any): void {
    const keys = key.split('.');
    let target = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in target) || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }

    target[keys[keys.length - 1]] = value;
  }

  extend(options: IExtendOptions): void {
    this.config = merge(cloneDeep(this.config), options);
  }

  getConfig(): IEficyConfig {
    return cloneDeep(this.config);
  }
}
