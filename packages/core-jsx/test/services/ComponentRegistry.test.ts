/**
 * ComponentRegistry 测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry } from '@eficy/core-jsx/services/ComponentRegistry';

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;

  beforeEach(() => {
    registry = new ComponentRegistry();
  });

  describe('组件注册', () => {
    const TestComponent = () => null;
    const AnotherComponent = () => null;

    it('应该能够注册组件', () => {
      registry.register('TestComponent', TestComponent);

      expect(registry.get('TestComponent')).toBe(TestComponent);
      expect(registry.has('TestComponent')).toBe(true);
    });

    it('应该能够批量注册组件', () => {
      const components = {
        TestComponent,
        AnotherComponent
      };

      registry.registerBatch(components);

      expect(registry.get('TestComponent')).toBe(TestComponent);
      expect(registry.get('AnotherComponent')).toBe(AnotherComponent);
    });

    it('应该拒绝无效的组件名称', () => {
      expect(() => {
        registry.register('', TestComponent);
      }).toThrow('Component name must be a non-empty string');

      expect(() => {
        registry.register(null as any, TestComponent);
      }).toThrow('Component name must be a non-empty string');
    });

  });

  describe('组件查询', () => {
    const TestComponent = () => null;

    beforeEach(() => {
      registry.register('TestComponent', TestComponent);
    });

    it('应该能够检查组件是否存在', () => {
      expect(registry.has('TestComponent')).toBe(true);
      expect(registry.has('NonExistent')).toBe(false);
    });

    it('应该能够获取所有组件', () => {
      const AnotherComponent = () => null;
      registry.register('AnotherComponent', AnotherComponent);

      const allComponents = registry.getAll();

      // ComponentRegistry 会自动添加 e- 前缀
      expect(allComponents['e-TestComponent']).toBe(TestComponent);
      expect(allComponents['e-AnotherComponent']).toBe(AnotherComponent);
      expect(Object.keys(allComponents)).toHaveLength(2);
    });

    it('应该能够获取组件名称列表', () => {
      const AnotherComponent = () => null;
      registry.register('AnotherComponent', AnotherComponent);

      const names = registry.getNames();

      // ComponentRegistry 会自动添加 e- 前缀
      expect(names).toContain('e-TestComponent');
      expect(names).toContain('e-AnotherComponent');
      expect(names).toHaveLength(2);
    });

    it('应该返回正确的组件数量', () => {
      expect(registry.size).toBe(1);

      registry.register('AnotherComponent', () => null);
      expect(registry.size).toBe(2);
    });
  });

  describe('组件移除', () => {
    const TestComponent = () => null;

    beforeEach(() => {
      registry.register('TestComponent', TestComponent);
    });

    it('应该能够取消注册组件', () => {
      expect(registry.has('TestComponent')).toBe(true);

      const result = registry.unregister('TestComponent');

      expect(result).toBe(true);
      expect(registry.has('TestComponent')).toBe(false);
    });

    it('取消注册不存在的组件应该返回 false', () => {
      const result = registry.unregister('NonExistent');

      expect(result).toBe(false);
    });

    it('应该能够清空所有组件', () => {
      registry.register('AnotherComponent', () => null);
      expect(registry.size).toBe(2);

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.has('TestComponent')).toBe(false);
    });
  });

  describe('Map 接口', () => {
    it('应该能够获取 Map 实例', () => {
      const TestComponent = () => null;
      registry.register('TestComponent', TestComponent);

      const map = registry.getMap();

      expect(map).toBeInstanceOf(Map);
      // ComponentRegistry 会自动添加 e- 前缀
      expect(map.get('e-TestComponent')).toBe(TestComponent);
      expect(map.size).toBe(1);
    });

    it('返回的 Map 应该是新实例', () => {
      const map1 = registry.getMap();
      const map2 = registry.getMap();

      expect(map1).not.toBe(map2);
    });
  });
});