import { describe, expect, it } from 'vitest';
import { signal } from '../core/signal';
import { bind } from '../utils/bind';

describe('bind() helper', () => {
  describe('standard props', () => {
    it('should return value and onChange by default', () => {
      const name = signal('test');
      const props = bind(name);

      expect(props).toHaveProperty('value');
      expect(props).toHaveProperty('onChange');
    });

    it('should return the current signal value as value', () => {
      const name = signal('hello');
      const props = bind(name);

      expect(props.value).toBe('hello');
    });

    it('should use custom valueKey', () => {
      const selected = signal('option1');
      const props = bind(selected, { valueKey: 'selected' });

      expect(props).toHaveProperty('selected');
      expect(props.selected).toBe('option1');
    });

    it('should use custom eventKey', () => {
      const text = signal('');
      const props = bind(text, { eventKey: 'onInput' });

      expect(props).toHaveProperty('onInput');
      expect(typeof props.onInput).toBe('function');
    });

    it('should support both custom keys', () => {
      const data = signal('initial');
      const props = bind(data, { valueKey: 'data', eventKey: 'onDataChange' });

      expect(props).toHaveProperty('data');
      expect(props).toHaveProperty('onDataChange');
      expect(props.data).toBe('initial');
    });
  });

  describe('onChange handler', () => {
    it('should update signal when onChange is called with e.target.value', () => {
      const name = signal('');
      const props = bind(name);

      props.onChange({ target: { value: 'new value' } } as any);

      expect(name.value).toBe('new value');
    });

    it('should handle e.target.checked for checkboxes', () => {
      const checked = signal(false);
      const props = bind(checked);

      props.onChange({ target: { checked: true, type: 'checkbox' } } as any);

      expect(checked.value).toBe(true);
    });

    it('should handle e.target.checked for radio buttons', () => {
      const selected = signal(false);
      const props = bind(selected);

      props.onChange({ target: { checked: true, type: 'radio' } } as any);

      expect(selected.value).toBe(true);
    });

    it('should handle direct value (not event object)', () => {
      const count = signal(0);
      const props = bind(count);

      props.onChange(42);

      expect(count.value).toBe(42);
    });
  });

  describe('type handling', () => {
    it('should work with number signals', () => {
      const num = signal(42);
      const props = bind(num);

      expect(props.value).toBe(42);
      props.onChange(100);
      expect(num.value).toBe(100);
    });

    it('should work with boolean signals', () => {
      const flag = signal(false);
      const props = bind(flag);

      expect(props.value).toBe(false);
      props.onChange(true);
      expect(flag.value).toBe(true);
    });

    it('should work with object signals', () => {
      const obj = signal({ name: 'test' });
      const props = bind(obj);

      expect(props.value).toEqual({ name: 'test' });
      props.onChange({ name: 'updated' });
      expect(obj.value).toEqual({ name: 'updated' });
    });

    it('should work with array signals', () => {
      const items = signal(['a', 'b']);
      const props = bind(items);

      props.onChange(['a', 'b', 'c']);

      expect(items.value).toEqual(['a', 'b', 'c']);
    });
  });
});
