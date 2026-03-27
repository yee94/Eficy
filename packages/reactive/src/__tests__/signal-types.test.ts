import { describe, expect, it } from 'vitest';
import { computed, signal } from '../core/signal';
import { type ComputedSignal, SIGNAL_BRAND, type Signal } from '../types/index';

describe('Signal Types - Value-Only API', () => {
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
      const doubled = computed(() => count.value * 2);
      expect((doubled as any)[SIGNAL_BRAND]).toBe(true);
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
      expect(count.value).toBe(100);
    });

    it('computed should have .value getter (read-only)', () => {
      const count = signal(5);
      const doubled = computed(() => count.value * 2);
      expect(doubled.value).toBe(10);
    });

    it('.value should reflect changes correctly', () => {
      const count = signal(0);

      count.value = 5;
      expect(count.value).toBe(5);

      count.value = 10;
      expect(count.value).toBe(10);

      count.value = 15;
      expect(count.value).toBe(15);
    });
  });

  describe('Signal is object, not function', () => {
    it('signal should be an object', () => {
      const count = signal(0);
      expect(typeof count).toBe('object');
      expect(count).not.toBeNull();
    });

    it('signal should not be callable', () => {
      const count = signal(0);
      expect(typeof count).not.toBe('function');
    });

    it('computed should be an object', () => {
      const count = signal(0);
      const doubled = computed(() => count.value * 2);
      expect(typeof doubled).toBe('object');
      expect(doubled).not.toBeNull();
    });

    it('computed should not be callable', () => {
      const count = signal(0);
      const doubled = computed(() => count.value * 2);
      expect(typeof doubled).not.toBe('function');
    });
  });

  describe('TypeScript Type Inference', () => {
    it('signal type should be correctly inferred', () => {
      const numSignal = signal(0);
      const strSignal = signal('hello');
      const objSignal = signal({ name: 'test' });

      const num: number = numSignal.value;
      const str: string = strSignal.value;
      const obj: { name: string } = objSignal.value;

      expect(num).toBe(0);
      expect(str).toBe('hello');
      expect(obj).toEqual({ name: 'test' });
    });

    it('.value should have correct type', () => {
      const count = signal(42);
      const value: number = count.value;
      expect(value).toBe(42);
    });

    it('computed .value should have correct type', () => {
      const count = signal(42);
      const doubled = computed(() => count.value * 2);
      const value: number = doubled.value;
      expect(value).toBe(84);
    });
  });

  describe('Reactivity with .value', () => {
    it('computed should update when signal changes', () => {
      const a = signal(2);
      const b = signal(3);
      const sum = computed(() => a.value + b.value);

      expect(sum.value).toBe(5);

      a.value = 10;
      expect(sum.value).toBe(13);

      b.value = 20;
      expect(sum.value).toBe(30);
    });

    it('nested computed should work correctly', () => {
      const x = signal(1);
      const y = signal(2);
      const sum = computed(() => x.value + y.value);
      const doubled = computed(() => sum.value * 2);

      expect(sum.value).toBe(3);
      expect(doubled.value).toBe(6);

      x.value = 5;
      expect(sum.value).toBe(7);
      expect(doubled.value).toBe(14);
    });
  });
});
