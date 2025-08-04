import { describe, it, expect } from 'vitest';
import { mapSignals, hasSignals } from '../utils/mapSignals';
import { signal } from '../core/signal';
import { isSignal } from '../utils';

describe('MapSignals', () => {
  describe('mapSignals', () => {
    it('should map simple signals', () => {
      const count = signal(42);
      const name = signal('John');

      const obj = {
        count,
        name,
        age: 30,
      };

      const result = mapSignals(obj);

      expect(result.count).toBe(42);
      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
    });

    it('should map nested signals', () => {
      const user = {
        name: signal('Alice'),
        age: signal(25),
      };

      const obj = {
        user,
        active: signal(true),
      };

      const result = mapSignals(obj);

      expect(result.user.name).toBe('Alice');
      expect(result.user.age).toBe(25);
      expect(result.active).toBe(true);
    });

    it('should map array signals', () => {
      const items = [signal(1), signal(2), signal(3)];

      const obj = {
        items,
        count: signal(3),
      };

      const result = mapSignals(obj);

      expect(result.items).toEqual([1, 2, 3]);
      expect(result.count).toBe(3);
    });

    it('should respect max depth', () => {
      const deepSignal = signal(signal(signal(signal(42))));

      const obj = {
        deep: deepSignal,
      };

      const result = mapSignals(obj, 2);

      // 在深度 2 时，应该还有未解析的信号
      expect(typeof result.deep).toBe('function');
    });

    it('should handle 4 layer deep object structure', () => {
      // 创建4层深度的对象结构
      const obj = {
        level1: {
          level2: {
            xixi: 'xixi',
            hello: signal('hello'),
            level3: {
              level4: signal(42), // 第4层深度的信号
            },
          },
        },
      } as const;

      // 测试默认深度3层 - 第4层应该被跳过
      const result3 = mapSignals(obj, 3);
      expect(typeof result3.level1.level2.level3.level4).toBe('function');

      // 测试4层深度 - 应该能解析到第4层
      const result4 = mapSignals(obj, 4);
      expect(result4.level1.level2.level3.level4).toBe(42);

      // 测试超过4层的情况
      const result5 = mapSignals(obj, 5);
      expect(result5.level1.level2.level3.level4).toBe(42);
    });

    it('should not modify original object', () => {
      const count = signal(42);
      const name = signal('John');

      const originalObj = {
        count,
        name,
        loading: signal(true),
        error: signal(undefined),
        age: 30,
        nested: {
          value: signal('nested value'),
          deep: {
            signal: signal(100),
          },
        },
        array: [signal(1), signal(2), signal(3)],
      };

      const result = mapSignals(originalObj);

      // 验证结果正确
      expect(result.count).toBe(42);
      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
      expect(result.nested.value).toBe('nested value');
      expect(result.nested.deep.signal).toBe(100);
      expect(result.array).toEqual([1, 2, 3]);
      expect(result.loading).toBe(true);
      expect(result.error).toBe(undefined);

      // 验证原对象没有被修改
      expect(originalObj.count).toBe(count);
      expect(originalObj.name).toBe(name);
      expect(isSignal(originalObj.loading)).toBeTruthy();
      expect(originalObj.age).toBe(30);
      expect(isSignal(originalObj.error)).toBeTruthy();
      expect(isSignal(originalObj.nested.value)).toBeTruthy();
      expect(isSignal(originalObj.nested.deep.signal)).toBeTruthy();
      expect(originalObj.array.every(isSignal)).toBeTruthy();

      // 验证返回的对象是全新的对象
      expect(result).not.toBe(originalObj);
      expect(result.nested).not.toBe(originalObj.nested);
      expect(result.nested.deep).not.toBe(originalObj.nested.deep);
      expect(result.array).not.toBe(originalObj.array);
    });

    it('should not modify original array', () => {
      const items = [signal(1), signal(2), signal(3)];
      const originalArray = [...items];

      const obj = {
        items,
        count: signal(3),
      };

      const result = mapSignals(obj);

      // 验证结果正确
      expect(result.items).toEqual([1, 2, 3]);
      expect(result.count).toBe(3);

      // 验证原数组没有被修改
      expect(obj.items).toBe(items);
      expect(obj.items).toEqual(originalArray);
      expect(isSignal(obj.count)).toBeTruthy();

      // 验证返回的数组是全新的数组
      expect(result.items).not.toBe(obj.items);
    });

    it('should handle complex nested objects without modification', () => {
      const user = {
        name: signal('Alice'),
        age: signal(25),
        preferences: {
          theme: signal('dark'),
          language: signal('en'),
          settings: {
            notifications: signal(true),
            autoSave: signal(false),
          },
        },
      };

      const originalUser = {
        name: user.name,
        age: user.age,
        preferences: {
          theme: user.preferences.theme,
          language: user.preferences.language,
          settings: {
            notifications: user.preferences.settings.notifications,
            autoSave: user.preferences.settings.autoSave,
          },
        },
      };

      const obj = {
        user,
        active: signal(true),
        tags: [signal('tag1'), signal('tag2')],
      };

      const result = mapSignals(obj, 4);

      // 验证结果正确
      expect(result.user.name).toBe('Alice');
      expect(result.user.age).toBe(25);
      expect(result.user.preferences.theme).toBe('dark');
      expect(result.user.preferences.language).toBe('en');
      expect(result.user.preferences.settings.notifications).toBe(true);
      expect(result.user.preferences.settings.autoSave).toBe(false);
      expect(result.active).toBe(true);
      expect(result.tags).toEqual(['tag1', 'tag2']);

      // 验证原对象没有被修改
      expect(obj.user).toBe(user);
      expect(obj.user.name).toBe(user.name);
      expect(obj.user.age).toBe(user.age);
      expect(obj.user.preferences.theme).toBe(user.preferences.theme);
      expect(obj.user.preferences.language).toBe(user.preferences.language);
      expect(obj.user.preferences.settings.notifications).toBe(user.preferences.settings.notifications);
      expect(obj.user.preferences.settings.autoSave).toBe(user.preferences.settings.autoSave);
      expect(isSignal(obj.active)).toBeTruthy();
      expect(obj.tags.every(isSignal)).toBeTruthy();

      // 验证返回的对象是全新的对象
      expect(result).not.toBe(obj);
      expect(result.user).not.toBe(obj.user);
      expect(result.user.preferences).not.toBe(obj.user.preferences);
      expect(result.user.preferences.settings).not.toBe(obj.user.preferences.settings);
      expect(result.tags).not.toBe(obj.tags);
    });
  });

  describe('mapSignalsProps', () => {
    it('should handle children array', () => {
      const child1 = signal('Child 1');
      const child2 = signal('Child 2');

      const props = {
        children: [child1, child2],
        className: signal('container'),
      };

      const result = mapSignals(props);

      expect(result.children).toEqual(['Child 1', 'Child 2']);
      expect(result.className).toBe('container');
    });

    it('should handle single child', () => {
      const child = signal('Single Child');

      const props = {
        children: child,
        id: signal('root'),
      };

      const result = mapSignals(props);

      expect(result.children).toBe('Single Child');
      expect(result.id).toBe('root');
    });

    it('should handle mixed children', () => {
      const child1 = signal('Child 1');
      const child2 = 'Static Child';
      const child3 = signal('Child 3');

      const props = {
        children: [child1, child2, child3],
        style: signal({ color: 'red' }),
      };

      const result = mapSignals(props);

      expect(result.children).toEqual(['Child 1', 'Static Child', 'Child 3']);
      expect(result.style).toEqual({ color: 'red' });
    });
  });

  describe('hasSignals', () => {
    it('should detect signals in object', () => {
      const obj = {
        name: signal('John'),
        age: 30,
      };

      expect(hasSignals(obj)).toBe(true);
    });

    it('should detect signals in nested object', () => {
      const obj = {
        user: {
          name: signal('Alice'),
          age: 25,
        },
      };

      expect(hasSignals(obj)).toBe(true);
    });

    it('should return false for object without signals', () => {
      const obj = {
        name: 'John',
        age: 30,
      };

      expect(hasSignals(obj)).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(hasSignals(null)).toBe(false);
      expect(hasSignals(undefined)).toBe(false);
    });
  });
});
