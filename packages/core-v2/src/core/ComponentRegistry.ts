import { injectable } from 'tsyringe';
import { ComponentType, ReactElement } from 'react';
import { merge, cloneDeep } from 'lodash';

@injectable()
export class ComponentRegistry {
  private componentMap: Map<string, ComponentType<any>> = new Map();
  private defaultComponentMap: Record<string, ComponentType<any>> = {};

  setDefaultComponentMap(componentMap: Record<string, ComponentType<any>>): void {
    this.defaultComponentMap = cloneDeep(componentMap);
    
    // Register all default components
    Object.entries(componentMap).forEach(([name, component]) => {
      this.componentMap.set(name, component);
    });
  }

  extendComponentMap(componentMap: Record<string, ComponentType<any>>): void {
    Object.entries(componentMap).forEach(([name, component]) => {
      this.componentMap.set(name, component);
    });
  }

  registerComponent(name: string, component: ComponentType<any>): void {
    this.componentMap.set(name, component);
  }

  unregisterComponent(name: string): boolean {
    return this.componentMap.delete(name);
  }

  getComponent(name: string): ComponentType<any> | undefined {
    return this.componentMap.get(name);
  }

  hasComponent(name: string): boolean {
    return this.componentMap.has(name);
  }

  getAllComponents(): Record<string, ComponentType<any>> {
    const result: Record<string, ComponentType<any>> = {};
    this.componentMap.forEach((component, name) => {
      result[name] = component;
    });
    return result;
  }

  getComponentNames(): string[] {
    return Array.from(this.componentMap.keys());
  }

  clear(): void {
    this.componentMap.clear();
  }

  reset(): void {
    this.componentMap.clear();
    this.setDefaultComponentMap(this.defaultComponentMap);
  }

  merge(componentMap: Record<string, ComponentType<any>>): void {
    const merged = merge({}, this.getAllComponents(), componentMap);
    this.componentMap.clear();
    Object.entries(merged).forEach(([name, component]) => {
      this.componentMap.set(name, component);
    });
  }

  clone(): ComponentRegistry {
    const newRegistry = new ComponentRegistry();
    newRegistry.setDefaultComponentMap(this.defaultComponentMap);
    newRegistry.extendComponentMap(this.getAllComponents());
    return newRegistry;
  }
}