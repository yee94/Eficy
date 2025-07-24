import { nanoid } from 'nanoid';
import { get, set, has, cloneDeep, isPlainObject, isArray } from 'lodash';
import type { IViewConfig, ISignal, ISignalManager } from '../interfaces';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../container/tokens';

/**
 * 视图节点数据模型
 * 基于reactjs-signal实现响应式数据，替代@vmojs/base
 */
@injectable()
export class ViewNode {
  /**
   * 固定字段，不会转换为信号
   */
  public static readonly SOLID_FIELDS = ['#', '#view', '#children'] as const;
  
  /**
   * 信号存储映射
   */
  private signals: Map<string, ISignal<unknown>> = new Map();
  
  /**
   * 子节点映射
   */
  private childNodeMap: Map<string, ViewNode> = new Map();

  constructor(
    @inject(TOKENS.SIGNAL_MANAGER) private signalManager: ISignalManager,
    data?: IViewConfig
  ) {
    if (data) {
      this.load(data);
    }
  }

  /**
   * 加载数据到ViewNode
   */
  public load(data: IViewConfig): this {
    // 清空现有数据
    this.signals.clear();
    this.childNodeMap.clear();

    // 处理所有属性
    for (const [key, value] of Object.entries(data)) {
      this.setSignal(key, value);
    }

    // 处理子节点
    if (data['#children']) {
      this.processChildren();
    }

    return this;
  }

  /**
   * 设置信号值
   */
  private setSignal<T>(key: string, value: T): void {
    let signal = this.signals.get(key) as ISignal<T>;
    
    if (!signal) {
      signal = this.signalManager.createSignal(value);
      this.signals.set(key, signal);
    } else {
      signal.set(value);
    }
  }

  /**
   * 获取信号
   */
  public getSignal<T>(key: string): ISignal<T> | undefined {
    return this.signals.get(key) as ISignal<T>;
  }

  /**
   * 处理子节点
   */
  private processChildren(): void {
    const childrenSignal = this.getSignal<IViewConfig[]>('#children');
    if (!childrenSignal) return;

    const children = childrenSignal.get();
    if (!isArray(children)) return;

    // 清空现有子节点
    this.childNodeMap.clear();

    children.forEach((childData, index) => {
      if (this.isViewConfig(childData)) {
        const childId = childData['#'] || `child-${index}`;
        const childNode = new ViewNode(this.signalManager, childData);
        this.childNodeMap.set(childId, childNode);
      }
    });
  }

  /**
   * 判断是否为ViewConfig
   */
  private isViewConfig(obj: unknown): obj is IViewConfig {
    return isPlainObject(obj) && typeof (obj as any)['#view'] === 'string';
  }

  /**
   * 获取值
   */
  public get<T>(key: string): T {
    // 特殊处理 #children，返回 ViewNode 数组而不是原始数据
    if (key === '#children') {
      return this.getChildren() as T;
    }
    
    const signal = this.getSignal<T>(key);
    return signal ? signal.get() : undefined as T;
  }

  /**
   * 获取子节点数组
   */
  public getChildren(): ViewNode[] {
    const children: ViewNode[] = [];
    for (const child of this.childNodeMap.values()) {
      children.push(child);
    }
    return children;
  }

  /**
   * 设置值
   */
  public set<T>(key: string, value: T): void {
    this.setSignal(key, value);
    
    // 如果是子节点更新，重新处理子节点
    if (key === '#children') {
      this.processChildren();
    }
  }

  /**
   * 更新数据
   */
  public update(data: Partial<IViewConfig>, skipSolidFields = false): this {
    for (const [key, value] of Object.entries(data)) {
      if (skipSolidFields && ViewNode.SOLID_FIELDS.includes(key as any)) {
        continue;
      }
      this.set(key, value);
    }
    return this;
  }

  /**
   * 覆写数据
   */
  public overwrite(data: IViewConfig): this {
    return this.load(data);
  }

  /**
   * 获取视图数据映射
   */
  public get viewDataMap(): Record<string, ViewNode> {
    const result: Record<string, ViewNode> = {};
    this.childNodeMap.forEach((node, id) => {
      result[id] = node;
    });
    return result;
  }

  /**
   * 遍历子节点
   */
  public forEachChild(callback: (child: ViewNode) => void): void {
    this.childNodeMap.forEach(callback);
  }

  /**
   * 获取子节点
   */
  public getChild(id: string): ViewNode | undefined {
    return this.childNodeMap.get(id);
  }

  /**
   * 销毁节点
   */
  public destroy(): void {
    // 销毁所有子节点
    this.childNodeMap.forEach(child => child.destroy());
    this.childNodeMap.clear();
    
    // 清空信号
    this.signals.clear();
  }

  /**
   * 创建计算信号
   */
  public createComputed<T>(key: string, fn: () => T): ISignal<T> {
    const computed = this.signalManager.createComputed(fn);
    this.signals.set(key, computed);
    return computed;
  }

  /**
   * 订阅信号变化
   */
  public subscribe<T>(key: string, listener: (value: T) => void): () => void {
    const signal = this.getSignal<T>(key);
    if (!signal) {
      throw new Error(`Signal for key "${key}" not found`);
    }
    return signal.subscribe(listener);
  }

  /**
   * 转换为JSON
   */
  public toJSON(): IViewConfig {
    const result: Record<string, unknown> = {};
    
    this.signals.forEach((signal, key) => {
      const value = signal.get();
      if (key === '#children' && isArray(value)) {
        // 递归转换子节点
        result[key] = value.map((child: unknown) => {
          if (this.isViewConfig(child)) {
            const childId = (child as IViewConfig)['#'] || nanoid();
            const childNode = this.childNodeMap.get(childId);
            return childNode ? childNode.toJSON() : child;
          }
          return child;
        });
      } else {
        result[key] = value;
      }
    });

    return result as IViewConfig;
  }
} 