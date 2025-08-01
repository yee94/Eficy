/**
 * Debug signal resolution
 */

import { describe, it, expect } from 'vitest';
import { signal, isSignal } from '@eficy/reactive';
import { hasSignals, resolveSignals } from '@eficy/core-v3/utils';

describe('Debug Signals', () => {
  it('should debug signal detection', () => {
    const count = signal(42);
    
    console.log('Signal value:', count());
    console.log('Signal type:', typeof count);
    console.log('Signal function string:', count.toString());
    console.log('Signal has marker:', (count as any)['__SIGNAL__']);
    console.log('isSignal result:', isSignal(count));
    console.log('hasSignals result:', hasSignals({ count }));
    
    const resolved = resolveSignals(count);
    console.log('Resolved value:', resolved);
    
    expect(count()).toBe(42);
  });
});