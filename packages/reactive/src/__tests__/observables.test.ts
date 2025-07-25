import { describe, it, expect, vi, beforeEach } from 'vitest';
import { observableArray, observableObject, ref, isRef, unref, toRefs } from '../index';
import { signal, computed, effect } from '../core/signal';

describe('Observables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('observableArray', () => {
    it('should create reactive array with initial values', () => {
      const arr = observableArray([1, 2, 3]);
      expect(arr.value).toEqual([1, 2, 3]);
      expect(arr.length).toBe(3);
    });

    it('should react to push operations', () => {
      const arr = observableArray<number>([]);
      const spy = vi.fn();

      effect(() => {
        spy(arr.length);
      });

      expect(spy).toHaveBeenCalledWith(0);

      arr.push(1, 2, 3);
      expect(spy).toHaveBeenCalledWith(3);
      expect(arr.toArray()).toEqual([1, 2, 3]);
    });

    it('should react to pop operations', () => {
      const arr = observableArray([1, 2, 3]);
      const spy = vi.fn();

      effect(() => {
        spy(arr.toArray());
      });

      expect(spy).toHaveBeenCalledWith([1, 2, 3]);

      const popped = arr.pop();
      expect(popped).toBe(3);
      expect(spy).toHaveBeenCalledWith([1, 2]);
    });

    it('should react to splice operations', () => {
      const arr = observableArray([1, 2, 3, 4, 5]);
      const spy = vi.fn();

      effect(() => {
        spy(arr.toArray());
      });

      const removed = arr.splice(2, 1, 10, 11);
      expect(removed).toEqual([3]);
      expect(spy).toHaveBeenLastCalledWith([1, 2, 10, 11, 4, 5]);
    });

    it('should support array methods without mutation', () => {
      const arr = observableArray([1, 2, 3, 4, 5]);
      
      expect(arr.map(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
      expect(arr.filter(x => x > 2)).toEqual([3, 4, 5]);
      expect(arr.find(x => x > 2)).toBe(3);
      expect(arr.indexOf(3)).toBe(2);
      expect(arr.includes(3)).toBe(true);
    });

    it('should support element access and modification', () => {
      const arr = observableArray([1, 2, 3]);
      const spy = vi.fn();

      effect(() => {
        spy(arr.get(1));
      });

      expect(arr.get(1)).toBe(2);
      expect(spy).toHaveBeenCalledWith(2);

      arr.set(1, 10);
      expect(arr.get(1)).toBe(10);
      expect(spy).toHaveBeenCalledWith(10);
    });

    it('should handle complex reactive scenarios', () => {
      const todos = observableArray<{ id: number; text: string; done: boolean }>([]);
      const completedCount = computed(() => 
        todos.filter(todo => todo.done).length
      );

      const spy = vi.fn();
      effect(() => {
        spy(completedCount());
      });

      expect(spy).toHaveBeenCalledWith(0);

      todos.push(
        { id: 1, text: 'Task 1', done: false },
        { id: 2, text: 'Task 2', done: true }
      );

      expect(spy).toHaveBeenCalledWith(1);

      // Update existing item
      const firstTodo = todos.get(0);
      todos.set(0, { ...firstTodo, done: true });

      expect(spy).toHaveBeenCalledWith(2);
    });
  });

  describe('observableObject', () => {
    it('should create reactive object with initial values', () => {
      const obj = observableObject({ name: 'John', age: 30 });
      expect(obj.value).toEqual({ name: 'John', age: 30 });
      expect(obj.get('name')).toBe('John');
      expect(obj.get('age')).toBe(30);
    });

    it('should react to property changes', () => {
      const user = observableObject({ name: 'John', age: 30 });
      const spy = vi.fn();

      effect(() => {
        spy(user.get('name'));
      });

      expect(spy).toHaveBeenCalledWith('John');

      user.set('name', 'Jane');
      expect(spy).toHaveBeenCalledWith('Jane');
    });

    it('should react to batch updates', () => {
      const user = observableObject({ name: 'John', age: 30, email: 'john@example.com' });
      const spy = vi.fn();

      effect(() => {
        spy(`${user.get('name')} (${user.get('age')})`);
      });

      expect(spy).toHaveBeenCalledWith('John (30)');

      user.update({ name: 'Jane', age: 25 });
      expect(spy).toHaveBeenCalledWith('Jane (25)');
    });

    it('should support property deletion', () => {
      const obj = observableObject({ a: 1, b: 2, c: 3 });
      const spy = vi.fn();

      effect(() => {
        spy(obj.keys().length);
      });

      expect(spy).toHaveBeenCalledWith(3);

      obj.delete('b');
      expect(spy).toHaveBeenCalledWith(2);
      expect(obj.toObject()).toEqual({ a: 1, c: 3 });
    });

    it('should handle nested object updates', () => {
      interface User {
        profile: {
          name: string;
          settings: {
            theme: string;
          };
        };
      }

      const user = observableObject<User>({
        profile: {
          name: 'John',
          settings: {
            theme: 'dark'
          }
        }
      });

      const spy = vi.fn();
      effect(() => {
        spy(user.get('profile').settings.theme);
      });

      expect(spy).toHaveBeenCalledWith('dark');

      user.update({
        profile: {
          name: 'John',
          settings: {
            theme: 'light'
          }
        }
      });

      expect(spy).toHaveBeenCalledWith('light');
    });
  });

  describe('ref', () => {
    it('should create reactive reference', () => {
      const count = ref(0);
      expect(count.value).toBe(0);

      count.value = 5;
      expect(count.value).toBe(5);
    });

    it('should react to value changes', () => {
      const name = ref('John');
      const spy = vi.fn();

      effect(() => {
        spy(name.value);
      });

      expect(spy).toHaveBeenCalledWith('John');

      name.value = 'Jane';
      expect(spy).toHaveBeenCalledWith('Jane');
    });

    it('should work with objects', () => {
      const user = ref({ name: 'John', age: 30 });
      const spy = vi.fn();

      effect(() => {
        spy(user.value.name);
      });

      expect(spy).toHaveBeenCalledWith('John');

      user.value = { name: 'Jane', age: 25 };
      expect(spy).toHaveBeenCalledWith('Jane');
    });

    it('should support computed refs', () => {
      const firstName = ref('John');
      const lastName = ref('Doe');
      
      const fullName = computed(() => `${firstName.value} ${lastName.value}`);
      const spy = vi.fn();

      effect(() => {
        spy(fullName());
      });

      expect(spy).toHaveBeenCalledWith('John Doe');

      firstName.value = 'Jane';
      expect(spy).toHaveBeenCalledWith('Jane Doe');
    });
  });

  describe('ref utilities', () => {
    it('should identify refs correctly', () => {
      const count = ref(0);
      const notRef = { value: 0 };
      const sig = signal(0);

      expect(isRef(count)).toBe(true);
      expect(isRef(notRef)).toBe(false);
      expect(isRef(sig)).toBe(false);
      expect(isRef(null)).toBe(false);
    });

    it('should unref values correctly', () => {
      const count = ref(5);
      const notRef = 10;

      expect(unref(count)).toBe(5);
      expect(unref(notRef)).toBe(10);
    });

    it('should convert objects to refs', () => {
      const user = { name: 'John', age: 30 };
      const refs = toRefs(user);

      expect(isRef(refs.name)).toBe(true);
      expect(isRef(refs.age)).toBe(true);
      expect(refs.name.value).toBe('John');
      expect(refs.age.value).toBe(30);

      const spy = vi.fn();
      effect(() => {
        spy(refs.name.value);
      });

      refs.name.value = 'Jane';
      expect(spy).toHaveBeenCalledWith('Jane');
    });
  });

  describe('observable integration', () => {
    it('should work together in complex scenarios', () => {
      const todos = observableArray<{ id: number; text: string; done: boolean }>([]);
      const filter = ref<'all' | 'active' | 'completed'>('all');
      
      const filteredTodos = computed(() => {
        const allTodos = todos.toArray();
        switch (filter.value) {
          case 'active':
            return allTodos.filter(t => !t.done);
          case 'completed':
            return allTodos.filter(t => t.done);
          default:
            return allTodos;
        }
      });

      const summary = observableObject({
        total: computed(() => todos.length),
        active: computed(() => todos.filter(t => !t.done).length),
        completed: computed(() => todos.filter(t => t.done).length)
      });

      const spy = vi.fn();
      effect(() => {
        spy({
          filtered: filteredTodos().length,
          summary: summary.toObject()
        });
      });

      // Initial state
      expect(spy).toHaveBeenCalledWith({
        filtered: 0,
        summary: { total: 0, active: 0, completed: 0 }
      });

      // Add todos
      todos.push(
        { id: 1, text: 'Task 1', done: false },
        { id: 2, text: 'Task 2', done: true },
        { id: 3, text: 'Task 3', done: false }
      );

      expect(spy).toHaveBeenLastCalledWith({
        filtered: 3,
        summary: { total: 3, active: 2, completed: 1 }
      });

      // Change filter
      filter.value = 'active';
      expect(spy).toHaveBeenLastCalledWith({
        filtered: 2,
        summary: { total: 3, active: 2, completed: 1 }
      });

      // Complete a task
      const firstTodo = todos.get(0);
      todos.set(0, { ...firstTodo, done: true });

      expect(spy).toHaveBeenLastCalledWith({
        filtered: 1,
        summary: { total: 3, active: 1, completed: 2 }
      });
    });
  });
}); 