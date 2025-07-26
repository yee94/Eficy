import { nanoid } from 'nanoid';
import { observable, computed, action, ObservableClass, makeObservable } from '@eficy/reactive';
import { isFunction } from 'lodash';
import { setOmit } from '../utils/common';
import type { IViewData } from '../interfaces';
import type { ReactElement } from 'react';

// 框架特殊字段，不会传递给组件
const FRAMEWORK_FIELDS = new Set(['#', '#view', '#children', '#content', '#if', '#staticProps']);

export default class ViewNode {
  // 唯一标识
  public readonly id: string = nanoid();

  // 核心字段
  @observable
  public '#' = '';

  @observable
  public '#view' = 'div';

  @observable
  public '#children': ViewNode[] = [];

  @observable
  public '#content'?: string | ReactElement;

  @observable
  public '#if'?: boolean | (() => boolean) = true;

  // 动态属性存储
  @observable
  private dynamicProps: Record<string, any> = {};
  
  // 子模型映射
  @observable
  public models: Record<string, ViewNode> = {};

  constructor(data: IViewData) {
    this.load(data);
    makeObservable(this);
  }

  /**
   * 加载ViewData数据
   */
  @action
  private load(data: IViewData): void {
    console.log('📥 ViewNode.load called:', { 
      currentId: this['#'], 
      newData: data 
    });
    // 设置核心字段
    this['#'] = data['#'] || this.id;
    this['#view'] = data['#view'] || 'div';
    this['#content'] = data['#content'];
    this['#if'] = data['#if'] !== undefined ? data['#if'] : true;

    // 处理子节点
    if (data['#children']) {
      const children = data['#children'].map((childData) => new ViewNode(childData));
      this['#children'] = children;
      
      // 更新模型映射
      this.models = {};
      children.forEach(child => {
        if (child['#']) {
          this.models[child['#']] = child;
        }
      });
    }

    // 设置其他属性
    const otherProps = setOmit(data, FRAMEWORK_FIELDS);
    this.dynamicProps = { ...otherProps };
    console.log('✅ ViewNode.load completed:', { 
      id: this['#'], 
      view: this['#view'],
      content: this['#content'],
      dynamicProps: this.dynamicProps
    });
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

    // 如果有子节点，children 应该是子节点的渲染结果
    if (this['#children'] && this['#children'].length > 0) {
      // 这里只返回子节点数组，实际渲染由 RenderNode 处理
      props.children = this['#children'];
    }

    return props;
  }

  /**
   * 判断是否应该渲染
   */
  @computed
  get shouldRender(): boolean {
    const condition = this['#if'];

    if (condition === undefined || condition === null) {
      return true;
    }

    if (isFunction(condition)) {
      return (condition as () => boolean)();
    }

    return Boolean(condition);
  }

  /**
   * 更新字段值
   */
  @action
  updateField(key: string, value: any): void {
          console.log('🔄 ViewNode.updateField called:', { 
        id: this['#'], 
        field: key, 
        oldValue: FRAMEWORK_FIELDS.has(key) ? (this as any)[key] : this.dynamicProps[key],
        newValue: value 
      });
    if (FRAMEWORK_FIELDS.has(key)) {
      // 更新框架字段
      (this as any)[key] = value;
      console.log(`✅ Updated system field ${key} to:`, value);
    } else {
      // 更新动态属性 - 使用不可变更新
      this.dynamicProps = {
        ...this.dynamicProps,
        [key]: value,
      };
      console.log(`✅ Updated dynamic field ${key} to:`, value);
    }
  }

  /**
   * 添加子节点
   */
  @action
  addChild(child: ViewNode): void {
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
  findChild(childId: string): ViewNode | null {
    return this['#children'].find((child) => child['#'] === childId) || null;
  }

  /**
   * 获取视图数据映射
   */
  @computed
  get viewDataMap(): Record<string, ViewNode> {
    const result: Record<string, ViewNode> = { [this['#']]: this };
    
    // 递归合并子节点的 viewDataMap
    this['#children'].forEach(child => {
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

    if (this['#children'].length > 0) {
      result['#children'] = this['#children'].map((child) => child.toJSON());
    }

    return result;
  }

  /**
   * 从JSON创建ViewNode
   */
  static fromJSON(data: IViewData): ViewNode {
    return new ViewNode(data);
  }

  /**
   * 更新节点数据
   */
  @action
  update(data: IViewData): void {
    console.log('📥 ViewNode.update called:', { 
      currentId: this['#'], 
      newData: data 
    });
    // 更新核心字段
    if (data['#view'] !== undefined) this['#view'] = data['#view'];
    if (data['#content'] !== undefined) this['#content'] = data['#content'];
    if (data['#if'] !== undefined) this['#if'] = data['#if'];

    // 更新动态属性
    const otherProps = setOmit(data, FRAMEWORK_FIELDS);
    this.dynamicProps = { ...this.dynamicProps, ...otherProps };

    // 更新子节点
    if (data['#children']) {
      // 查找并更新现有子节点，添加新子节点
      data['#children'].forEach((childData) => {
        const childId = childData['#'];
        if (childId) {
          const existingChild = this.findChild(childId);
          if (existingChild) {
            existingChild.update(childData);
          } else {
            this.addChild(new ViewNode(childData));
          }
        } else {
          this.addChild(new ViewNode(childData));
        }
      });
      
      // 移除不再存在的子节点
      const updatedChildIds = new Set(data['#children']
        .map(childData => childData['#'])
        .filter(Boolean));
        
      this['#children']
        .filter(child => child['#'] && !updatedChildIds.has(child['#']))
        .forEach(child => this.removeChild(child['#']));
    }
    console.log('✅ ViewNode.update completed:', { 
      id: this['#'], 
      view: this['#view'],
      content: this['#content'],
      dynamicProps: this.dynamicProps
    });
  }

  /**
   * 完全覆盖节点数据
   */
  @action
  overwrite(data: IViewData): void {
    console.log('📥 ViewNode.overwrite called:', { 
      currentId: this['#'], 
      newData: data 
    });
    // 重置所有数据
    this.load(data);
    console.log('✅ ViewNode.overwrite completed:', { 
      id: this['#'], 
      view: this['#view'],
      content: this['#content'],
      dynamicProps: this.dynamicProps
    });
  }
}
