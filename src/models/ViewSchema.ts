import { IView } from '../interface';
import * as CSS from 'csstype';
import { Vmo } from '@vmojs/base';
import { Field } from '@vmojs/base/bundle';
import { generateUid, isArray } from '../utils';
import { action, computed, observable } from 'mobx';

export default class ViewSchema extends Vmo implements IView {
  @Field
  public '#view': string;
  @Field
  public '#': string;
  @Field
  public '#children': ViewSchema[];

  @observable
  public '#restProps': Record<string, any>;

  @Field
  @observable
  public className: string;

  @Field
  @observable
  public style: CSS.Properties;

  @action
  protected load(data: IView): this {
    if (!data['#']) {
      data['#'] = generateUid();
    }

    this.update(data);

    return this;
  }

  @computed
  public get viewDataMap(): Record<string, ViewSchema> {
    const reduceFn = (prev, next) => {
      prev[next['#']] = next;
      const childMap = next.viewDataMap;
      if (childMap) {
        Object.assign(prev, childMap);
      }
      return prev;
    };
    return (this['#children'] || []).reduce(reduceFn, { [this['#']]: this });
  }

  @action
  public update(data: IView): this {
    if (!this['#restProps']) {
      this['#restProps'] = {};
    }

    if (isArray(data['#children'])) {
      this['#children'] = data['#children'].map(viewData => new ViewSchema(viewData));

      delete data['#children'];
    }

    Object.keys(data).forEach(key => {
      // @ts-ignore
      if (this.__proto__.hasOwnProperty(key)) {
        this[key] = data[key];
      } else {
        this['#restProps'][key] = data[key];
        if (!this.hasOwnProperty(key)) {
          Object.defineProperty(this, key, {
            enumerable: false,
            get() {
              return this['#restProps'][key];
            },
          });
        }
      }
    });

    return this;
  }

  public forEachChild(cb: (child: ViewSchema) => void) {
    if (isArray(this['#children'])) {
      this['#children'].forEach(child => {
        cb(child);
        if (isArray(child['#children'])) {
          child.forEachChild(cb);
        }
      });
    }
  }
}
