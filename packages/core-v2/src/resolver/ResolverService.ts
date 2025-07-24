import { ReactElement, createElement as reactCreateElement } from 'react';
import { injectable, inject } from 'tsyringe';
import { get, isPlainObject, isArray } from 'lodash';

import { TOKENS } from '../container/tokens';
import type { 
  IResolverOptions,
  IComponentRegistry,
  ISignalManager,
  ILifecycleHooks
} from '../interfaces';
import { ViewNode } from '../models/ViewNode';

/**
 * 解析器服务
 * 负责将ViewNode解析为React元素
 * 新版本采用由内向外的构建方式
 */
@injectable()
export class ResolverService {
  constructor(
    @inject(TOKENS.COMPONENT_REGISTRY) private componentRegistry: IComponentRegistry,
    @inject(TOKENS.SIGNAL_MANAGER) private signalManager: ISignalManager
  ) {}

  /**
   * 解析ViewNode为React元素
   * 采用由内向外的构建方式
   */
  resolve(viewNode: ViewNode | ViewNode[], options?: IResolverOptions): ReactElement | ReactElement[] {
    if (isArray(viewNode)) {
      return viewNode.map(node => this.resolveNode(node, options));
    }
    
    return this.resolveNode(viewNode, options);
  }

  /**
   * 解析单个ViewNode
   */
  private resolveNode(viewNode: ViewNode, options?: IResolverOptions): ReactElement {
    const hooks = options?.hooks;
    
    // 生命周期：渲染前
    hooks?.beforeRender?.(viewNode);

    // 获取基本属性
    const componentName = viewNode.get<string>('#view');
    const id = viewNode.get<string>('#');
    const ifCondition = viewNode.get<boolean>('#if');
    const children = viewNode.get<ViewNode[]>('#children');
    const content = viewNode.get<string>('#content');
    const staticProps = viewNode.get<Record<string, unknown>>('#staticProps') || {};

    // 条件渲染
    if (ifCondition === false) {
      return reactCreateElement('span', { 
        key: id, 
        style: { display: 'none' },
        'data-eficy-hidden': true 
      });
    }

    // 获取组件
    const Component = this.getComponent(componentName);
    
    // 构建props - 由内向外的方式
    const props = this.buildProps(viewNode, options);
    
    // 处理子元素 - 先构建子元素，再构建当前元素
    const childElements = this.resolveChildren(children, content, options);
    
    // 创建React元素
    let element = reactCreateElement(Component, props, ...childElements);
    
    // 生命周期：渲染后
    if (hooks?.afterRender) {
      element = hooks.afterRender(element);
    }

    return element;
  }

  /**
   * 获取组件
   */
  private getComponent(componentName: string): unknown {
    // 先从组件注册表获取
    if (this.componentRegistry.has(componentName)) {
      return this.componentRegistry.get(componentName);
    }
    
    // 如果找不到，可能是原生HTML元素
    return componentName;
  }

  /**
   * 构建props
   */
  private buildProps(viewNode: ViewNode, options?: IResolverOptions): Record<string, unknown> {
    const id = viewNode.get<string>('#');
    const componentName = viewNode.get<string>('#view');
    const staticProps = viewNode.get<Record<string, unknown>>('#staticProps') || {};
    const className = viewNode.get<string>('className');
    const style = viewNode.get<Record<string, unknown>>('style');
    
    // 基础props
    const props: Record<string, unknown> = {
      key: id,
      'data-eficy-id': id,
      'data-eficy-component': componentName,
      ...staticProps
    };

    // 处理className
    if (className) {
      const classNames = [className, `eficy-${componentName}`, `eficy-id-${id}`]
        .filter(Boolean)
        .join(' ');
      props.className = classNames;
    }

    // 处理style
    if (style) {
      props.style = this.processStyle(style);
    }

    // 处理其他属性
    this.processOtherProps(viewNode, props);

    // 处理事件属性
    this.processEventProps(viewNode, props, options);

    return props;
  }

  /**
   * 处理样式
   */
  private processStyle(style: Record<string, unknown>): Record<string, unknown> {
    // 深拷贝并处理响应式值
    const processedStyle: Record<string, unknown> = {};
    
    Object.keys(style).forEach(key => {
      let value = style[key];
      
      // 如果是信号值，获取当前值
      if (this.isSignalValue(value)) {
        value = (value as any).get();
      }
      
      processedStyle[key] = value;
    });

    return processedStyle;
  }

  /**
   * 处理其他属性
   */
  private processOtherProps(viewNode: ViewNode, props: Record<string, unknown>): void {
    // 获取所有属性
    const allProps = viewNode.toJSON();
    
    // 过滤掉内部属性
    Object.keys(allProps).forEach(key => {
      if (this.isInternalProp(key)) {
        return;
      }
      
      let value = allProps[key];
      
      // 处理响应式值
      if (this.isSignalValue(value)) {
        value = (value as any).get();
      }
      
      // 处理函数值
      if (typeof value === 'function') {
        value = this.wrapFunction(value, viewNode);
      }
      
      props[key] = value;
    });
  }

  /**
   * 处理事件属性
   */
  private processEventProps(
    viewNode: ViewNode, 
    props: Record<string, unknown>, 
    options?: IResolverOptions
  ): void {
    // 处理onClick, onChange等事件
    Object.keys(props).forEach(key => {
      if (this.isEventProp(key) && typeof props[key] === 'function') {
        const originalHandler = props[key] as Function;
        
        props[key] = (...args: unknown[]) => {
          try {
            return originalHandler(...args);
          } catch (error) {
            console.error(`Error in event handler ${key}:`, error);
          }
        };
      }
    });
  }

  /**
   * 处理子元素
   */
  private resolveChildren(
    children?: ViewNode[], 
    content?: string, 
    options?: IResolverOptions
  ): ReactElement[] {
    const childElements: ReactElement[] = [];

    // 处理文本内容
    if (content) {
      childElements.push(reactCreateElement('span', { 
        key: 'content',
        'data-eficy-content': true 
      }, content));
    }

    // 处理子组件 - 递归解析
    if (children && isArray(children)) {
      children.forEach((child, index) => {
        if (child instanceof ViewNode) {
          const childElement = this.resolveNode(child, options);
          childElements.push(childElement);
        }
      });
    }

    return childElements;
  }

  /**
   * 检查是否为内部属性
   */
  private isInternalProp(key: string): boolean {
    return key.startsWith('#') || 
           ['className', 'style', 'key'].includes(key);
  }

  /**
   * 检查是否为事件属性
   */
  private isEventProp(key: string): boolean {
    return key.startsWith('on') && key.length > 2 && key[2] === key[2].toUpperCase();
  }

  /**
   * 检查是否为信号值
   */
  private isSignalValue(value: unknown): boolean {
    return isPlainObject(value) && 
           typeof (value as any)?.get === 'function';
  }

  /**
   * 包装函数，提供上下文
   */
  private wrapFunction(fn: Function, viewNode: ViewNode): Function {
    return (...args: unknown[]) => {
      const context = {
        viewNode,
        signalManager: this.signalManager,
        componentRegistry: this.componentRegistry
      };
      
      return fn.apply(context, args);
    };
  }
} 