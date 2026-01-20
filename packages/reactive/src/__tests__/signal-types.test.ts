import { describe, expect, it } from 'vitest';
import { computed, signal } from '../core/signal';
import { type ComputedSignal, SIGNAL_BRAND, type Signal } from '../types/index';

describe('Signal Types - Branded Types and New API', () => {
  describe('Signal Brand', () => {
    it('should have SIGNAL_BRAND symbol defined', () => {
      expect(typeof SIGNAL_BRAND).toBe('symbol');
    });

    it('signal should have brand marker', () => {
      const count = signal(0);
      expect((count as any)[SIGNAL_BRAND]).toBe(true);
    });

    it('computed should have brand marker', () => {
      const count = signal(0);
      const doubled = computed(() => count() * 2);
      expect((doubled as any)[SIGNAL_BRAND]).toBe(true);
    });
  });

  describe('Signal .get() method', () => {
    it('signal should have .get() method that returns current value', () => {
      const count = signal(5);
      expect(typeof count.get).toBe('function');
      expect(count.get()).toBe(5);
    });

    it('computed should have .get() method that returns computed value', () => {
      const count = signal(3);
      const doubled = computed(() => count() * 2);
      expect(typeof doubled.get).toBe('function');
      expect(doubled.get()).toBe(6);
    });

    it('.get() should reflect updated values', () => {
      const count = signal(0);
      count.set(10);
      expect(count.get()).toBe(10);
    });
  });

  describe('Signal .value property', () => {
    it('signal should have .value getter that returns current value', () => {
      const count = signal(42);
      expect(count.value).toBe(42);
    });

    it('signal should have .value setter that updates value', () => {
      const count = signal(0);
      count.value = 100;
      expect(count()).toBe(100);
      expect(count.value).toBe(100);
    });

    it('computed should have .value getter (read-only)', () => {
      const count = signal(5);
      const doubled = computed(() => count() * 2);
      expect(doubled.value).toBe(10);
    });

    it('.value should reflect changes from other update methods', () => {
      const count = signal(0);

      count(5);
      expect(count.value).toBe(5);

      count.set(10);
      expect(count.value).toBe(10);

      count.value = 15;
      expect(count()).toBe(15);
    });
  });

  describe('Backward Compatibility', () => {
    it('existing signal() call style should still work', () => {
      const count = signal(0);
      expect(count()).toBe(0);

      count(5);
      expect(count()).toBe(5);
    });

    it('existing signal.set() should still work', () => {
      const count = signal(0);
      count.set(10);
      expect(count()).toBe(10);

      count.set((prev) => prev + 5);
      expect(count()).toBe(15);
    });

    it('existing computed() should still work', () => {
      const a = signal(2);
      const b = signal(3);
      const sum = computed(() => a() + b());

      expect(sum()).toBe(5);

      a(10);
      expect(sum()).toBe(13);
    });
  });

  describe('TypeScript Type Inference', () => {
    it('signal type should be correctly inferred', () => {
      const numSignal = signal(0);
      const strSignal = signal('hello');
      const objSignal = signal({ name: 'test' });

      const num: number = numSignal();
      const str: string = strSignal();
      const obj: { name: string } = objSignal();

      expect(num).toBe(0);
      expect(str).toBe('hello');
      expect(obj).toEqual({ name: 'test' });
    });

    it('.get() should return correct type', () => {
      const count = signal(42);
      const value: number = count.get();
      expect(value).toBe(42);
    });

    it('.value should have correct type', () => {
      const count = signal(42);
      const value: number = count.value;
      expect(value).toBe(42);
    });
  });
});
