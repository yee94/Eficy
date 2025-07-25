import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineReactiveClass, observable, computed, actionAnnotation } from '../annotations/class';
import { effect } from '../core/signal';

describe('Annotations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('defineReactiveClass', () => {
    it('should create reactive class with observable properties', () => {
      const Counter = defineReactiveClass({
        count: observable(0),
        name: observable('counter')
      });

      expect(Counter.count()).toBe(0);
      expect(Counter.name()).toBe('counter');

      Counter.count(5);
      Counter.name('updated');

      expect(Counter.count()).toBe(5);
      expect(Counter.name()).toBe('updated');
    });

    it('should create reactive class with computed properties', () => {
      const Calculator = defineReactiveClass({
        x: observable(2),
        y: observable(3),
        sum: computed(function(this: any) {
          return this.x() + this.y();
        }),
        product: computed(function(this: any) {
          return this.x() * this.y();
        })
      });

      expect(Calculator.sum()).toBe(5);
      expect(Calculator.product()).toBe(6);

      Calculator.x(5);
      expect(Calculator.sum()).toBe(8);
      expect(Calculator.product()).toBe(15);

      Calculator.y(10);
      expect(Calculator.sum()).toBe(15);
      expect(Calculator.product()).toBe(50);
    });

    it('should create reactive class with actions', () => {
      const Store = defineReactiveClass({
        count: observable(0),
        items: observable<string[]>([]),

        increment: actionAnnotation(function(this: any) {
          this.count(this.count() + 1);
        }),

        addItem: actionAnnotation(function(this: any, item: string) {
          this.items([...this.items(), item]);
        }),

        reset: actionAnnotation(function(this: any) {
          this.count(0);
          this.items([]);
        })
      });

      const spy = vi.fn();
      effect(() => {
        spy(Store.count() + Store.items().length);
      });

      expect(spy).toHaveBeenCalledWith(0);

      Store.increment();
      expect(spy).toHaveBeenCalledWith(1);

      Store.addItem('test');
      expect(spy).toHaveBeenCalledWith(2);

      Store.reset();
      expect(spy).toHaveBeenCalledWith(0);
    });

    it('should handle complex reactive class scenarios', () => {
      interface TodoItem {
        id: number;
        text: string;
        completed: boolean;
      }

      const TodoStore = defineReactiveClass({
        todos: observable<TodoItem[]>([]),
        filter: observable<'all' | 'active' | 'completed'>('all'),

        // Computed properties
        activeTodos: computed(function(this: any) {
          return this.todos().filter((todo: TodoItem) => !todo.completed);
        }),

        completedTodos: computed(function(this: any) {
          return this.todos().filter((todo: TodoItem) => todo.completed);
        }),

        filteredTodos: computed(function(this: any) {
          const todos = this.todos();
          switch (this.filter()) {
            case 'active':
              return this.activeTodos();
            case 'completed':
              return this.completedTodos();
            default:
              return todos;
          }
        }),

        stats: computed(function(this: any) {
          return {
            total: this.todos().length,
            active: this.activeTodos().length,
            completed: this.completedTodos().length
          };
        }),

        // Actions
        addTodo: actionAnnotation(function(this: any, text: string) {
          const newTodo: TodoItem = {
            id: Date.now() + Math.random(), // 确保 id 唯一
            text,
            completed: false
          };
          this.todos([...this.todos(), newTodo]);
        }),

        toggleTodo: actionAnnotation(function(this: any, id: number) {
          this.todos(
            this.todos().map((todo: TodoItem) =>
              todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
          );
        }),

        setFilter: actionAnnotation(function(this: any, newFilter: 'all' | 'active' | 'completed') {
          this.filter(newFilter);
        }),

        clearCompleted: actionAnnotation(function(this: any) {
          this.todos(this.todos().filter((todo: TodoItem) => !todo.completed));
        })
      });

      const spy = vi.fn();
      effect(() => {
        spy({
          filtered: TodoStore.filteredTodos().length,
          stats: TodoStore.stats()
        });
      });

      // Initial state
      expect(spy).toHaveBeenCalledWith({
        filtered: 0,
        stats: { total: 0, active: 0, completed: 0 }
      });

      // Add todos
      TodoStore.addTodo('Learn TypeScript');
      TodoStore.addTodo('Build React app');
      TodoStore.addTodo('Write tests');

      expect(spy).toHaveBeenLastCalledWith({
        filtered: 3,
        stats: { total: 3, active: 3, completed: 0 }
      });

      // Complete first todo
      const firstTodo = TodoStore.todos()[0];
      TodoStore.toggleTodo(firstTodo.id);

      expect(spy).toHaveBeenLastCalledWith({
        filtered: 3,
        stats: { total: 3, active: 2, completed: 1 }
      });

      // Filter to show only active
      TodoStore.setFilter('active');

      expect(spy).toHaveBeenLastCalledWith({
        filtered: 2,
        stats: { total: 3, active: 2, completed: 1 }
      });

      // Filter to show only completed
      TodoStore.setFilter('completed');

      expect(spy).toHaveBeenLastCalledWith({
        filtered: 1,
        stats: { total: 3, active: 2, completed: 1 }
      });

      // Clear completed todos
      TodoStore.clearCompleted();

      expect(spy).toHaveBeenLastCalledWith({
        filtered: 0,
        stats: { total: 2, active: 2, completed: 0 }
      });
    });

    it('should handle method binding correctly', () => {
      const TestClass = defineReactiveClass({
        value: observable(10),

        getValue: function(this: any) {
          return this.value();
        },

        multiply: actionAnnotation(function(this: any, factor: number) {
          this.value(this.value() * factor);
        })
      });

      // Test method can be called directly
      expect(TestClass.getValue()).toBe(10);

      // Test method can be extracted and still work
      const { getValue, multiply } = TestClass;
      expect(getValue()).toBe(10);

      multiply(3);
      expect(getValue()).toBe(30);
    });

    it('should handle plain properties as signals', () => {
      const Config = defineReactiveClass({
        theme: 'dark',
        fontSize: 14,
        enabled: true
      });

      const spy = vi.fn();
      effect(() => {
        spy({
          theme: Config.theme(),
          fontSize: Config.fontSize(),
          enabled: Config.enabled()
        });
      });

      expect(spy).toHaveBeenCalledWith({
        theme: 'dark',
        fontSize: 14,
        enabled: true
      });

      Config.theme('light');
      Config.fontSize(16);

      expect(spy).toHaveBeenLastCalledWith({
        theme: 'light',
        fontSize: 16,
        enabled: true
      });
    });
  });

  describe('annotation helpers', () => {
    it('should create observable annotation', () => {
      const obsAnnotation = observable(42);
      expect(obsAnnotation.$observable).toBe(true);
      expect(obsAnnotation.value).toBe(42);
    });

    it('should create computed annotation', () => {
      const compAnnotation = computed(() => 'test');
      expect(compAnnotation.$computed).toBe(true);
      expect(typeof compAnnotation.get).toBe('function');
    });

    it('should create action annotation', () => {
      const testFn = () => 'test';
      const actionFn = actionAnnotation(testFn);
      
      expect((actionFn as any).$action).toBe(true);
      expect(actionFn()).toBe('test');
    });
  });
}); 