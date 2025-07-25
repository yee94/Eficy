// ==================== 基础类型 ====================

export type Dispose = () => void;

export type WatchCallback<T> = (newValue: T, oldValue: T) => void;

export type ActionFunction<Args extends any[], Return> = (...args: Args) => Return;

// ==================== Signal 类型 ====================

export interface Signal<T> {
  (): T;
  (value: T): void;
}

export interface ComputedSignal<T> {
  (): T;
}

export interface Ref<T> {
  value: T;
}

// ==================== 数组类型 ====================

export interface ObservableArray<T> {
  value: T[];
  length: number;
  get(index: number): T;
  set(index: number, value: T): void;
  push(...items: T[]): number;
  pop(): T | undefined;
  shift(): T | undefined;
  unshift(...items: T[]): number;
  splice(start: number, deleteCount?: number, ...items: T[]): T[];
  map<U>(callback: (value: T, index: number, array: T[]) => U): U[];
  filter(callback: (value: T, index: number, array: T[]) => boolean): T[];
  find(callback: (value: T, index: number, array: T[]) => boolean): T | undefined;
  indexOf(searchElement: T, fromIndex?: number): number;
  includes(searchElement: T, fromIndex?: number): boolean;
  forEach(callback: (value: T, index: number, array: T[]) => void): void;
  toArray(): T[];
}

// ==================== 对象类型 ====================

export interface ObservableObject<T> {
  value: T;
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
  update(updates: Partial<T>): void;
  delete<K extends keyof T>(key: K): void;
  keys(): (keyof T)[];
  toObject(): T;
}

// ==================== 注解类型 ====================

export interface ReactiveClassDefinition {
  [key: string]: any;
}

export interface AnnotationMetadata {
  $observable?: boolean;
  $computed?: boolean;
  $action?: boolean;
  value?: any;
  get?: () => any;
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

export type Observer<T> = T extends Primitive ? T : T extends any[] ? ObservableArray<T[number]> : ObservableObject<T>; 