import { IView } from '../interface';
import * as CSS from 'csstype';
import { Vmo } from '@vmojs/base';
import { Field } from '@vmojs/base/bundle';
import { generateUid, isArray, isEficyView } from '../utils';
import { action, computed, observable } from 'mobx';
import { mapObjectDeep } from '../utils';

export default class ViewSchema extends Vmo implements IView {
  @Field
  public '#view': string;
  @Field
  public '#': string;
  @Field
  public '#content': string;
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

  @action.bound
  private transformViewSchema(data: IView) {
    return mapObjectDeep(data, (value, path) => {
      if (!path) {
        return value;
      }
      if (isEficyView(value) && !(value instanceof ViewSchema)) {
        return new ViewSchema(value);
      }
      return value;
    });
  }

  @action.bound
  public update(data: IView): this {
    if (!this['#restProps']) {
      this['#restProps'] = {};
    }

    data = this.transformViewSchema(data);

    Object.keys(data).forEach(key => {
      // @ts-ignore
      if (this.__proto__.hasOwnProperty(key)) {
        this[key] = data[key];
      } else {
        this['#restProps'][key] = data[key];
        if (!this.hasOwnProperty(key)) {
          Object.defineProperty(this, key, {
            enumerable: true,
            get() {
              return this['#restProps'][key];
            },
            set(val) {
              this['#restProps'][key] = val;
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
