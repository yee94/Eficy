import { nanoid } from 'nanoid';
import { observable, computed, action, ObservableClass, makeObservable } from '@eficy/reactive';
import { isFunction } from 'lodash';
import { setOmit } from '../utils/common';
import type { IViewData } from '../interfaces';
import type { ReactElement } from 'react';

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
  public readonly id: string = nanoid();

  // 核心字段
  @observable
  public '#' = '';

  @observable
  public '#view' = 'div';

  @observable
  public '#children': EficyNode[] = [];

  @observable
  public '#content'?: string | ReactElement;

  @observable
  public '#if'?: boolean | (() => boolean) = true;

  @observable
  public '#show'?: boolean | (() => boolean) = true;

  @observable
  public '#style'?: Record<string, any>;

  @observable
  public '#class'?: string | string[];

  @observable
  public '#events'?: Record<string, any>;

  // 动态属性存储
  @observable
  private dynamicProps: Record<string, any> = {};

  // 子模型映射
  @observable
  public models: Record<string, EficyNode> = {};

  constructor(data: IViewData) {
    this.load(data);
    makeObservable(this);
  }

  /**
   * 加载ViewData数据
   */
  @action
  private load(data: IViewData): void {
    // 设置核心字段
    this['#'] = data['#'] || this.id;
    this['#view'] = data['#view'] || 'div';
    this['#content'] = data['#content'];
    this['#if'] = data['#if'] !== undefined ? data['#if'] : true;
    this['#show'] = data['#show'] !== undefined ? data['#show'] : true;
    this['#style'] = data['#style'];
    this['#class'] = data['#class'];
    this['#events'] = data['#events'];

    // 处理子节点 - 但不在这里构建，由外部EficyNodeTree负责
    if (data['#children']) {
      // 暂时存储原始数据，实际构建由外部负责
      this['#children'] = [];
    }

    // 设置其他属性
    const otherProps = setOmit(data, FRAMEWORK_FIELDS);
    this.dynamicProps = { ...otherProps };
  }

  /**
   * 计算最终传递给组件的props
   */
  @computed
  get props(): Record<string, any> {
    const props: Record<string, any> = { ...this.dynamicProps };

    // 处理 #content -> children
    if (this['#content'] !== undefined) {
      props.children = this['#content'];
    }

    // 如果有子节点，children 应该是子节点数组，由RenderNode处理渲染
    if (this['#children'] && this['#children'].length > 0) {
      props.children = this['#children'];
    }

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
  @computed
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
  @action
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
   * 设置子节点（由外部EficyNodeTree调用）
   */
  @action
  setChildren(children: EficyNode[]): void {
    this['#children'] = children;

    // 更新模型映射
    this.models = {};
    children.forEach((child) => {
      if (child['#']) {
        this.models[child['#']] = child;
      }
    });
  }

  /**
   * 添加子节点
   */
  @action
  addChild(child: EficyNode): void {
    this['#children'] = [...this['#children'], child];

    // 更新模型映射
    if (child['#']) {
      this.models = { ...this.models, [child['#']]: child };
    }
  }

  /**
   * 移除子节点
   */
  @action
  removeChild(childId: string): void {
    this['#children'] = this['#children'].filter((child) => child['#'] !== childId);

    // 更新模型映射
    if (childId && this.models[childId]) {
      const newModels = { ...this.models };
      delete newModels[childId];
      this.models = newModels;
    }
  }

  /**
   * 查找子节点
   */
  findChild(childId: string): EficyNode | null {
    return this['#children'].find((child) => child['#'] === childId) || null;
  }

  /**
   * 获取视图数据映射
   */
  @computed
  get viewDataMap(): Record<string, EficyNode> {
    const result: Record<string, EficyNode> = { [this['#']]: this };

    // 递归合并子节点的 viewDataMap
    this['#children'].forEach((child) => {
      Object.assign(result, child.viewDataMap);
    });

    return result;
  }

  /**
   * 序列化为JSON
   */
  toJSON(): IViewData {
    const result: IViewData = {
      '#': this['#'],
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

    if (this['#children'].length > 0) {
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
  @action
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

    // 子节点更新由外部EficyNodeTree负责
  }

  /**
   * 完全覆盖节点数据
   */
  @action
  overwrite(data: IViewData): void {
    // 重置所有数据
    this.load(data);
  }
}
