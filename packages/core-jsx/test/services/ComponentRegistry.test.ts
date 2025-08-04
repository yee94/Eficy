/**
 * ComponentRegistry 测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry } from '../../src/services/ComponentRegistry';
import { ComponentType } from 'react';

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
  });

  describe('组件注册', () => {
    it('应该能够注册组件', () => {
      const TestComponent: ComponentType<any> = () => null;

      registry.register('TestComponent', TestComponent);

      expect(registry.has('TestComponent')).toBe(true);
      expect(registry.get('TestComponent')).toBe(TestComponent);
    });

    it('应该能够批量注册组件', () => {
      const TestComponent: ComponentType<any> = () => null;
      const AnotherComponent: ComponentType<any> = () => null;

      registry.registerBatch({
        TestComponent,
        AnotherComponent,
      });

      expect(registry.has('TestComponent')).toBe(true);
      expect(registry.has('AnotherComponent')).toBe(true);
      expect(registry.get('TestComponent')).toBe(TestComponent);
      expect(registry.get('AnotherComponent')).toBe(AnotherComponent);
    });

    it('应该拒绝无效的组件名称', () => {
      const TestComponent: ComponentType<any> = () => null;

      // 空字符串应该被忽略
      registry.register('', TestComponent);
      expect(registry.has('')).toBe(false);

      // null 应该被忽略
      registry.register(null as any, TestComponent);
      expect(registry.has(null as any)).toBe(false);
    });
  });

  describe('组件查询', () => {
    it('应该能够检查组件是否存在', () => {
      const TestComponent: ComponentType<any> = () => null;

      expect(registry.has('TestComponent')).toBe(false);

      registry.register('TestComponent', TestComponent);

      expect(registry.has('TestComponent')).toBe(true);
    });

    it('应该能够获取所有组件', () => {
      const TestComponent: ComponentType<any> = () => null;
      const AnotherComponent: ComponentType<any> = () => null;

      registry.register('TestComponent', TestComponent);
      registry.register('AnotherComponent', AnotherComponent);

      const allComponents = registry.getAll();

      // ComponentRegistry 返回原始名称
      expect(allComponents['TestComponent']).toBe(TestComponent);
      expect(allComponents['AnotherComponent']).toBe(AnotherComponent);
      expect(Object.keys(allComponents)).toHaveLength(2);
    });

    it('应该能够获取组件名称列表', () => {
      const TestComponent: ComponentType<any> = () => null;
      const AnotherComponent: ComponentType<any> = () => null;

      registry.register('TestComponent', TestComponent);
      registry.register('AnotherComponent', AnotherComponent);

      const names = registry.getNames();

      // ComponentRegistry 返回原始名称
      expect(names).toContain('TestComponent');
      expect(names).toContain('AnotherComponent');
      expect(names).toHaveLength(2);
    });

    it('应该返回正确的组件数量', () => {
      expect(registry.size).toBe(0);

      const TestComponent: ComponentType<any> = () => null;
      registry.register('TestComponent', TestComponent);

      expect(registry.size).toBe(1);
    });
  });

  describe('组件移除', () => {
    it('应该能够取消注册组件', () => {
      const TestComponent: ComponentType<any> = () => null;

      registry.register('TestComponent', TestComponent);
      expect(registry.has('TestComponent')).toBe(true);

      const result = registry.unregister('TestComponent');
      expect(result).toBe(true);
      expect(registry.has('TestComponent')).toBe(false);
    });

    it('取消注册不存在的组件应该返回 false', () => {
      const result = registry.unregister('NonExistentComponent');
      expect(result).toBe(false);
    });

    it('应该能够清空所有组件', () => {
      const TestComponent: ComponentType<any> = () => null;
      const AnotherComponent: ComponentType<any> = () => null;

      registry.register('TestComponent', TestComponent);
      registry.register('AnotherComponent', AnotherComponent);

      expect(registry.size).toBe(2);

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.has('TestComponent')).toBe(false);
      expect(registry.has('AnotherComponent')).toBe(false);
    });
  });

  describe('Map 接口', () => {
    it('应该能够获取 Map 实例', () => {
      const TestComponent: ComponentType<any> = () => null;

      registry.register('TestComponent', TestComponent);

      const map = registry.getMap();

      expect(map).toBeInstanceOf(Map);
      // ComponentRegistry 返回原始名称
      expect(map.get('TestComponent')).toBe(TestComponent);
      expect(map.size).toBe(1);
    });

    it('返回的 Map 应该是新实例', () => {
      const map1 = registry.getMap();
      const map2 = registry.getMap();

      expect(map1).not.toBe(map2);
      expect(map1.size).toBe(map2.size);
    });
  });
});