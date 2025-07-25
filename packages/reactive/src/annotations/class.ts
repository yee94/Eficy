import { signal, computed as createComputed } from '../core/signal';
import { action } from '../core/action';
import type { ReactiveClassDefinition, AnnotationMetadata } from '../types/index';

// ==================== 注解式类定义 ====================

/**
 * 创建带注解的响应式类
 */
export function defineReactiveClass<T extends ReactiveClassDefinition>(
  definition: T
): T {
  const reactiveInstance = {} as Record<string, unknown>;
  
  // 首先创建所有的 observable 属性
  for (const key in definition) {
    if (Object.prototype.hasOwnProperty.call(definition, key)) {
      const value = definition[key];
      
      // 如果是带注解的属性且是 observable
      if (isAnnotationMetadata(value) && value.$observable) {
        reactiveInstance[key] = signal(value.value);
      }
      // 普通属性，默认设为响应式
      else if (!isAnnotationMetadata(value) && typeof value !== 'function') {
        reactiveInstance[key] = signal(value);
      }
    }
  }
  
  // 然后创建计算属性（这样它们可以访问已创建的 observable 属性）
  for (const key in definition) {
    if (Object.prototype.hasOwnProperty.call(definition, key)) {
      const value = definition[key];
      
      // 如果是带注解的计算属性
      if (isAnnotationMetadata(value) && value.$computed && value.get) {
        reactiveInstance[key] = createComputed(() => {
          // 在计算函数中，this 指向 reactiveInstance
          return value.get?.call(reactiveInstance);
        });
      }
    }
  }
  
  // 最后创建方法和 actions
  for (const key in definition) {
    if (Object.prototype.hasOwnProperty.call(definition, key)) {
      const value = definition[key];
      
      // 如果是函数
      if (typeof value === 'function') {
        // 检查是否标记为 action
        if (isActionAnnotated(value)) {
          reactiveInstance[key] = action(value.bind(reactiveInstance));
        } else {
          reactiveInstance[key] = value.bind(reactiveInstance);
        }
      }
    }
  }
  
  return reactiveInstance as T;
}

// ==================== 注解工具函数 ====================

/**
 * 检查是否为注解元数据
 */
function isAnnotationMetadata(value: unknown): value is AnnotationMetadata {
  return value !== null && 
    typeof value === 'object' && 
    ('$observable' in value || '$computed' in value || '$action' in value);
}

/**
 * 检查函数是否标记为 action
 */
function isActionAnnotated(fn: unknown): boolean {
  return typeof fn === 'function' && 
    Object.prototype.hasOwnProperty.call(fn, '$action') && 
    ((fn as unknown) as Record<string, unknown>).$action === true;
}

// ==================== 注解装饰器 ====================

/**
 * Observable 注解
 */
export function observable<T>(initialValue: T): AnnotationMetadata {
  return {
    $observable: true,
    value: initialValue
  };
}

/**
 * Computed 注解
 */
export function computed<T>(getter: () => T): AnnotationMetadata {
  return {
    $computed: true,
    get: getter
  };
}

/**
 * Action 注解
 */
export function actionAnnotation<T extends (...args: unknown[]) => unknown>(fn: T): T {
  ((fn as unknown) as Record<string, unknown>).$action = true;
  return fn;
}

// ==================== 高级注解 ====================

/**
 * 自动绑定方法
 */
export function autobind<T extends ReactiveClassDefinition>(
  target: T
): T {
  const bound = {} as T;
  
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      const value = target[key];
      if (typeof value === 'function') {
        bound[key] = value.bind(bound);
      } else {
        bound[key] = value;
      }
    }
  }
  
  return bound;
}

/**
 * 只读注解
 */
export function readonly<T>(getter: () => T): AnnotationMetadata {
  return {
    $computed: true,
    get: getter
  };
} 