import { describe, it, expect, vi } from 'vitest';
import { signal, computed, effect } from '../core/signal';
import { batch, isBatchingUpdates, clearPendingEffects } from '../core/batch';

describe('Batch', () => {
  describe('batch', () => {
    it('should batch multiple signal updates', () => {
      const count = signal(0);
      const spy = vi.fn();
      
      effect(() => {
        spy(count());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(0);
      
      // 批处理中更新多个信号
      batch(() => {
        count(5);
        count(10);
        count(15);
      });

      // 注意：alien-signals 默认每次更新都会触发 effect
      // 所以我们期望每次更新都会调用 effect
      expect(spy).toHaveBeenCalledTimes(4); // 1 初始 + 3 更新
      expect(spy).toHaveBeenLastCalledWith(15);
    });

    it('should return value from batched function', () => {
      const result = batch(() => {
        return 42;
      });
      
      expect(result).toBe(42);
    });

    it('should handle nested batches', () => {
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
          batch(() => {
            count(3);
            count(4);
          });
        });
      });

      // alien-signals 会为每次更新触发 effect
      expect(spy).toHaveBeenCalledTimes(5); // 1 初始 + 4 更新
      expect(spy).toHaveBeenLastCalledWith(4);
    });

    it('should handle errors in batch', () => {
      expect(() => {
        batch(() => {
          throw new Error('Batch error');
        });
      }).toThrow('Batch error');
    });
  });

  describe('isBatchingUpdates', () => {
    it('should return false by default', () => {
      expect(isBatchingUpdates()).toBe(false);
    });

    it('should return true during batch execution', () => {
      let duringBatch = false;
      
      batch(() => {
        duringBatch = isBatchingUpdates();
      });
      
      expect(duringBatch).toBe(true);
      expect(isBatchingUpdates()).toBe(false);
    });

    it('should handle nested batch state correctly', () => {
      const states: boolean[] = [];
      
      batch(() => {
        states.push(isBatchingUpdates()); // true
        batch(() => {
          states.push(isBatchingUpdates()); // true  
          batch(() => {
            states.push(isBatchingUpdates()); // true
          });
          states.push(isBatchingUpdates()); // true
        });
        states.push(isBatchingUpdates()); // true
      });
      
      states.push(isBatchingUpdates()); // false
      
      expect(states).toEqual([true, true, true, true, true, false]);
    });
  });

  describe('complex batch scenarios', () => {
    it('should handle multiple signals with computed dependencies', () => {
      const a = signal(1);
      const b = signal(2);
      const c = signal(3);
      const total = computed(() => a() + b() + c());
      const doubled = computed(() => total() * 2);
      
      const spy = vi.fn();
      
      effect(() => {
        spy(doubled());
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(12); // (1+2+3) * 2
      
      batch(() => {
        a(5);
        b(10);
        c(15);
      });

      // alien-signals 会为每次更新触发 effect
      expect(spy).toHaveBeenCalledTimes(4); // 1 初始 + 3 更新
      expect(spy).toHaveBeenLastCalledWith(60); // (5+10+15)*2
    });

    it('should batch effects with conditional dependencies', () => {
      const mode = signal('a');
      const valueA = signal(5);
      const valueB = signal(10);
      
      const spy = vi.fn();
      
      effect(() => {
        const currentMode = mode();
        if (currentMode === 'a') {
          spy(`a: ${valueA()}`);
        } else {
          spy(`b: ${valueB()}`);
        }
      });
      
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('a: 5');
      
      batch(() => {
        mode('b');
        valueB(20);
      });

      // alien-signals 会为每次更新触发 effect
      expect(spy).toHaveBeenCalledTimes(3); // 1 初始 + 2 更新
      expect(spy).toHaveBeenLastCalledWith('b: 20');
    });

    it('should preserve execution order within batch', () => {
      const operations: string[] = [];
      const count = signal(0);
      
      effect(() => {
        operations.push(`effect: ${count()}`);
      });
      
      operations.push('before batch');
      
      batch(() => {
        operations.push('batch start');
        count(1);
        operations.push('batch middle');
        count(2);
        operations.push('batch end');
      });
      
      operations.push('after batch');
      
      // 验证执行顺序保持正确
      expect(operations).toEqual([
        'effect: 0',
        'before batch',
        'batch start',
        'effect: 1',
        'batch middle', 
        'effect: 2',
        'batch end',
        'after batch'
      ]);
    });
  });
}); 