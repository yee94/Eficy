import type { ColumnType } from 'antd/es/table';
import type { ReactNode } from 'react';

export type FormatColumType = ColumnType<any> & {
  render?: ColumnRender;
  format?: FormatType;
  items?: Omit<FormatColumType, 'items'>[];
};

type ColumnRender = (text: any, record: any, index?: number) => React.ReactNode;

// 基础格式类型
export type BaseFormatType = string | [string, any?, ...any[]];

export interface RenderHelpers {
  formatRender: FormatRender;
  columnArgs: any;
  extraArgs: any[];
  renderEmpty: () => ReactNode;
}

// 渲染器函数类型，支持传入特定的 Props 类型
export type RendererFunction<Props = any> = (
  helpers: RenderHelpers,
) => (text: any, record?: any, index?: number) => ReactNode;

export interface RenderOptions {
  /**
   * 忽略大小写
   * @default true
   */
  ignoreCase?: boolean;
  /**
   * 扩展渲染器
   */
  extendRenders?: Record<string, RendererFunction<any>>;
}

export type FormatRender = (
  format: BaseFormatType,
  options?: RenderOptions,
) => (text: any, record?: any, index?: number) => ReactNode;

// 从渲染器函数中提取 Props 类型
export type ExtractPropsFromRenderer<T extends RendererFunction<any>> = T extends RendererFunction<infer P> ? P : any;

// 从注册的渲染器对象中提取 Props 映射
export type ExtractPropsMap<T extends Record<string, RendererFunction<any>>> = {
  [K in keyof T]: ExtractPropsFromRenderer<T[K]>;
};

// 注册的渲染器类型 - 可以从对象自动推断 Props 类型
export type RegisteredRenderers<
  PropMap extends Record<string, any> = Record<string, any>,
  R extends Record<string, RendererFunction<any>> = {
    [K in keyof PropMap]: RendererFunction<PropMap[K]>;
  },
> = R;

// 推断格式类型
export type InferFormatType<T extends Record<string, RendererFunction<any>>> =
  | keyof T
  | { [K in keyof T]: [K, ExtractPropsFromRenderer<T[K]>?] }[keyof T];

export type InferFormatRender<T extends Record<string, RendererFunction<any>>> = (
  format: InferFormatType<T>,
  options?: RenderOptions,
) => (text: any, record?: any, index?: number) => ReactNode;

// 完整的格式类型 - 为了向后兼容
export type FormatType = string | [string, any?, ...any[]];

/**
 * 可扩展的格式化渲染器接口
 * 支持递归注册和扩展新的渲染器
 */
export interface ExtendableFormatRender<
  T extends Record<string, RendererFunction<any>> = Record<string, RendererFunction<any>>,
> extends InferFormatRender<T> {
  /**
   * 注册新的格式化渲染器
   * @param extendRenders 要注册的渲染器集合
   * @returns 新的可扩展格式化渲染器
   */
  register: <R extends Record<string, RendererFunction<any>>>(extendRenders: R) => ExtendableFormatRender<T & R>;

  /**
   * 扩展当前格式化渲染器
   * @param extendRenders 要扩展的渲染器集合
   * @returns 新的可扩展格式化渲染器
   */
  extend: <R extends Record<string, RendererFunction<any>>>(extendRenders: R) => ExtendableFormatRender<T & R>;
}

/**
 * 通过 formatRender 方法，推断 format 类型
 */
export type InferFormatTypeFromExtendableFormatRender<F extends ExtendableFormatRender<any>> =
  F extends ExtendableFormatRender<infer R> ? InferFormatType<R> : never;
