import { injectable } from 'tsyringe';
import { merge, cloneDeep } from 'lodash';
import { IComponentRegistry } from '../interfaces';

/**
 * 组件注册表服务
 * 管理组件映射和注册
 */
@injectable()
export class ComponentRegistry implements IComponentRegistry {
  private components: Record<string, unknown> = {};

  /**
   * 注册组件
   */
  register(name: string, component: unknown): void {
    this.components[name] = component;
  }

  /**
   * 获取组件
   */
  get(name: string): unknown {
    return this.components[name];
  }

  /**
   * 检查组件是否存在
   */
  has(name: string): boolean {
    return name in this.components;
  }

  /**
   * 移除组件
   */
  remove(name: string): boolean {
    if (this.has(name)) {
      delete this.components[name];
      return true;
    }
    return false;
  }

  /**
   * 获取所有组件
   */
  getAll(): Record<string, unknown> {
    return cloneDeep(this.components);
  }

  /**
   * 扩展组件库
   * 支持递归合并
   */
  extend(componentMap: Record<string, unknown>): void {
    this.components = merge(cloneDeep(this.components), componentMap);
  }

  /**
   * 批量注册组件
   */
  registerMany(componentMap: Record<string, unknown>): void {
    Object.keys(componentMap).forEach(name => {
      this.register(name, componentMap[name]);
    });
  }

  /**
   * 清空所有组件
   */
  clear(): void {
    this.components = {};
  }

  /**
   * 获取组件数量
   */
  size(): number {
    return Object.keys(this.components).length;
  }

  /**
   * 获取所有组件名称
   */
  getNames(): string[] {
    return Object.keys(this.components);
  }

  /**
   * 检查是否为空
   */
  isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * 复制组件注册表
   */
  clone(): ComponentRegistry {
    const newRegistry = new ComponentRegistry();
    newRegistry.components = cloneDeep(this.components);
    return newRegistry;
  }
} 