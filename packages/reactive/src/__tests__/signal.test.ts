import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, effect, signal } from '../core/signal';
import { isSignal } from '../utils/helpers';

describe('Signal Core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signal', () => {
    it('should create a signal with initial value', () => {
      const count = signal(0);
      expect(count.value).toBe(0);
    });

    it('should update signal value', () => {
      const count = signal(0);
      count.value = 5;
      expect(count.value).toBe(5);
    });

    it('should work with different types', () => {
      const str = signal('hello');
      const bool = signal(true);
      const obj = signal({ name: 'test' });

      expect(str.value).toBe('hello');
      expect(bool.value).toBe(true);
      expect(obj.value).toEqual({ name: 'test' });

      str.value = 'world';
      bool.value = false;
      obj.value = { name: 'updated' };

      expect(str.value).toBe('world');
      expect(bool.value).toBe(false);
      expect(obj.value).toEqual({ name: 'updated' });
    });
  });

  describe('computed', () => {
    it('should create computed signal from other signals', () => {
      const count = signal(2);
      const doubled = computed(() => count.value * 2);

      expect(doubled.value).toBe(4);

      count.value = 3;
      expect(doubled.value).toBe(6);
    });

    it('should support complex computations', () => {
      const firstName = signal('John');
      const lastName = signal('Doe');
      const fullName = computed(() => `${firstName.value} ${lastName.value}`);

      expect(fullName.value).toBe('John Doe');

      firstName.value = 'Jane';
      expect(fullName.value).toBe('Jane Doe');

      lastName.value = 'Smith';
      expect(fullName.value).toBe('Jane Smith');
    });

    it('should handle nested computed signals', () => {
      const a = signal(1);
      const b = signal(2);
      const sum = computed(() => a.value + b.value);
      const product = computed(() => sum.value * 2);

      expect(sum.value).toBe(3);
      expect(product.value).toBe(6);

      a.value = 5;
      expect(sum.value).toBe(7);
      expect(product.value).toBe(14);
    });
  });

  describe('effect', () => {
    it('should run effect immediately', () => {
      const count = signal(0);
      const spy = vi.fn();

      effect(() => {
        spy(count.value);
      });

      expect(spy).toHaveBeenCalledWith(0);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should re-run effect when dependencies change', () => {
      const count = signal(0);
      const spy = vi.fn();

      effect(() => {
        spy(count.value);
      });

      count.value = 1;
      count.value = 2;

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(1, 0);
      expect(spy).toHaveBeenNthCalledWith(2, 1);
      expect(spy).toHaveBeenNthCalledWith(3, 2);
    });

    it('should return dispose function', () => {
      const count = signal(0);
      const spy = vi.fn();

      const dispose = effect(() => {
        spy(count.value);
      });

      expect(spy).toHaveBeenCalledTimes(1);

      count.value = 1;
      expect(spy).toHaveBeenCalledTimes(2);

      dispose();
      count.value = 2;
      expect(spy).toHaveBeenCalledTimes(2); // Should not be called after dispose
    });

    it('should handle multiple dependencies', () => {
      const x = signal(1);
      const y = signal(2);
      const spy = vi.fn();

      effect(() => {
        spy(x.value + y.value);
      });

      expect(spy).toHaveBeenCalledWith(3);

      x.value = 5;
      expect(spy).toHaveBeenCalledWith(7);

      y.value = 10;
      expect(spy).toHaveBeenCalledWith(15);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should handle conditional dependencies', () => {
      const flag = signal(true);
      const a = signal(1);
      const b = signal(2);
      const spy = vi.fn();

      effect(() => {
        if (flag.value) {
          spy(a.value);
        } else {
          spy(b.value);
        }
      });

      expect(spy).toHaveBeenCalledWith(1);

      a.value = 5;
      expect(spy).toHaveBeenCalledWith(5);

      // b should not trigger effect yet
      b.value = 10;
      expect(spy).toHaveBeenCalledTimes(2);

      // Switch condition
      flag.value = false;
      expect(spy).toHaveBeenCalledWith(10);

      // Now b should trigger effect
      b.value = 20;
      expect(spy).toHaveBeenCalledWith(20);

      // a should not trigger effect anymore
      a.value = 100;
      expect(spy).toHaveBeenCalledTimes(4);
    });
  });

  describe('signal integration', () => {
    it('should work together in complex scenarios', () => {
      const items = signal([1, 2, 3]);

      const filteredItems = computed(() => items.value.filter((x: number) => x > 1));

      const sum = computed(() => filteredItems.value.reduce((a, b) => a + b, 0));

      const results: number[] = [];
      effect(() => {
        results.push(sum.value);
      });

      expect(results).toEqual([5]); // 2 + 3

      items.value = [1, 2, 3, 4, 5];
      expect(results).toEqual([5, 14]); // 2 + 3 + 4 + 5
    });
  });
});

describe('Signal Utilities', () => {
  it('should correctly identify signals vs regular functions', () => {
    const sig = signal(42);
    const comp = computed(() => sig.value * 2);
    const regularFunction = () => 42;
    const arrowFunction = () => 'hello';

    expect(isSignal(sig)).toBe(true);
    expect(isSignal(comp)).toBe(true);
    expect(isSignal(regularFunction)).toBe(false);
    expect(isSignal(arrowFunction)).toBe(false);
    expect(isSignal(() => {})).toBe(false);
    expect(isSignal(() => 123)).toBe(false);
  });
});
