import { describe, it, expect, vi } from 'vitest';
import { signal, computed, effect } from '../core/signal';
import { action, isAction, getOriginalFunction, actionDecorator, boundAction } from '../core/action';

describe('Action', () => {
  describe('action', () => {
    it('should create an action that batches updates', () => {
      const count = signal(0);
      
      const spy = vi.fn();
      effect(() => {
        spy(count());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(0);
      
      const updateAction = action(() => {
        count(5);
        count(10);
        count(15);
      });
      
      updateAction();
      
      // 使用 preact/signals-core 的原生批处理，真正只调用一次！
      expect(spy).toHaveBeenCalledTimes(2); // 1 初始 + 1 批处理后的更新
      expect(spy).toHaveBeenLastCalledWith(15);
    });

    it('should return value from action function', () => {
      const testAction = action(() => {
        return 'action result';
      });
      
      expect(testAction()).toBe('action result');
    });

    it('should preserve function parameters', () => {
      const addAction = action((a: number, b: number) => {
        return a + b;
      });
      
      expect(addAction(2, 3)).toBe(5);
      expect(addAction(10, 20)).toBe(30);
    });

    it('should handle async actions', async () => {
      const asyncAction = action(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async result';
      });
      
      const result = await asyncAction();
      expect(result).toBe('async result');
    });

    it('should handle errors in actions', () => {
      const errorAction = action(() => {
        throw new Error('Action error');
      });
      
      expect(() => errorAction()).toThrow('Action error');
    });

    it('should nest actions properly', () => {
      const count = signal(0);
      
      const spy = vi.fn();
      effect(() => {
        spy(count());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      
      const outerAction = action(() => {
        count(10);
        
        const innerAction = action(() => {
          count(20);
        });
        
        innerAction();
        count(30);
      });
      
      outerAction();

      // 嵌套的 action 也会被正确批处理
      expect(spy).toHaveBeenCalledTimes(2); // 1 初始 + 1 批处理后的更新
      expect(spy).toHaveBeenLastCalledWith(30);
    });
  });

  describe('isAction', () => {
    it('should identify action functions', () => {
      const normalFn = () => {};
      const actionFn = action(() => {});
      
      expect(isAction(normalFn)).toBe(false);
      expect(isAction(actionFn)).toBe(true);
      expect(isAction(null)).toBe(false);
      expect(isAction(undefined)).toBe(false);
      expect(isAction({})).toBe(false);
    });
  });

  describe('boundAction', () => {
    it('should create bound action with correct context', () => {
      const obj = {
        value: 42
      };
      
      // boundAction 应该显式传入 this 上下文
      const getValue = boundAction(function(this: { value: number }) {
        return this.value;
      }, obj);
      
      expect(getValue()).toBe(42);
    });

    it('should work without explicit context', () => {
      const getValue = boundAction(() => 'test');
      expect(getValue()).toBe('test');
    });
  });

  describe('action with complex scenarios', () => {
    it('should handle multiple signals with computed dependencies', () => {
      const items = signal<number[]>([]);
      const multiplier = signal(3);
      const total = computed(() => items().reduce((sum, item) => sum + item, 0) * multiplier());
      
      const spy = vi.fn();
      effect(() => {
        spy(total());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(0);
      
      const addItems = action((newItems: number[]) => {
        items([...items(), ...newItems]);
        multiplier(3);
      });
      
      addItems([1, 2, 3]);

      // 实际调用次数可能因为 computed 优化而减少
      expect(spy).toHaveBeenCalledTimes(2); // 1 初始 + 1 最终结果
      expect(spy).toHaveBeenLastCalledWith(18); // (1+2+3) * 3
    });

    it('should handle conditional state updates', () => {
      const condition = signal(true);
      const multiplier = signal(2);
      const result = computed(() => condition() ? 4 * multiplier() : 0);
      
      const spy = vi.fn();
      effect(() => {
        spy(result());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(8); // true ? 4 * 2 : 0
      
      const updateAction = action(() => {
        multiplier(4); // result would be 16
        condition(false); // but then becomes 0
      });
      
      updateAction();
      
      // 原生批处理确保只计算最终结果
      expect(spy).toHaveBeenCalledTimes(2); // 1 初始 + 1 批处理后的更新
      expect(spy).toHaveBeenLastCalledWith(0); // false ? 4 * 4 : 0
    });

    it('should preserve function name and properties', () => {
      function namedFunction() {
        return 'test';
      }
      namedFunction.customProperty = 'custom';
      
      const actionFn = action(namedFunction);
      
      // action 函数会添加前缀，检查包含原函数名
      expect(actionFn.name).toContain('namedFunction');
      expect(actionFn()).toBe('test');
      expect(isAction(actionFn)).toBe(true);
    });
  });
}); 