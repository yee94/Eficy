import { describe, it, expect } from 'vitest';
import { 
  observable, 
  computed, 
  action,
  makeObservable,
  ObservableClass,
  effect
} from '../annotation';

describe('Simple Array Test', () => {
  it('should track array changes in computed', () => {
    class SimpleStore extends ObservableClass {
      @observable
      items: string[] = [];

      @computed
      get itemCount(): number {
        console.log('Computing itemCount, items.length:', this.items.length);
        return this.items.length;
      }

      @action
      addItem(item: string) {
        console.log('Before addItem, items.length:', this.items.length);
        this.items.push(item);
        console.log('After addItem, items.length:', this.items.length);
      }
    }

    const store = new SimpleStore();

    // 建立 effect 来观察变化
    let effectCount = 0;
    let lastCount = 0;
    effect(() => {
      effectCount++;
      lastCount = store.itemCount;
      console.log(`Effect run ${effectCount}, itemCount: ${lastCount}`);
    });

    expect(effectCount).toBe(1);
    expect(lastCount).toBe(0);

    console.log('=== Adding first item ===');
    store.addItem('item1');
    
    console.log('After adding item1 - effectCount:', effectCount, 'lastCount:', lastCount);
    expect(effectCount).toBe(2);
    expect(lastCount).toBe(1);
  });

  it('should track array filter in computed', () => {
    interface Item {
      name: string;
      active: boolean;
    }

    class FilterStore extends ObservableClass {
      @observable
      items: Item[] = [];

      @computed
      get activeItems(): Item[] {
        console.log('Computing activeItems, items.length:', this.items.length);
        const result = this.items.filter(item => item.active);
        console.log('activeItems result length:', result.length);
        return result;
      }

      @action
      addItem(name: string, active: boolean) {
        this.items.push({ name, active });
      }
    }

    const store = new FilterStore();

    // 建立 effect 来观察变化
    let effectCount = 0;
    let lastActiveCount = 0;
    effect(() => {
      effectCount++;
      lastActiveCount = store.activeItems.length;
      console.log(`Effect run ${effectCount}, activeItems.length: ${lastActiveCount}`);
    });

    expect(effectCount).toBe(1);
    expect(lastActiveCount).toBe(0);

    console.log('=== Adding active item ===');
    store.addItem('item1', true);
    
    console.log('After adding active item - effectCount:', effectCount, 'lastActiveCount:', lastActiveCount);
    expect(effectCount).toBe(2);
    expect(lastActiveCount).toBe(1);
  });
}); 