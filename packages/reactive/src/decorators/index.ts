import { signal, computed as createComputed } from '../core/signal';
import { action as createAction } from '../core/action';
import { observableArray } from '../observables/array';
import { observableObject } from '../observables/object';
import { observableMap, observableSet } from '../observables/collections';
import { isArray, isObject, isMap, isSet } from '../utils/helpers';
import 'reflect-metadata';

// ==================== 装饰器元数据键 ====================

const OBSERVABLE_KEY = Symbol('eficy:observable');
const COMPUTED_KEY = Symbol('eficy:computed');
const ACTION_KEY = Symbol('eficy:action');

// ==================== 类型定义 ====================

interface ObservableMetadata {
  key: string | symbol;
  initialValue?: any;
}

interface ComputedMetadata {
  key: string | symbol;
}

interface ActionMetadata {
  key: string | symbol;
  name?: string;
}

// ==================== 工具函数 ====================

/**
 * 根据值的类型创建合适的 observable
 */
function createObservableForValue(value: any) {
  if (isArray(value)) {
    return observableArray(value);
  }
  if (isMap(value)) {
    return observableMap(value);
  }
  if (isSet(value)) {
    return observableSet(value);
  }
  if (isObject(value) && value.constructor === Object) {
    return observableObject(value);
  }
  return signal(value);
}

// ==================== 装饰器实现 ====================

/**
 * @observable 装饰器 - 将属性标记为可观察的
 */
export function observable<T = any>(target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor): any;
export function observable<T = any>(initialValue?: T): PropertyDecorator;
export function observable<T = any>(targetOrValue?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  // 如果是直接调用装饰器 @observable 或 @observable(value)
  if (propertyKey === undefined) {
    const initialValue = targetOrValue;
    return (target: any, key: string | symbol) => {
      const existingMetadata: ObservableMetadata[] = Reflect.getMetadata(OBSERVABLE_KEY, target) || [];
      existingMetadata.push({ key, initialValue });
      Reflect.defineMetadata(OBSERVABLE_KEY, existingMetadata, target);
    };
  }
  
  // 如果是不带参数的装饰器使用 @observable
  const existingMetadata: ObservableMetadata[] = Reflect.getMetadata(OBSERVABLE_KEY, targetOrValue) || [];
  existingMetadata.push({ key: propertyKey });
  Reflect.defineMetadata(OBSERVABLE_KEY, existingMetadata, targetOrValue);
}

/**
 * @computed 装饰器 - 将 getter 标记为计算属性
 */
export function computed(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  const existingMetadata: ComputedMetadata[] = Reflect.getMetadata(COMPUTED_KEY, target) || [];
  existingMetadata.push({ key: propertyKey });
  Reflect.defineMetadata(COMPUTED_KEY, existingMetadata, target);
  return descriptor;
}

/**
 * @action 装饰器 - 将方法标记为 action
 */
export function action(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;
export function action(name?: string): MethodDecorator;
export function action(targetOrName?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  // 如果是带参数的装饰器 @action(name)
  if (typeof targetOrName === 'string' || targetOrName === undefined) {
    const actionName = targetOrName;
    return (target: any, key: string | symbol, desc: PropertyDescriptor) => {
      const existingMetadata: ActionMetadata[] = Reflect.getMetadata(ACTION_KEY, target) || [];
      existingMetadata.push({ key, name: actionName });
      Reflect.defineMetadata(ACTION_KEY, existingMetadata, target);
      return desc;
    };
  }
  
  // 如果是不带参数的装饰器 @action
  const existingMetadata: ActionMetadata[] = Reflect.getMetadata(ACTION_KEY, targetOrName) || [];
  existingMetadata.push({ key: propertyKey! });
  Reflect.defineMetadata(ACTION_KEY, existingMetadata, targetOrName);
  return descriptor!;
}

// ==================== 核心函数 ====================

/**
 * 简化版 makeObservable - 只做简单的代理工作
 */
export function makeObservable<T extends object>(instance: T, annotations?: Record<string | symbol, any>): T {
  const ctor = instance.constructor;

  if (annotations) {
    // 方案3: 基于配置对象的方式
    for (const [key, annotation] of Object.entries(annotations)) {
      if (annotation === observable) {
        const currentValue = (instance as any)[key];
        let observableInstance = createObservableForValue(currentValue);
        
        // 创建 setter 函数
        const createSetter = () => (value: any) => {
          // 智能类型检测：如果新值的类型与当前 observable 不匹配，重新创建
          const needsRecreation = (
            (isArray(value) && typeof observableInstance === 'function') ||
            (!isArray(value) && typeof observableInstance !== 'function')
          );
          
          if (needsRecreation) {
            observableInstance = createObservableForValue(value);
            
            // 重新定义属性以更新闭包中的 observableInstance
            Object.defineProperty(instance, key, {
              get() {
                return typeof observableInstance === 'function' ? observableInstance() : observableInstance;
              },
              set: createSetter(), // 创建新的 setter
              enumerable: true,
              configurable: true
            });
          } else {
            // 类型匹配，直接更新值
            if (typeof observableInstance === 'function') {
              observableInstance(value);
            }
          }
        };
        
        // 创建正确的 getter/setter
        Object.defineProperty(instance, key, {
          get() {
            return typeof observableInstance === 'function' ? observableInstance() : observableInstance;
          },
          set: createSetter(),
          enumerable: true,
          configurable: true
        });
      } else if (annotation === computed) {
        const descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, key);
        if (descriptor?.get) {
          const originalGetter = descriptor.get;
          const computedInstance = createComputed(() => originalGetter.call(instance));
          Object.defineProperty(instance, key, {
            get: () => computedInstance(),
            enumerable: true,
            configurable: false
          });
        }
      } else if (annotation === action) {
        const originalMethod = (instance as any)[key];
        if (typeof originalMethod === 'function') {
          (instance as any)[key] = createAction(originalMethod.bind(instance));
        }
      }
    }
  } else {
    // 方案1: 基于装饰器元数据的方式 - 暂时留空，让我们先实现其他方案
    // TODO: 实现装饰器方案的简化版本
  }

  return instance;
}

/**
 * 方案1: 基础响应式类（自动调用 makeObservable）
 */
export class ObservableClass {
  constructor() {
    makeObservable(this);
  }
}

// ==================== 方案2: 现代装饰器实现 ====================

/**
 * 现代装饰器版本的 @observable（需要配合 accessor 关键字）
 */
export function observableAccessor<T>(
  target: ClassAccessorDecoratorTarget<any, T>,
  context: ClassAccessorDecoratorContext<any, T>
): ClassAccessorDecoratorResult<any, T> {
  return {
    get() {
      // 获取内部存储的 observable
      const key = `__observable_${String(context.name)}`;
      if (!(key in this)) {
        // 首次访问时创建 observable
        const initialValue = target.get?.call(this);
        this[key] = createObservableForValue(initialValue);
      }
      const observable = this[key];
      return typeof observable === 'function' ? observable() : observable;
    },
    set(value: T) {
      const key = `__observable_${String(context.name)}`;
      if (!(key in this)) {
        this[key] = createObservableForValue(value);
      } else {
        const observable = this[key];
        if (typeof observable === 'function') {
          observable(value);
        } else {
          // 重新创建 observable
          this[key] = createObservableForValue(value);
        }
      }
    }
  };
}

// ==================== 导出 ====================

export { OBSERVABLE_KEY, COMPUTED_KEY, ACTION_KEY };
export type { ObservableMetadata, ComputedMetadata, ActionMetadata }; 