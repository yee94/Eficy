// ==================== 基础类型 ====================

export type Dispose = () => void;

export type WatchCallback<T> = (newValue: T, oldValue: T) => void;

export type ActionFunction<Args extends any[], Return> = (...args: Args) => Return;

// 信号标记符号
export const SIGNAL_MARKER: symbol = Symbol('__EFICY_SIGNAL__');

// ==================== Signal 类型 ====================

export interface Signal<T> {
  (): T;
  (value: T): T;
  (value: (prev: T) => T): T;
}

export type ComputedSignal<T> = () => T;

export interface Ref<T> {
  value: T;
}

export interface ReactiveClassDefinition {
  [key: string]: any;
}

export interface AnnotationMetadata {
  $observable?: boolean;
  $computed?: boolean;
  $action?: boolean;
  value?: any;
  get?: (this: any) => any;
}

// ==================== 批处理类型 ====================

export interface BatchOptions {
  fireImmediately?: boolean;
}

export interface ActionOptions {
  name?: string;
}

// ==================== 工具类型 ====================

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Primitive = string | number | boolean | null | undefined | symbol | bigint;

export type Observer<T> = T extends Primitive ? T : Signal<T>; 