import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, signal } from '../core/signal';
import { watch, watchDebounced, watchMultiple, watchOnce } from '../core/watch';
import { ref } from '../observables/ref';

describe('Watch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  describe('watch', () => {
    it('should watch signal changes', () => {
      const count = signal(0);
      const spy = vi.fn();

      watch(() => count.value, spy);

      count.value = 1;
      expect(spy).toHaveBeenCalledWith(1, 0);

      count.value = 2;
      expect(spy).toHaveBeenCalledWith(2, 1);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should watch computed values', () => {
      const x = signal(2);
      const y = signal(3);
      const sum = computed(() => x.value + y.value);
      const spy = vi.fn();

      watch(() => sum.value, spy);

      x.value = 5;
      expect(spy).toHaveBeenCalledWith(8, 5);

      y.value = 7;
      expect(spy).toHaveBeenCalledWith(12, 8);
    });

    it('should watch ref values', () => {
      const name = ref('John');
      const spy = vi.fn();

      watch(() => name.value, spy);

      name.value = 'Jane';
      expect(spy).toHaveBeenCalledWith('Jane', 'John');

      name.value = 'Bob';
      expect(spy).toHaveBeenCalledWith('Bob', 'Jane');
    });

    it('should support immediate execution', () => {
      const count = signal(5);
      const spy = vi.fn();

      watch(() => count.value, spy, { immediate: true });

      // Should be called immediately with initial value
      expect(spy).toHaveBeenCalledWith(5, undefined);

      count.value = 10;
      expect(spy).toHaveBeenCalledWith(10, 5);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should return dispose function', () => {
      const count = signal(0);
      const spy = vi.fn();

      const dispose = watch(() => count.value, spy);

      count.value = 1;
      expect(spy).toHaveBeenCalledTimes(1);

      dispose();

      count.value = 2;
      expect(spy).toHaveBeenCalledTimes(1); // Should not be called after dispose
    });

    it('should handle errors in getter', () => {
      const count = signal(0);
      const spy = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      watch(() => {
        if (count.value > 2) {
          throw new Error('Test error');
        }
        return count.value;
      }, spy);

      count.value = 1;
      expect(spy).toHaveBeenCalledWith(1, 0);

      count.value = 3;
      expect(consoleSpy).toHaveBeenCalledWith('Error in watch getter:', expect.any(Error));
      expect(spy).toHaveBeenCalledTimes(1); // Should not be called when getter throws

      consoleSpy.mockRestore();
    });

    it('should handle errors in callback', () => {
      const count = signal(0);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      watch(
        () => count.value,
        () => {
          throw new Error('Callback error');
        },
      );

      count.value = 1;
      expect(consoleSpy).toHaveBeenCalledWith('Error in watch callback:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('watchMultiple', () => {
    it('should watch multiple values', () => {
      const x = signal(1);
      const y = signal(2);
      const z = signal(3);
      const spy = vi.fn();

      watchMultiple([() => x.value, () => y.value, () => z.value], spy);

      x.value = 5;
      expect(spy).toHaveBeenCalledWith([5, 2, 3], [1, 2, 3]);

      y.value = 10;
      expect(spy).toHaveBeenCalledWith([5, 10, 3], [5, 2, 3]);

      z.value = 15;
      expect(spy).toHaveBeenCalledWith([5, 10, 15], [5, 10, 3]);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should support immediate execution', () => {
      const x = signal(1);
      const y = signal(2);
      const spy = vi.fn();

      watchMultiple([() => x.value, () => y.value], spy, { immediate: true });

      expect(spy).toHaveBeenCalledWith([1, 2], undefined);

      x.value = 5;
      expect(spy).toHaveBeenCalledWith([5, 2], [1, 2]);
    });

    it('should only trigger when values actually change', () => {
      const x = signal(1);
      const y = signal(2);
      const spy = vi.fn();

      watchMultiple([() => x.value, () => y.value], spy);

      // Set to same values
      x.value = 1;
      y.value = 2;
      expect(spy).not.toHaveBeenCalled();

      // Change one value
      x.value = 5;
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('watchOnce', () => {
    it('should trigger only once', () => {
      const count = signal(0);
      const spy = vi.fn();

      watchOnce(() => count.value, spy);

      count.value = 1;
      expect(spy).toHaveBeenCalledWith(1, 0);

      count.value = 2;
      count.value = 3;
      expect(spy).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it('should return dispose function that works', () => {
      const count = signal(0);
      const spy = vi.fn();

      const dispose = watchOnce(() => count.value, spy);

      dispose(); // Dispose before any changes

      count.value = 1;
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('watchDebounced', () => {
    it('should debounce rapid changes', () => {
      const count = signal(0);
      const spy = vi.fn();

      watchDebounced(() => count.value, spy, 100);

      count.value = 1;
      count.value = 2;
      count.value = 3;

      // Should not be called immediately
      expect(spy).not.toHaveBeenCalled();

      // Fast-forward time by 100ms
      vi.advanceTimersByTime(100);

      // Should be called with latest value
      expect(spy).toHaveBeenCalledWith(3, 0);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should reset debounce timer on new changes', () => {
      const count = signal(0);
      const spy = vi.fn();

      watchDebounced(() => count.value, spy, 100);

      count.value = 1;
      vi.advanceTimersByTime(50);

      count.value = 2;
      vi.advanceTimersByTime(50);

      // Should not be called yet (timer was reset)
      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);

      // Should be called now
      expect(spy).toHaveBeenCalledWith(2, 0);
    });

    it('should clean up timer on dispose', () => {
      const count = signal(0);
      const spy = vi.fn();

      const dispose = watchDebounced(() => count.value, spy, 100);

      count.value = 1;
      dispose();

      vi.advanceTimersByTime(100);

      // Should not be called after dispose
      expect(spy).not.toHaveBeenCalled();
    });

    it('should handle errors in debounced callback', () => {
      const count = signal(0);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      watchDebounced(
        () => count.value,
        () => {
          throw new Error('Debounced callback error');
        },
        100,
      );

      count.value = 1;
      vi.advanceTimersByTime(100);

      expect(consoleSpy).toHaveBeenCalledWith('Error in debounced watch callback:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('watch integration scenarios', () => {
    it('should handle complex reactive dependencies', () => {
      const todos = signal<{ id: number; text: string; done: boolean }[]>([]);
      const filter = signal<'all' | 'active' | 'completed'>('all');

      const filteredTodos = computed(() => {
        const allTodos = todos.value;
        switch (filter.value) {
          case 'active':
            return allTodos.filter((t) => !t.done);
          case 'completed':
            return allTodos.filter((t) => t.done);
          default:
            return allTodos;
        }
      });

      const spy = vi.fn();
      watch(() => filteredTodos.value, spy);

      // Add todos
      todos.value = [
        { id: 1, text: 'Task 1', done: false },
        { id: 2, text: 'Task 2', done: true },
      ];

      expect(spy).toHaveBeenCalledWith(
        [
          { id: 1, text: 'Task 1', done: false },
          { id: 2, text: 'Task 2', done: true },
        ],
        [],
      );

      // Change filter
      filter.value = 'active';
      expect(spy).toHaveBeenLastCalledWith(
        [{ id: 1, text: 'Task 1', done: false }],
        [
          { id: 1, text: 'Task 1', done: false },
          { id: 2, text: 'Task 2', done: true },
        ],
      );
    });

    it('should work with multiple watch types together', () => {
      const value = signal(0);
      const normalSpy = vi.fn();
      const debouncedSpy = vi.fn();
      const onceSpy = vi.fn();

      watch(() => value.value, normalSpy);
      watchDebounced(() => value.value, debouncedSpy, 100);
      watchOnce(() => value.value, onceSpy);

      value.value = 1;
      expect(normalSpy).toHaveBeenCalledWith(1, 0);
      expect(onceSpy).toHaveBeenCalledWith(1, 0);
      expect(debouncedSpy).not.toHaveBeenCalled();

      value.value = 2;
      expect(normalSpy).toHaveBeenCalledWith(2, 1);
      expect(onceSpy).toHaveBeenCalledTimes(1); // Only once
      expect(debouncedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(debouncedSpy).toHaveBeenCalledWith(2, 0);
    });
  });
});
