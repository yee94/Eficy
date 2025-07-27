import { IView } from '../interface';
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
import { CSSProperties } from 'react';

type IComponentsModels = Record<string, new (...args: any) => ViewNode>;
export type ExtendsViewNode = ViewNode & any;

export default class ViewNode extends Vmo implements IView {
  public static readonly solidField = ['#', '#view', '#restProps'];
  public static isInstance(someObject: any): boolean {
    return someObject.__proto__.constructor.name === ViewNode.name;
  }

  @UnEnumerable
  private readonly componentModels: IComponentsModels;

  constructor(data: IView, componentModels: IComponentsModels = {}) {
    super();

    this.componentModels = componentModels || {};
    const foundModel = this.componentModels[data['#view']];

    if (foundModel && ViewNode.isInstance(this)) {
      // @ts-ignore
      return new foundModel(data, componentModels);
    } else {
      this.load(data);
    }
  }

  @Field
  public '#view': string;
  @Field
  public '#': string;

  @Field
  @observable.ref
  public '#children': ViewNode[];

  @Field
  public '#staticProps': Record<string, any> = {};

  @Field
  @observable
  public '#if': boolean;

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
  public style: CSSProperties;

  @action
  protected load(data: IView): this {
    if (!data) {
      return this;
    }
    if (!data['#']) {
      data['#'] = generateUid();
    }

    if (!('#if' in data)) {
      data['#if'] = true;
    }

    this.update(data, true);

    return this;
  }

  @computed
  public get viewDataMap(): Record<string, ExtendsViewNode> {
    const viewMaps = { [this['#']]: this };
    const extendViewMap = (viewNode: ViewNode) => {
      const childMap = viewNode.viewDataMap;
      if (childMap) {
        Object.assign(viewMaps, childMap);
      }
    };
    (this['#children'] || []).forEach(extendViewMap);

    forEachDeep(this['#restProps'], (optionValue) => {
      if (optionValue instanceof ViewNode) {
        extendViewMap(optionValue);
      }

      return optionValue;
    });

    return viewMaps;
  }

  @action
  private transformViewNode(data: IView) {
    return mapDeep(
      data,
      (value: IView, path) => {
        if (!path) {
          return value;
        }
        if (isEficyView(value) && !(value instanceof ViewNode)) {
          return new ViewNode(value, this.componentModels);
        }
        return value;
      },
      {
        exceptFns: [...Config.loopExceptFns, (obj) => obj['#view'] === 'Eficy'],
      },
    );
  }

  @action
  public overwrite(data: IView) {
    [...Object.keys(this), ...Object.keys(this['#restProps'])].forEach((key) => {
      if (ViewNode.solidField.includes(key)) {
        return;
      }
      const originValue = ViewNode.prototype[key];
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

    data = this.transformViewNode(data);

    Object.keys(data).forEach((key) => {
      if (!isInit && ViewNode.solidField.includes(key)) {
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

  public forEachChild(cb: (child: ViewNode) => void) {
    if (isArray(this['#children'])) {
      this['#children'].forEach((child) => {
        cb(child);
        if (isArray(child['#children'])) {
          child.forEachChild(cb);
        }
      });
    }
  }
}
