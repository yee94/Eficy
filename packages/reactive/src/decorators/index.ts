import { signal, computed as computedSignal } from '../core/signal';
import { action as createAction } from '../core/action';
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

// ==================== 装饰器实现 ====================

/**
 * @Observable 装饰器 - 将属性转换为 signal
 *
 * 使用示例：
 * @Observable name = 'John';
 * @Observable(0) count!: number;
 */
export function observable<T = any>(target: any, propertyKey: string | symbol, descriptor?: PropertyDescriptor): any;
export function observable<T = any>(initialValue?: T): PropertyDecorator;
export function observable<T = any>(
  targetOrValue?: any,
  propertyKey?: string | symbol,
  descriptor?: PropertyDescriptor,
): any {
  // 如果是直接调用装饰器 @Observable 或 @Observable(value)
  if (propertyKey === undefined) {
    const initialValue = targetOrValue;
    return (target: any, key: string | symbol) => {
      const existingMetadata: ObservableMetadata[] = Reflect.getMetadata(OBSERVABLE_KEY, target) || [];
      existingMetadata.push({ key, initialValue });
      Reflect.defineMetadata(OBSERVABLE_KEY, existingMetadata, target);
    };
  }

  // 如果是不带参数的装饰器使用 @Observable
  const existingMetadata: ObservableMetadata[] = Reflect.getMetadata(OBSERVABLE_KEY, targetOrValue) || [];
  existingMetadata.push({ key: propertyKey });
  Reflect.defineMetadata(OBSERVABLE_KEY, existingMetadata, targetOrValue);
}

/**
 * @Computed 装饰器 - 将 getter 转换为 computed signal
 *
 * 使用示例：
 * @Computed get fullName() { return this.firstName + ' ' + this.lastName; }
 */
export function computed(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  const existingMetadata: ComputedMetadata[] = Reflect.getMetadata(COMPUTED_KEY, target) || [];
  existingMetadata.push({ key: propertyKey });
  Reflect.defineMetadata(COMPUTED_KEY, existingMetadata, target);
  return descriptor;
}

/**
 * @Action 装饰器 - 将方法包装为 action（批处理）
 *
 * 使用示例：
 * @Action updateProfile() { ... }
 * @Action('save user') save() { ... }
 */
export function action(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor;
export function action(name?: string): MethodDecorator;
export function action(targetOrName?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
  // 如果是带参数的装饰器 @Action(name)
  if (typeof targetOrName === 'string' || targetOrName === undefined) {
    const actionName = targetOrName;
    return (target: any, key: string | symbol, desc: PropertyDescriptor) => {
      const existingMetadata: ActionMetadata[] = Reflect.getMetadata(ACTION_KEY, target) || [];
      existingMetadata.push({ key, name: actionName });
      Reflect.defineMetadata(ACTION_KEY, existingMetadata, target);
      return desc;
    };
  }

  // 如果是不带参数的装饰器 @Action
  const existingMetadata: ActionMetadata[] = Reflect.getMetadata(ACTION_KEY, targetOrName) || [];
  existingMetadata.push({ key: propertyKey! });
  Reflect.defineMetadata(ACTION_KEY, existingMetadata, targetOrName);
  return descriptor!;
}

// ==================== 核心函数 ====================

/**
 * makeObservable - 将类实例转换为响应式对象
 * 基于 signals 本质，简单直接：
 * - @Observable 属性 → signal
 * - @Computed getter → computed signal
 * - @Action 方法 → 批处理包装
 */
export function makeObservable<T extends object>(instance: T, annotations?: Record<string | symbol, any>): T {
  const ctor = instance.constructor;

  if (annotations) {
    // 基于配置对象的方式
    for (const [key, annotation] of Object.entries(annotations)) {
      if (annotation === observable) {
        const currentValue = (instance as any)[key];
        const valueSignal = signal(currentValue);

        Object.defineProperty(instance, key, {
          get: () => valueSignal(),
          set: (newValue: any) => valueSignal(newValue),
          enumerable: true,
          configurable: true,
        });
      } else if (annotation === computed) {
        const descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, key);
        if (descriptor?.get) {
          const originalGetter = descriptor.get;
          const computedInstance = computedSignal(() => originalGetter.call(instance));
          Object.defineProperty(instance, key, {
            get: () => computedInstance(),
            enumerable: true,
            configurable: false,
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
    // 基于装饰器元数据的方式

    // 处理 @Observable 装饰的属性 - 转换为 signal
    const observableMetadata: ObservableMetadata[] = Reflect.getMetadata(OBSERVABLE_KEY, ctor.prototype) || [];
    for (const meta of observableMetadata) {
      const key = meta.key;
      const currentValue = meta.initialValue !== undefined ? meta.initialValue : (instance as any)[key];
      const valueSignal = signal(currentValue);

      Object.defineProperty(instance, key, {
        get: () => valueSignal(),
        set: (newValue: any) => valueSignal(newValue),
        enumerable: true,
        configurable: true,
      });
    }

    // 处理 @Computed 装饰的属性 - 转换为 computed signal
    const computedMetadata: ComputedMetadata[] = Reflect.getMetadata(COMPUTED_KEY, ctor.prototype) || [];
    for (const meta of computedMetadata) {
      const key = meta.key;
      const descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, key);
      if (descriptor?.get) {
        const originalGetter = descriptor.get;
        const computedInstance = computedSignal(() => originalGetter.call(instance));
        Object.defineProperty(instance, key, {
          get: () => computedInstance(),
          enumerable: true,
          configurable: false,
        });
      }
    }

    // 处理 @Action 装饰的方法 - 包装为 action
    const actionMetadata: ActionMetadata[] = Reflect.getMetadata(ACTION_KEY, ctor.prototype) || [];
    for (const meta of actionMetadata) {
      const key = meta.key;
      const originalMethod = (instance as any)[key];
      if (typeof originalMethod === 'function') {
        (instance as any)[key] = createAction(originalMethod.bind(instance));
      }
    }
  }

  return instance;
}

/**
 * ObservableClass - 自动调用 makeObservable 的基类
 *
 * 使用示例：
 * class UserStore extends ObservableClass {
 *   @Observable name = '';
 *   @Computed get displayName() { return this.name || 'Anonymous'; }
 *   @Action updateName(name: string) { this.name = name; }
 * }
 */
export class ObservableClass {
  constructor() {
    makeObservable(this);
  }
}

// ==================== 导出 ====================

export { OBSERVABLE_KEY, COMPUTED_KEY, ACTION_KEY };
export type { ObservableMetadata, ComputedMetadata, ActionMetadata };
