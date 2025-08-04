import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signal, computed, effect } from '../core/signal';
import { isSignal } from '../utils/helpers';

describe('Signal Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signal', () => {
    it('should create a signal with initial value', () => {
      const count = signal(0);
      expect(count()).toBe(0);
    });

    it('should update signal value', () => {
      const count = signal(0);
      count(5);
      expect(count()).toBe(5);
    });

    it('should work with different types', () => {
      const str = signal('hello');
      const bool = signal(true);
      const obj = signal({ name: 'test' });

      expect(str()).toBe('hello');
      expect(bool()).toBe(true);
      expect(obj()).toEqual({ name: 'test' });

      str('world');
      bool(false);
      obj({ name: 'updated' });

      expect(str()).toBe('world');
      expect(bool()).toBe(false);
      expect(obj()).toEqual({ name: 'updated' });
    });
  });

  describe('computed', () => {
    it('should create computed signal from other signals', () => {
      const count = signal(2);
      const doubled = computed(() => count() * 2);

      expect(doubled()).toBe(4);

      count(3);
      expect(doubled()).toBe(6);
    });

    it('should support complex computations', () => {
      const firstName = signal('John');
      const lastName = signal('Doe');
      const fullName = computed(() => `${firstName()} ${lastName()}`);

      expect(fullName()).toBe('John Doe');

      firstName('Jane');
      expect(fullName()).toBe('Jane Doe');

      lastName('Smith');
      expect(fullName()).toBe('Jane Smith');
    });

    it('should handle nested computed signals', () => {
      const a = signal(1);
      const b = signal(2);
      const sum = computed(() => a() + b());
      const product = computed(() => sum() * 2);

      expect(sum()).toBe(3);
      expect(product()).toBe(6);

      a(5);
      expect(sum()).toBe(7);
      expect(product()).toBe(14);
    });
  });

  describe('effect', () => {
    it('should run effect immediately', () => {
      const count = signal(0);
      const spy = vi.fn();

      effect(() => {
        spy(count());
      });

      expect(spy).toHaveBeenCalledWith(0);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should re-run effect when dependencies change', () => {
      const count = signal(0);
      const spy = vi.fn();

      effect(() => {
        spy(count());
      });

      count(1);
      count(2);

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(1, 0);
      expect(spy).toHaveBeenNthCalledWith(2, 1);
      expect(spy).toHaveBeenNthCalledWith(3, 2);
    });

    it('should return dispose function', () => {
      const count = signal(0);
      const spy = vi.fn();

      const dispose = effect(() => {
        spy(count());
      });

      expect(spy).toHaveBeenCalledTimes(1);

      count(1);
      expect(spy).toHaveBeenCalledTimes(2);

      dispose();
      count(2);
      expect(spy).toHaveBeenCalledTimes(2); // Should not be called after dispose
    });

    it('should handle multiple dependencies', () => {
      const x = signal(1);
      const y = signal(2);
      const spy = vi.fn();

      effect(() => {
        spy(x() + y());
      });

      expect(spy).toHaveBeenCalledWith(3);

      x(5);
      expect(spy).toHaveBeenCalledWith(7);

      y(10);
      expect(spy).toHaveBeenCalledWith(15);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should handle conditional dependencies', () => {
      const flag = signal(true);
      const a = signal(1);
      const b = signal(2);
      const spy = vi.fn();

      effect(() => {
        if (flag()) {
          spy(a());
        } else {
          spy(b());
        }
      });

      expect(spy).toHaveBeenCalledWith(1);

      a(5);
      expect(spy).toHaveBeenCalledWith(5);

      // b should not trigger effect yet
      b(10);
      expect(spy).toHaveBeenCalledTimes(2);

      // Switch condition
      flag(false);
      expect(spy).toHaveBeenCalledWith(10);

      // Now b should trigger effect
      b(20);
      expect(spy).toHaveBeenCalledWith(20);

      // a should not trigger effect anymore
      a(100);
      expect(spy).toHaveBeenCalledTimes(4);
    });
  });

  describe('signal integration', () => {
    it('should work together in complex scenarios', () => {
      const items = signal([1, 2, 3]);
      
      const filteredItems = computed(() => items().filter((x: number) => x > 1));
      
      const sum = computed(() => 
        filteredItems().reduce((a, b) => a + b, 0)
      );

      const results: number[] = [];
      effect(() => {
        results.push(sum());
      });

      expect(results).toEqual([5]); // 2 + 3

      items([1, 2, 3, 4, 5]);
      expect(results).toEqual([5, 14]); // 2 + 3 + 4 + 5

    });
  });
}); 

describe('Signal Utilities', () => {
  it('should correctly identify signals vs regular functions', () => {
    const sig = signal(42);
    const comp = computed(() => sig() * 2);
    const regularFunction = () => 42;
    const arrowFunction = () => 'hello';
    
    expect(isSignal(sig)).toBe(true);
    expect(isSignal(comp)).toBe(true);
    expect(isSignal(regularFunction)).toBe(false);
    expect(isSignal(arrowFunction)).toBe(false);
    expect(isSignal(() => {})).toBe(false);
    expect(isSignal(function() { return 123; })).toBe(false);
  });
}); 