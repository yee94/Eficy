import { signal } from '@eficy/reactive';
import { describe, expect, it } from 'vitest';
import {
  hasReactiveProps,
  hasSignalChildren,
  isReactivePropKey,
  stripReactiveSuffix,
} from '../src/utils/reactiveProps';

describe('Reactive Prop Key Detection', () => {
  describe('isReactivePropKey', () => {
    it('should return true for keys ending with $', () => {
      expect(isReactivePropKey('value$')).toBe(true);
      expect(isReactivePropKey('checked$')).toBe(true);
      expect(isReactivePropKey('loading$')).toBe(true);
      expect(isReactivePropKey('customProp$')).toBe(true);
    });

    it('should return false for keys not ending with $', () => {
      expect(isReactivePropKey('value')).toBe(false);
      expect(isReactivePropKey('checked')).toBe(false);
      expect(isReactivePropKey('loading')).toBe(false);
      expect(isReactivePropKey('onClick')).toBe(false);
    });

    it('should return false for keys with $ in the middle', () => {
      expect(isReactivePropKey('$value')).toBe(false);
      expect(isReactivePropKey('my$prop')).toBe(false);
    });

    it('should return false for just $', () => {
      expect(isReactivePropKey('$')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isReactivePropKey('')).toBe(false);
    });
  });

  describe('stripReactiveSuffix', () => {
    it('should remove $ suffix from reactive keys', () => {
      expect(stripReactiveSuffix('value$')).toBe('value');
      expect(stripReactiveSuffix('checked$')).toBe('checked');
      expect(stripReactiveSuffix('loading$')).toBe('loading');
    });

    it('should return the same key if not reactive', () => {
      expect(stripReactiveSuffix('value')).toBe('value');
      expect(stripReactiveSuffix('onClick')).toBe('onClick');
    });
  });
});

describe('hasReactiveProps', () => {
  it('should return true when props contain $ suffix keys', () => {
    const sig = signal(1);
    expect(hasReactiveProps({ value$: sig })).toBe(true);
    expect(hasReactiveProps({ loading$: sig, className: 'test' })).toBe(true);
  });

  it('should return false when props have no $ suffix keys', () => {
    expect(hasReactiveProps({ value: 1 })).toBe(false);
    expect(hasReactiveProps({ className: 'test', onClick: () => {} })).toBe(false);
    expect(hasReactiveProps({})).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(hasReactiveProps(null as any)).toBe(false);
    expect(hasReactiveProps(undefined as any)).toBe(false);
  });
});

describe('hasSignalChildren', () => {
  it('should return true for Signal child', () => {
    const sig = signal('text');
    expect(hasSignalChildren(sig)).toBe(true);
  });

  it('should return true for array containing Signal', () => {
    const sig = signal('text');
    expect(hasSignalChildren([sig, 'plain text'])).toBe(true);
    expect(hasSignalChildren(['text', sig, 123])).toBe(true);
  });

  it('should return false for plain values', () => {
    expect(hasSignalChildren('text')).toBe(false);
    expect(hasSignalChildren(123)).toBe(false);
    expect(hasSignalChildren(null)).toBe(false);
    expect(hasSignalChildren(undefined)).toBe(false);
  });

  it('should return false for array without Signal', () => {
    expect(hasSignalChildren(['text', 123, null])).toBe(false);
    expect(hasSignalChildren([])).toBe(false);
  });

  it('should handle nested arrays (shallow check only)', () => {
    const sig = signal('text');
    expect(hasSignalChildren([[sig]])).toBe(false);
  });
});
