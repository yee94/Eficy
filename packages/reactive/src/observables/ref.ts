import { signal } from '../core/signal';
import type { Ref, Signal } from '../types/index';

// ==================== Ref 实现 ====================

/**
 * 创建响应式引用
 */
export function ref<T>(initialValue: T): Ref<T> {
  const sig: Signal<T> = signal(initialValue);
  
  return {
    get value() { 
      return sig(); 
    },
    set value(val: T) { 
      sig(val); 
    }
  };
}

/**
 * 创建只读的响应式引用
 */
export function readonly<T>(value: () => T): Readonly<Ref<T>> {
  const computedValue = () => value();
  
  return {
    get value() {
      return computedValue();
    }
  } as Readonly<Ref<T>>;
}

/**
 * 创建浅响应式引用（对象内部不会深度响应）
 */
export function shallowRef<T>(initialValue: T): Ref<T> {
  // 对于 shallowRef，我们直接使用 signal，因为 alien-signals 默认就是浅响应
  return ref(initialValue);
}

// ==================== Ref 工具函数 ====================

/**
 * 检查是否为 ref
 */
export function isRef<T>(value: unknown): value is Ref<T> {
  if (value === null || value === undefined) {
    return false;
  }
  
  return typeof value === 'object' && 
    'value' in value &&
    Object.getOwnPropertyDescriptor(value, 'value')?.get !== undefined;
}

/**
 * 解包 ref 值
 */
export function unref<T>(value: T | Ref<T>): T {
  return isRef(value) ? value.value : value;
}

/**
 * 将值转换为 ref
 */
export function toRef<T>(value: T | Ref<T>): Ref<T> {
  return isRef(value) ? value : ref(value);
}

/**
 * 将对象的属性转换为 ref
 */
export function toRefs<T extends Record<string, unknown>>(
  object: T
): { [K in keyof T]: Ref<T[K]> } {
  const refs = {} as { [K in keyof T]: Ref<T[K]> };
  
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      refs[key] = ref(object[key]);
    }
  }
  
  return refs;
}

/**
 * 自定义 ref（允许自定义 getter 和 setter）
 */
export function customRef<T>(
  factory: (track: () => void, trigger: () => void) => {
    get: () => T;
    set: (value: T) => void;
  }
): Ref<T> {
  const sig = signal<T>(undefined as T);
  
  const track = () => sig(); // 收集依赖
  const trigger = () => sig(sig()); // 触发更新
  
  const { get, set } = factory(track, trigger);
  
  return {
    get value() {
      return get();
    },
    set value(val: T) {
      set(val);
    }
  };
} 