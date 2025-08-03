/**
 * ComponentRegistry - 组件注册表服务
 */

import { injectable } from 'tsyringe';
import { ComponentType } from 'react';
import get from 'lodash/get';

@injectable()
export class ComponentRegistry {
  private components = new Map<string, ComponentType<any>>();

  /**
   * 注册组件
   */
  register(name: string, component: ComponentType<any>): void {
    if (!name || typeof name !== 'string') {
      return;
    }

    if (!component) {
      return;
    }

    this.components.set(name, component);
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
    return this.components.get(name);
  }

  /**
   * 检查组件是否存在
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  resolve(nameWithTransformed: string): ComponentType<any> | undefined {
    const name = nameWithTransformed.replace(/^e-/, '');
    // InputPassword => Input.Password (避免在开头添加点号)
    if (this.components.has(name)) {
      return this.components.get(name);
    }
    const maybeName = name
      .replace(/([A-Z])/g, (match, p1, offset) => {
        return offset === 0 ? p1 : '.' + p1;
      })
      ?.split('.');
    if (maybeName && this.components.has(maybeName[0])) {
      return get(this.components.get(maybeName[0]), maybeName.slice(1).join('.'));
    }
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
    return this.components.delete(name);
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
