import { Action, Computed, makeObservable, Observable } from '@eficy/reactive';
import { nanoid } from 'nanoid';
import type { ReactElement } from 'react';
import type { IViewData } from '../interfaces';
import { setOmit } from '../utils/common';
import { processAsyncStateProps } from '../utils/asyncStateResolver';

// 框架特殊字段，不会传递给组件
const FRAMEWORK_FIELDS = new Set([
  '#',
  '#view',
  '#children',
  '#content',
  '#if',
  '#show',
  '#style',
  '#class',
  '#events',
  '#staticProps',
]);

export default class EficyNode {
  // 唯一标识
  public get id(): string {
    return this['#'];
  }

  // 核心字段
  @Observable
  public '#' = '';

  @Observable
  public '#view' = 'div';

  @Observable
  public '#children': EficyNode[] = [];

  @Observable
  public '#content'?: string | ReactElement;

  @Observable
  public '#if'?: boolean | (() => boolean) = true;

  @Observable
  public '#show'?: boolean | (() => boolean) = true;

  @Observable
  public '#style'?: Record<string, any>;

  @Observable
  public '#class'?: string | string[];

  @Observable
  public '#events'?: Record<string, any>;

  // 动态属性存储
  @Observable
  public dynamicProps: Record<string, any> = {};

  // 子模型映射
  @Computed
  get nodeMap(): Record<string, EficyNode> {
    return this['#children'].reduce((acc, child) => {
      acc[child.id] = child;
      return acc;
    }, {} as Record<string, EficyNode>);
  }

  each(callback: (node: EficyNode) => void): void {
    this['#children']?.forEach((child) => {
      callback(child);
      if (child instanceof EficyNode) {
        child.each(callback);
      }
    });
  }

  constructor(data: IViewData) {
    this.load(data);
    makeObservable(this);
  }

  /**
   * 加载ViewData数据
   */
  @Action
  private load(data: IViewData): void {
    // 设置核心字段
    this['#'] = data['#'] || nanoid();
    this['#view'] = data['#view'] || 'div';
    this['#content'] = data['#content'];
    this['#if'] = data['#if'] !== undefined ? data['#if'] : true;
    this['#show'] = data['#show'] !== undefined ? data['#show'] : true;
    this['#style'] = data['#style'];
    this['#class'] = data['#class'];
    this['#events'] = data['#events'];
    this['#children'] = data['#children']?.map((child: IViewData) => EficyNode.fromJSON(child));

    // 设置其他属性
    const otherProps = setOmit(data, FRAMEWORK_FIELDS);
    this.dynamicProps = { ...otherProps };
  }

  /**
   * 计算最终传递给组件的props
   */
  @Computed
  get props(): Record<string, any> {
    let props: Record<string, any> = { ...this.dynamicProps };

    props = processAsyncStateProps(props);

    // 添加样式
    if (this['#style']) {
      props.style = this['#style'];
    }

    // 添加类名
    if (this['#class']) {
      props.className = Array.isArray(this['#class']) ? this['#class'].join(' ') : this['#class'];
    }

    // 添加事件
    if (this['#events']) {
      Object.assign(props, this['#events']);
    }

    return props;
  }

  /**
   * 判断是否应该渲染
   */
  @Computed
  get shouldRender(): boolean {
    const ifCondition = this.evaluateCondition(this['#if']);
    const showCondition = this.evaluateCondition(this['#show']);
    return ifCondition && showCondition;
  }

  private evaluateCondition(condition: boolean | (() => boolean) | undefined): boolean {
    if (condition === undefined) return true;
    if (typeof condition === 'function') {
      try {
        return condition();
      } catch (error) {
        console.error('❌ Error evaluating condition:', error);
        return false;
      }
    }
    return condition;
  }

  /**
   * 更新字段值
   */
  @Action
  updateField(key: string, value: any): void {
    if (FRAMEWORK_FIELDS.has(key)) {
      // 更新框架字段
      (this as any)[key] = value;
    } else {
      // 更新动态属性 - 使用不可变更新
      this.dynamicProps = {
        ...this.dynamicProps,
        [key]: value,
      };
    }
  }

  /**
   * 设置子节点（由外部EficyNodeStore调用）
   */
  @Action
  setChildren(children: EficyNode[]): void {
    this['#children'] = children;
  }

  /**
   * 添加子节点
   */
  @Action
  addChild(child: EficyNode): void {
    if (!(child instanceof EficyNode)) {
      throw new Error('Child must be an instance of EficyNode');
    }
    this['#children'] = [...(this['#children'] ?? []), child];
  }

  /**
   * 移除子节点
   */
  @Action
  removeChild(childId: string): void {
    this['#children'] = this['#children'].filter((child) => child.id !== childId);
  }

  /**
   * 查找子节点
   */
  findChild(childId: string): EficyNode | null {
    return this['#children'].find((child) => child.id === childId) || null;
  }

  /**
   * 获取视图数据映射
   */
  @Computed
  get viewDataMap(): Record<string, EficyNode> {
    const result: Record<string, EficyNode> = { [this.id]: this };

    // 递归合并子节点的 viewDataMap
    this['#children'].forEach((child) => {
      Object.assign(result, child.viewDataMap);
    });

    return result;
  }

  @Computed
  get children(): EficyNode[] | string | ReactElement {
    return this['#children'] ?? this['#content'] ?? null;
  }

  /**
   * 序列化为JSON
   */
  toJSON(): IViewData {
    const result: IViewData = {
      '#': this.id,
      '#view': this['#view'],
      ...this.dynamicProps,
    };

    if (this['#content'] !== undefined) {
      result['#content'] = this['#content'];
    }

    if (this['#if'] !== true) {
      result['#if'] = this['#if'];
    }

    if (this['#show'] !== true) {
      result['#show'] = this['#show'];
    }

    if (this['#style']) {
      result['#style'] = this['#style'];
    }

    if (this['#class']) {
      result['#class'] = this['#class'];
    }

    if (this['#events']) {
      result['#events'] = this['#events'];
    }

    if (!!this['#children']?.length) {
      result['#children'] = this['#children'].map((child) => child.toJSON());
    }

    return result;
  }

  /**
   * 从JSON创建EficyNode
   */
  static fromJSON(data: IViewData): EficyNode {
    return new EficyNode(data);
  }

  /**
   * 更新节点数据
   */
  @Action
  update(data: IViewData): void {
    // 更新核心字段
    if (data['#view'] !== undefined) this['#view'] = data['#view'];
    if (data['#content'] !== undefined) this['#content'] = data['#content'];
    if (data['#if'] !== undefined) this['#if'] = data['#if'];
    if (data['#show'] !== undefined) this['#show'] = data['#show'];
    if (data['#style'] !== undefined) this['#style'] = data['#style'];
    if (data['#class'] !== undefined) this['#class'] = data['#class'];
    if (data['#events'] !== undefined) this['#events'] = data['#events'];

    // 更新动态属性
    const otherProps = setOmit(data, FRAMEWORK_FIELDS);
    this.dynamicProps = { ...this.dynamicProps, ...otherProps };
  }

  /**
   * 完全覆盖节点数据
   */
  @Action
  overwrite(data: IViewData): void {
    // 重置所有数据
    this.load(data);
  }
}
