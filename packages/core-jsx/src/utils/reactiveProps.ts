import { isSignal } from '@eficy/reactive';

export function isReactivePropKey(key: string): boolean {
  if (!key || key.length < 2) return false;
  return key.endsWith('$') && key.length > 1;
}

export function stripReactiveSuffix(key: string): string {
  if (isReactivePropKey(key)) {
    return key.slice(0, -1);
  }
  return key;
}

export function hasReactiveProps(props: Record<string, any> | null | undefined): boolean {
  if (!props || typeof props !== 'object') return false;
  return Object.keys(props).some(isReactivePropKey);
}

export function hasSignalChildren(children: any): boolean {
  if (children == null) return false;

  if (isSignal(children)) return true;

  if (Array.isArray(children)) {
    return children.some((child) => isSignal(child));
  }

  return false;
}
