import { describe, expect, it, vi } from 'vitest';
import { signal } from '../core/signal';
import { bind } from '../utils/bind';

describe('bind() helper', () => {
  describe('basic functionality', () => {
    it('should return object with value and onChange', () => {
      const name = signal('test');
      const props = bind(name);

      expect(props).toHaveProperty('value');
      expect(props).toHaveProperty('onChange');
      expect(typeof props.onChange).toBe('function');
    });

    it('should return current signal value as value', () => {
      const name = signal('hello');
      const props = bind(name);

      expect(props.value).toBe('hello');
    });

    it('should update signal when onChange is called with e.target.value', () => {
      const name = signal('');
      const props = bind(name);

      props.onChange({ target: { value: 'new value' } } as any);

      expect(name()).toBe('new value');
    });

    it('should handle e.target.checked for checkboxes', () => {
      const checked = signal(false);
      const props = bind(checked);

      props.onChange({ target: { checked: true, type: 'checkbox' } } as any);

      expect(checked()).toBe(true);
    });

    it('should handle direct value (not event object)', () => {
      const count = signal(0);
      const props = bind(count);

      props.onChange(42);

      expect(count()).toBe(42);
    });
  });

  describe('custom key configuration', () => {
    it('should support custom valueKey', () => {
      const selected = signal('option1');
      const props = bind(selected, { valueKey: 'selected' });

      expect(props).toHaveProperty('selected');
      expect((props as any).selected).toBe('option1');
    });

    it('should support custom eventKey', () => {
      const text = signal('');
      const props = bind(text, { eventKey: 'onInput' });

      expect(props).toHaveProperty('onInput');
      expect(typeof (props as any).onInput).toBe('function');
    });

    it('should support both custom keys', () => {
      const data = signal('initial');
      const props = bind(data, { valueKey: 'data', eventKey: 'onDataChange' });

      expect(props).toHaveProperty('data');
      expect(props).toHaveProperty('onDataChange');
      expect((props as any).data).toBe('initial');
    });
  });

  describe('signal synchronization', () => {
    it('value should reflect signal updates', () => {
      const count = signal(0);
      const props = bind(count);

      expect(props.value).toBe(0);

      count.set(10);
      const newProps = bind(count);
      expect(newProps.value).toBe(10);
    });

    it('onChange should work with functional updates', () => {
      const items = signal(['a', 'b']);
      const props = bind(items);

      props.onChange(['a', 'b', 'c']);

      expect(items()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('type handling', () => {
    it('should work with number signals', () => {
      const num = signal(42);
      const props = bind(num);

      expect(props.value).toBe(42);
      props.onChange(100);
      expect(num()).toBe(100);
    });

    it('should work with boolean signals', () => {
      const flag = signal(false);
      const props = bind(flag);

      expect(props.value).toBe(false);
      props.onChange(true);
      expect(flag()).toBe(true);
    });

    it('should work with object signals', () => {
      const obj = signal({ name: 'test' });
      const props = bind(obj);

      expect(props.value).toEqual({ name: 'test' });
      props.onChange({ name: 'updated' });
      expect(obj()).toEqual({ name: 'updated' });
    });
  });
});
