/**
 * TypeScript 类型定义
 */

import { ComponentType, ReactNode } from 'react';
import { Eficy } from './core/EficyCore';

/**
 * Eficy 组件属性
 */
export interface EficyComponentProps {
  children?: ReactNode;
  [key: string]: any;
}

/**
 * 组件映射类型
 */
export type ComponentMap = Record<string, ComponentType<any>>;

/**
 * Eficy 配置选项
 */
export interface EficyConfig {
  /** 组件映射 */
  components?: ComponentMap;

  /** 是否启用开发模式 */
  development?: boolean;

  /** 是否启用调试日志 */
  debug?: boolean;
}

/**
 * 事件类型
 */
export interface EficyEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source?: string;
}

/**
 * 组件解析结果
 */
export interface ComponentResolution {
  component: ComponentType<any> | string;
  props: Record<string, any>;
  children?: ReactNode;
}

/**
 * Signal 相关类型
 */
export interface SignalProps {
  [key: string]: any;
}

/**
 * 渲染上下文
 */
export interface RenderContext {
  core: Eficy;
  componentRegistry: Map<string, ComponentType<any>>;
  depth: number;
}

/**
 * Hook 类型
 */
export type LifecycleHook<T = any> = (data: T, context: RenderContext) => void | Promise<void>;

/**
 * 生命周期事件
 */
export enum LifecycleEvents {
  BEFORE_RENDER = 'beforeRender',
  AFTER_RENDER = 'afterRender',
  COMPONENT_MOUNT = 'componentMount',
  COMPONENT_UNMOUNT = 'componentUnmount',
  ERROR = 'error',
}

/**
 * 错误信息
 */
export interface EficyError {
  message: string;
  stack?: string;
  component?: string;
  props?: Record<string, any>;
  timestamp: number;
}
