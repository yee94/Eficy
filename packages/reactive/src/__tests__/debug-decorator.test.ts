import { describe, it, expect } from 'vitest';
import { 
  observable, 
  computed, 
  action,
  makeObservable,
  ObservableClass,
  effect
} from '../annotation';
import { observableArray } from '../observables/array';
import { isArray } from '../utils/helpers';

describe('Debug Decorator Issue', () => {
  it('should debug isArray function', () => {
    const testArray = [];
    console.log('=== Debug isArray function ===');
    console.log('testArray:', testArray);
    console.log('Array.isArray(testArray):', Array.isArray(testArray));
    console.log('isArray(testArray):', isArray(testArray));
    console.log('typeof testArray:', typeof testArray);
    console.log('testArray.constructor:', testArray.constructor);
    console.log('testArray.constructor.name:', testArray.constructor.name);
  });

  it('should test without initial value', () => {
    class TestStore extends ObservableClass {
      @observable
      items!: string[]; // 没有初始值

      @computed
      get itemCount(): number {
        console.log('=== In computed getter (no initial value) ===');
        console.log('this.items:', this.items);
        console.log('typeof this.items:', typeof this.items);
        if (this.items && this.items.constructor) {
          console.log('this.items.constructor.name:', this.items.constructor.name);
        }
        console.log('=== End computed getter ===');
        return this.items ? this.items.length : 0;
      }

      @action
      addItem(item: string) {
        if (!this.items) {
          console.log('Items is undefined, creating new array');
          this.items = [];
        }
        this.items.push(item);
      }
    }

    console.log('=== Creating TestStore without initial value ===');
    const store = new TestStore();
    console.log('=== TestStore created ===');

    console.log('=== Accessing itemCount ===');
    const count = store.itemCount;
    console.log('Got count:', count);
  });

  it('should debug what happens to items property', () => {
    class DebugStore extends ObservableClass {
      @observable
      items: string[] = [];

      @computed
      get itemCount(): number {
        console.log('=== In computed getter ===');
        console.log('this.items:', this.items);
        console.log('typeof this.items:', typeof this.items);
        console.log('this.items.constructor.name:', this.items.constructor.name);
        console.log('this.items.length:', this.items.length);
        console.log('=== End computed getter ===');
        return this.items.length;
      }

      @action
      addItem(item: string) {
        console.log('=== In addItem ===');
        console.log('Before push - this.items:', this.items);
        console.log('Before push - this.items.length:', this.items.length);
        this.items.push(item);
        console.log('After push - this.items.length:', this.items.length);
        console.log('=== End addItem ===');
      }
    }

    console.log('=== Creating store ===');
    const store = new DebugStore();
    console.log('=== Store created ===');

    console.log('=== Setting up effect ===');
    let effectCount = 0;
    effect(() => {
      effectCount++;
      console.log(`Effect run ${effectCount}, calling store.itemCount...`);
      const count = store.itemCount;
      console.log(`Effect run ${effectCount}, got count: ${count}`);
    });

    console.log('=== Adding item ===');
    store.addItem('test');
    
    console.log('=== Final check ===');
    console.log('Final effectCount:', effectCount);
    console.log('Final itemCount:', store.itemCount);
  });

  it('should compare with manual observableArray', () => {
    // 手动创建 observableArray 来对比
    const manualItems = observableArray<string>([]);
    
    console.log('=== Manual observableArray test ===');
    console.log('manualItems:', manualItems);
    console.log('typeof manualItems:', typeof manualItems);
    console.log('manualItems.constructor.name:', manualItems.constructor.name);
    console.log('manualItems.length:', manualItems.length);
    
    let manualEffectCount = 0;
    effect(() => {
      manualEffectCount++;
      console.log(`Manual effect run ${manualEffectCount}, length: ${manualItems.length}`);
    });
    
    console.log('=== Manual adding item ===');
    manualItems.push('test');
    console.log('Manual effectCount after push:', manualEffectCount);
  });
}); 