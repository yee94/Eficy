import type { ReactElement, ComponentType, ReactNode } from 'react';
import type EficyNode from '../models/EficyNode';
import type EficyNodeStore from '../models/EficyNodeStore';

/**
 * 视图数据接口 - 原始的JSON结构
 */
export interface IViewData {
  '#'?: string; // 唯一标识
  '#view'?: string; // 组件类型
  '#children'?: IViewData[]; // 子节点数据
  '#content'?: string | ReactElement; // 内容
  '#if'?: boolean | (() => boolean); // 条件渲染
  '#show'?: boolean | (() => boolean); // 显示/隐藏
  '#style'?: Record<string, any>; // 样式
  '#class'?: string | string[]; // CSS类名
  '#events'?: Record<string, any>; // 事件处理器
  '#staticProps'?: Record<string, any>; // 静态属性

  // 动态属性
  [key: string]: any;
}

/**
 * 插件接口
 */
export interface IPlugin {
  name: string;
  version?: string;
  install?: (eficy: any) => void;
  [key: string]: any;
}

/**
 * Schema 接口 - 保持原有的出口协议不变
 */
export interface IEficySchema {
  views: IViewData[];
  plugins?: IPlugin[];
  [key: string]: any;
}

/**
 * 视图节点接口 - EficyNode的抽象
 */
export interface IViewNode {
  '#': string;
  '#view': string;
  '#children': IViewNode[];
  '#content'?: string | ReactElement;
  '#if'?: boolean | (() => boolean);
  '#show'?: boolean | (() => boolean);
  '#style'?: Record<string, any>;
  '#class'?: string | string[];
  '#events'?: Record<string, any>;

  readonly id: string;
  readonly props: Record<string, any>;
  readonly shouldRender: boolean;
  readonly viewDataMap: Record<string, IViewNode>;

  updateField(key: string, value: any): void;
  addChild(child: IViewNode): void;
  removeChild(childId: string): void;
  findChild(childId: string): IViewNode | null;
  toJSON(): IViewData;
}

/**
 * 组件映射表接口
 */
export interface IComponentMap {
  [componentName: string]: ComponentType<any> | string;
}

/**
 * RenderNode组件的Props接口
 */
export interface IRenderNodeProps {
  eficyNode: EficyNode;
  childrenMap: Map<string, ReactElement>;
  componentMap?: IComponentMap;
}

/**
 * EficyNodeStore接口 - 内部节点树管理器
 */
export interface IEficyNodeStore {
  readonly root: EficyNode | null;
  readonly nodes: Record<string, EficyNode>;
  readonly stats: {
    totalNodes: number;
    rootNodeId: string | null;
    hasRoot: boolean;
  };

  build(views: IViewData | IViewData[]): void;
  findNode(nodeId: string): EficyNode | null;
  updateNode(nodeId: string, data: Partial<IViewData>): void;
  addChild(parentId: string, childData: IViewData): EficyNode | null;
  removeChild(parentId: string, childId: string): void;
  rebuild(): void;
  clear(): void;
  toJSON(): IViewData | null;
}

/**
 * Eficy主类的Props接口
 */
export interface IEficyProps {
  views: IViewData | IViewData[];
  componentMap?: IComponentMap;
  onNodeTreeChange?: (tree: EficyNodeStore) => void;
}

/**
 * Eficy配置接口
 */
export interface IEficyConfig {
  enableDebugLogs?: boolean;
  autoRebuild?: boolean;
  strictMode?: boolean;
  componentMap?: IComponentMap;
}

/**
 * Eficy扩展选项接口
 */
export interface IExtendOptions {
  enableDebugLogs?: boolean;
  autoRebuild?: boolean;
  strictMode?: boolean;
  componentMap?: IComponentMap;
}

// 导出类型别名以保持向后兼容
export type ViewData = IViewData;
export type ViewNode = IViewNode;
export type ComponentMap = IComponentMap;
export type EficyProps = IEficyProps;
export type EficyConfig = IEficyConfig;
export type ExtendOptions = IExtendOptions;
export type EficySchema = IEficySchema;

export interface IComponentRegistry {
  register(name: string, component: ComponentType<any> | string): void;
  unregister(name: string): void;
  get(name: string): ComponentType<any> | string | null;
  getAll(): Record<string, ComponentType<any> | string>;
  extend(componentMap: Record<string, ComponentType<any> | string>): void;
}
