/**
 * ComponentRegistry - 组件注册表服务
 */

import { injectable } from 'tsyringe';
import { ComponentType } from 'react';

@injectable()
export class ComponentRegistry {
  private components = new Map<string, ComponentType<any>>();
  
  /**
   * 注册组件
   */
  register(name: string, component: ComponentType<any>): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Component name must be a non-empty string');
    }
    
    if (!component) {
      throw new Error('Component cannot be null or undefined');
    }
    
    // 添加 e- 前缀
    const prefixedName = name.startsWith('e-') ? name : `e-${name}`;
    this.components.set(prefixedName, component);
  }
  
  /**
   * 批量注册组件
   */
  registerBatch(components: Record<string, ComponentType<any>>): void {
    Object.entries(components).forEach(([name, component]) => {
      this.register(name, component);
    });
  }
  
  /**
   * 获取组件
   */
  get(name: string): ComponentType<any> | undefined {
    // 添加 e- 前缀
    const prefixedName = name.startsWith('e-') ? name : `e-${name}`;
    return this.components.get(prefixedName);
  }
  
  /**
   * 检查组件是否存在
   */
  has(name: string): boolean {
    // 添加 e- 前缀
    const prefixedName = name.startsWith('e-') ? name : `e-${name}`;
    return this.components.has(prefixedName);
  }
  
  /**
   * 获取所有组件
   */
  getAll(): Record<string, ComponentType<any>> {
    const result: Record<string, ComponentType<any>> = {};
    
    this.components.forEach((component, name) => {
      result[name] = component;
    });
    
    return result;
  }
  
  /**
   * 获取组件名称列表
   */
  getNames(): string[] {
    return Array.from(this.components.keys());
  }
  
  /**
   * 取消注册组件
   */
  unregister(name: string): boolean {
    // 添加 e- 前缀
    const prefixedName = name.startsWith('e-') ? name : `e-${name}`;
    return this.components.delete(prefixedName);
  }
  
  /**
   * 清空所有组件
   */
  clear(): void {
    this.components.clear();
  }
  
  /**
   * 获取组件数量
   */
  get size(): number {
    return this.components.size;
  }
  
  /**
   * 获取 Map 实例（用于 EficyNode）
   */
  getMap(): Map<string, ComponentType<any>> {
    return new Map(this.components);
  }
}