import { IView } from '../interface';
import * as CSS from 'csstype';
import { Vmo } from '@vmojs/base';
import { Field } from '@vmojs/base/bundle';
import { cloneDeep, deleteObjectField, generateUid, isArray, isEficyView, mapObjectDeep } from '../utils';
import { action, computed, observable } from 'mobx';

export default class ViewSchema extends Vmo implements IView {
  public static readonly solidField = ['#', '#view', '#children', '#restProps'];

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

  @action.bound
  protected load(data: IView): this {
    if (!data['#']) {
      data['#'] = generateUid();
    }

    this.update(data, true);

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
  public overwrite(data: IView) {
    [...Object.keys(this), ...Object.keys(this['#restProps'])].forEach(key => {
      if (ViewSchema.solidField.includes(key)) {
        return;
      }
      const originValue = ViewSchema.prototype[key];
      switch (typeof originValue) {
        case 'function':
        case 'object':
          this[key] = cloneDeep(originValue);
          break;
        case 'undefined':
          deleteObjectField(this, key);
          break;
        default:
          this[key] = originValue;
      }
    });
    // @ts-ignore
    this['#restProps'] = undefined;
    deleteObjectField(this, '#children');

    this.load(data);

    return this;
  }

  @action.bound
  public update(data: IView, isInit = false): this {
    if (!this['#restProps']) {
      this['#restProps'] = {};
      Object.defineProperty(this, '#restProps', {
        enumerable: false,
      });
    }

    data = this.transformViewSchema(data);

    Object.keys(data).forEach(key => {
      if (!isInit && ViewSchema.solidField.includes(key)) {
        if (data[key] === this[key]) {
          return;
        }
        throw new Error(`Can not update static property ${ViewSchema.solidField.join(',')}`);
      }

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
