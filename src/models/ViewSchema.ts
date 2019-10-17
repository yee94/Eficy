import { ExtendsViewSchema, IView } from '../interface';
import * as CSS from 'csstype';
import { Vmo } from '@vmojs/base';
import { Field } from '@vmojs/base/bundle';
import {
  cloneDeep,
  deleteObjectField,
  forEachDeep,
  generateUid,
  isArray,
  isEficyView,
  isObject,
  mapDeep,
  MERGE_WAY,
  mergeWith,
} from '../utils';
import { action, computed, observable } from 'mobx';
import Config from '../constants/Config';
import UnEnumerable from '../utils/decorators/UnEnumerable';

type IComponentsModels = Record<string, new (...args: any) => ViewSchema>;
export type ExtendsViewSchema = ViewSchema & any;

export default class ViewSchema extends Vmo implements IView {
  public static readonly solidField = ['#', '#view', '#restProps'];
  public static isViewSchemaSelf(someObject: any): boolean {
    return someObject.__proto__.constructor.name === ViewSchema.name;
  }

  @UnEnumerable
  private readonly componentModels: IComponentsModels;

  constructor(data: IView, componentModels: IComponentsModels = {}) {
    super();

    this.componentModels = componentModels || {};
    const foundModel = this.componentModels[data['#view']];

    this.load(data);

    if (foundModel && ViewSchema.isViewSchemaSelf(this)) {
      // @ts-ignore
      return new foundModel(data, componentModels);
    }
  }

  @Field
  public '#view': string;
  @Field
  public '#': string;
  @Field
  public '#children': ViewSchema[];

  @Field
  public '#staticProps': Record<string, any> = {};

  @Field
  @observable
  public '#content': string;

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
    if (!data) {
      return this;
    }
    if (!data['#']) {
      data['#'] = generateUid();
    }

    this.update(data, true);

    return this;
  }

  @computed
  public get viewDataMap(): Record<string, ExtendsViewSchema> {
    const viewMaps = { [this['#']]: this };
    const extendViewMap = (viewSchema: ViewSchema) => {
      const childMap = viewSchema.viewDataMap;
      if (childMap) {
        Object.assign(viewMaps, childMap);
      }
    };
    (this['#children'] || []).forEach(extendViewMap);

    forEachDeep(this['#restProps'], optionValue => {
      if (optionValue instanceof ViewSchema) {
        extendViewMap(optionValue);
      }

      return optionValue;
    });

    return viewMaps;
  }

  @action
  private transformViewSchema(data: IView) {
    return mapDeep(
      data,
      (value: IView, path) => {
        if (!path) {
          return value;
        }
        if (isEficyView(value) && !(value instanceof ViewSchema)) {
          return new ViewSchema(value, this.componentModels);
        }
        return value;
      },
      {
        exceptFns: Config.loopExceptFns,
      },
    );
  }

  @action
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

  @action
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
        return;
      }

      // @ts-ignore
      if (this.__proto__.hasOwnProperty(key)) {
        this[key] = data[key];
      } else {
        if (!this.hasOwnProperty(key)) {
          this['#restProps'][key] = data[key];
          Object.defineProperty(this, key, {
            enumerable: true,
            configurable: true,
            get() {
              return this['#restProps'][key];
            },
            set(val) {
              this['#restProps'][key] = val;
            },
          });
        } else {
          if (isObject(data[key])) {
            this[key] = mergeWith(this[key], data[key], MERGE_WAY.REPLACE);
          } else {
            this[key] = data[key];
          }
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
