import { createSignal, createComputed, IWritableSignal, ISignal } from 'reactjs-signal';
import { injectable } from 'tsyringe';
import { nanoid } from 'nanoid';
import { cloneDeep, isObject, isArray } from 'lodash';

@injectable()
export class SignalStore {
  private signals = new Map<string, IWritableSignal<any>>();
  private computedSignals = new Map<string, ISignal<any>>();
  private effects = new Set<() => void>();

  createSignal<T>(key: string, initialValue: T): IWritableSignal<T> {
    if (this.signals.has(key)) {
      return this.signals.get(key)!;
    }
    
    const sig = createSignal(initialValue);
    this.signals.set(key, sig);
    return sig;
  }

  getSignal<T>(key: string): IWritableSignal<T> | undefined {
    return this.signals.get(key);
  }

  createComputed<T>(key: string, fn: () => T): ISignal<T> {
    if (this.computedSignals.has(key)) {
      return this.computedSignals.get(key)!;
    }
    
    const comp = createComputed(fn);
    this.computedSignals.set(key, comp);
    return comp;
  }

  getComputed<T>(key: string): ISignal<T> | undefined {
    return this.computedSignals.get(key);
  }

  setValue<T>(key: string, value: T): void {
    const sig = this.signals.get(key);
    if (sig) {
      sig(value);
    }
  }

  getValue<T>(key: string): T | undefined {
    const sig = this.signals.get(key);
    return sig ? sig() : undefined;
  }

  update<T>(key: string, updater: (current: T) => T): void {
    const sig = this.signals.get(key);
    if (sig) {
      sig(updater(sig()));
    }
  }

  merge<T extends Record<string, any>>(key: string, data: Partial<T>): void {
    const sig = this.signals.get(key);
    if (sig && isObject(sig())) {
      sig({ ...sig(), ...data });
    }
  }

  createObjectSignal<T extends Record<string, any>>(key: string, obj: T): Record<string, IWritableSignal<any>> {
    const signalObj: Record<string, IWritableSignal<any>> = {};
    
    Object.keys(obj).forEach(prop => {
      const signalKey = `${key}.${prop}`;
      signalObj[prop] = this.createSignal(signalKey, obj[prop]);
    });

    return signalObj;
  }

  createArraySignal<T>(key: string, arr: T[]): IWritableSignal<T[]> {
    return this.createSignal(key, arr);
  }

  appendToArray<T>(key: string, item: T): void {
    const sig = this.signals.get(key);
    if (sig && isArray(sig())) {
      sig([...sig(), item]);
    }
  }

  removeFromArray<T>(key: string, predicate: (item: T) => boolean): void {
    const sig = this.signals.get(key);
    if (sig && isArray(sig())) {
      sig(sig().filter((item: T) => !predicate(item)));
    }
  }

  clear(): void {
    this.signals.clear();
    this.computedSignals.clear();
    this.effects.forEach(dispose => dispose());
    this.effects.clear();
  }

  dispose(): void {
    this.clear();
  }

  snapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};
    this.signals.forEach((signal, key) => {
      snapshot[key] = cloneDeep(signal());
    });
    return snapshot;
  }

  restore(snapshot: Record<string, any>): void {
    Object.entries(snapshot).forEach(([key, value]) => {
      this.setValue(key, cloneDeep(value));
    });
  }
}