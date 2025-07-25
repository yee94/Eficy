import { describe, it, expect, vi, beforeEach } from 'vitest';
import { watch, watchMultiple, watchOnce, watchDebounced } from '../core/watch';
import { signal, computed } from '../core/signal';
import { ref } from '../observables/ref';

describe('Watch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('watch', () => {
    it('should watch signal changes', () => {
      const count = signal(0);
      const spy = vi.fn();

      watch(() => count(), spy);

      count(1);
      expect(spy).toHaveBeenCalledWith(1, 0);

      count(2);
      expect(spy).toHaveBeenCalledWith(2, 1);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should watch computed values', () => {
      const x = signal(2);
      const y = signal(3);
      const sum = computed(() => x() + y());
      const spy = vi.fn();

      watch(() => sum(), spy);

      x(5);
      expect(spy).toHaveBeenCalledWith(8, 5);

      y(7);
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

      watch(() => count(), spy, { immediate: true });

      // Should be called immediately with initial value
      expect(spy).toHaveBeenCalledWith(5, undefined);

      count(10);
      expect(spy).toHaveBeenCalledWith(10, 5);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should return dispose function', () => {
      const count = signal(0);
      const spy = vi.fn();

      const dispose = watch(() => count(), spy);

      count(1);
      expect(spy).toHaveBeenCalledTimes(1);

      dispose();

      count(2);
      expect(spy).toHaveBeenCalledTimes(1); // Should not be called after dispose
    });

    it('should handle errors in getter', () => {
      const count = signal(0);
      const spy = vi.fn();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      watch(() => {
        if (count() > 2) {
          throw new Error('Test error');
        }
        return count();
      }, spy);

      count(1);
      expect(spy).toHaveBeenCalledWith(1, 0);

      count(3);
      expect(consoleSpy).toHaveBeenCalledWith('Error in watch getter:', expect.any(Error));
      expect(spy).toHaveBeenCalledTimes(1); // Should not be called when getter throws

      consoleSpy.mockRestore();
    });

    it('should handle errors in callback', () => {
      const count = signal(0);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      watch(() => count(), () => {
        throw new Error('Callback error');
      });

      count(1);
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

      watchMultiple([() => x(), () => y(), () => z()], spy);

      x(5);
      expect(spy).toHaveBeenCalledWith([5, 2, 3], [1, 2, 3]);

      y(10);
      expect(spy).toHaveBeenCalledWith([5, 10, 3], [5, 2, 3]);

      z(15);
      expect(spy).toHaveBeenCalledWith([5, 10, 15], [5, 10, 3]);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('should support immediate execution', () => {
      const x = signal(1);
      const y = signal(2);
      const spy = vi.fn();

      watchMultiple([() => x(), () => y()], spy, { immediate: true });

      expect(spy).toHaveBeenCalledWith([1, 2], undefined);

      x(5);
      expect(spy).toHaveBeenCalledWith([5, 2], [1, 2]);
    });

    it('should only trigger when values actually change', () => {
      const x = signal(1);
      const y = signal(2);
      const spy = vi.fn();

      watchMultiple([() => x(), () => y()], spy);

      // Set to same values
      x(1);
      y(2);
      expect(spy).not.toHaveBeenCalled();

      // Change one value
      x(5);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('watchOnce', () => {
    it('should trigger only once', () => {
      const count = signal(0);
      const spy = vi.fn();

      watchOnce(() => count(), spy);

      count(1);
      expect(spy).toHaveBeenCalledWith(1, 0);

      count(2);
      count(3);
      expect(spy).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it('should return dispose function that works', () => {
      const count = signal(0);
      const spy = vi.fn();

      const dispose = watchOnce(() => count(), spy);

      dispose(); // Dispose before any changes

      count(1);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('watchDebounced', () => {
    it('should debounce rapid changes', () => {
      const count = signal(0);
      const spy = vi.fn();

      watchDebounced(() => count(), spy, 100);

      count(1);
      count(2);
      count(3);

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

      watchDebounced(() => count(), spy, 100);

      count(1);
      vi.advanceTimersByTime(50);

      count(2);
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

      const dispose = watchDebounced(() => count(), spy, 100);

      count(1);
      dispose();

      vi.advanceTimersByTime(100);

      // Should not be called after dispose
      expect(spy).not.toHaveBeenCalled();
    });

    it('should handle errors in debounced callback', () => {
      const count = signal(0);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      watchDebounced(() => count(), () => {
        throw new Error('Debounced callback error');
      }, 100);

      count(1);
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
        const allTodos = todos();
        switch (filter()) {
          case 'active':
            return allTodos.filter(t => !t.done);
          case 'completed':
            return allTodos.filter(t => t.done);
          default:
            return allTodos;
        }
      });

      const spy = vi.fn();
      watch(() => filteredTodos(), spy);

      // Add todos
      todos([
        { id: 1, text: 'Task 1', done: false },
        { id: 2, text: 'Task 2', done: true }
      ]);

      expect(spy).toHaveBeenCalledWith(
        [
          { id: 1, text: 'Task 1', done: false },
          { id: 2, text: 'Task 2', done: true }
        ],
        []
      );

      // Change filter
      filter('active');
      expect(spy).toHaveBeenLastCalledWith(
        [{ id: 1, text: 'Task 1', done: false }],
        [
          { id: 1, text: 'Task 1', done: false },
          { id: 2, text: 'Task 2', done: true }
        ]
      );
    });

    it('should work with multiple watch types together', () => {
      const value = signal(0);
      const normalSpy = vi.fn();
      const debouncedSpy = vi.fn();
      const onceSpy = vi.fn();

      watch(() => value(), normalSpy);
      watchDebounced(() => value(), debouncedSpy, 100);
      watchOnce(() => value(), onceSpy);

      value(1);
      expect(normalSpy).toHaveBeenCalledWith(1, 0);
      expect(onceSpy).toHaveBeenCalledWith(1, 0);
      expect(debouncedSpy).not.toHaveBeenCalled();

      value(2);
      expect(normalSpy).toHaveBeenCalledWith(2, 1);
      expect(onceSpy).toHaveBeenCalledTimes(1); // Only once
      expect(debouncedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(debouncedSpy).toHaveBeenCalledWith(2, 0);
    });
  });
}); 