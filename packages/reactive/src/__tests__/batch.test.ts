import { describe, it, expect, vi } from 'vitest';
import { signal, computed, effect } from '../core/signal';
import { batch, isBatchingUpdates, clearPendingEffects } from '../core/batch';

describe('Batch', () => {
  describe('basic batching', () => {
    it('should batch multiple signal updates', () => {
      const count = signal(0);
      const name = signal('test');
      
      const spy = vi.fn();
      effect(() => {
        spy({ count: count(), name: name() });
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith({ count: 0, name: 'test' });
      
      // preact/signals-core 的原生批处理应该真正批处理更新
      batch(() => {
        count(10);
        name('updated');
        count(20);
      });
      
      // 使用原生批处理，effect 应该只被调用一次（不包括初始调用）
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith({ count: 20, name: 'updated' });
    });

    it('should handle computed values in batch', () => {
      const a = signal(1);
      const b = signal(2);
      const sum = computed(() => a() + b());
      
      const spy = vi.fn();
      effect(() => {
        spy(sum());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith(3);
      
      batch(() => {
        a(10);
        b(20);
      });
      
      // 原生批处理应该只触发一次计算
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(30);
    });

    it('should track batching status', () => {
      expect(isBatchingUpdates()).toBe(false);
      
      batch(() => {
        expect(isBatchingUpdates()).toBe(true);
        
        batch(() => {
          expect(isBatchingUpdates()).toBe(true);
        });
        
        expect(isBatchingUpdates()).toBe(true);
      });
      
      expect(isBatchingUpdates()).toBe(false);
    });
  });

  describe('nested batching', () => {
    it('should handle nested batch calls', () => {
      const count = signal(0);
      
      const spy = vi.fn();
      effect(() => {
        spy(count());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      
      batch(() => {
        count(1);
        
        batch(() => {
          count(2);
          count(3);
        });
        
        count(4);
      });
      
      // 嵌套批处理应该被合并为一次更新
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(4);
    });
  });

  describe('batch with complex scenarios', () => {
    it('should handle multiple signals and computed values', () => {
      const x = signal(1);
      const y = signal(2);
      const z = signal(3);
      
      const sum = computed(() => x() + y() + z());
      const product = computed(() => x() * y() * z());
      
      const sumSpy = vi.fn();
      const productSpy = vi.fn();
      
      effect(() => sumSpy(sum()));
      effect(() => productSpy(product()));
      
      expect(sumSpy).toHaveBeenCalledTimes(1);
      expect(productSpy).toHaveBeenCalledTimes(1);
      
      batch(() => {
        x(2);
        y(3);
        z(4);
      });
      
      // 每个 effect 应该只被调用一次（不包括初始调用）
      expect(sumSpy).toHaveBeenCalledTimes(2);
      expect(productSpy).toHaveBeenCalledTimes(2);
      expect(sumSpy).toHaveBeenLastCalledWith(9); // 2+3+4
      expect(productSpy).toHaveBeenLastCalledWith(24); // 2*3*4
    });

    it('should handle conditional updates in batch', () => {
      const condition = signal(true);
      const value = signal(0);
      
      const spy = vi.fn();
      effect(() => {
        if (condition()) {
          spy(value());
        }
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      
      batch(() => {
        condition(false);
        value(100); // 这个变化不应该触发 effect，因为 condition 是 false
        condition(true);
        value(200);
      });
      
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(200);
    });
  });

  describe('batch return value', () => {
    it('should return the result of the batched function', () => {
      const count = signal(0);
      
      const result = batch(() => {
        count(5);
        return count() * 2;
      });
      
      expect(result).toBe(10);
    });

    it('should propagate errors from batched function', () => {
      const count = signal(0);
      
      expect(() => {
        batch(() => {
          count(5);
          throw new Error('Test error');
        });
      }).toThrow('Test error');
      
      // 即使出错，状态更新也应该生效
      expect(count()).toBe(5);
    });
  });

  describe('compatibility functions', () => {
    it('should provide clearPendingEffects for compatibility', () => {
      // 这是一个兼容性函数，不应该抛出错误
      expect(() => clearPendingEffects()).not.toThrow();
    });
  });
}); 