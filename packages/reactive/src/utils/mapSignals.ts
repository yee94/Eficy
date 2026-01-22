import { clone, isDangerousKey, isIntString, traverse } from 'radashi';
import { isValidElement } from 'react';
import { isSignal } from './helpers';

const isDev = process.env.NODE_ENV !== 'production';

type Signal<T> = () => T;

type MapSignalsDeep<T> = T extends Signal<infer U>
  ? MapSignalsDeep<U>
  : T extends readonly (infer U)[]
    ? readonly MapSignalsDeep<U>[]
    : T extends (infer U)[]
      ? MapSignalsDeep<U>[]
      : T extends Record<string, any>
        ? { readonly [K in keyof T]: MapSignalsDeep<T[K]> }
        : T;

function set(initial, path, value) {
  if (!initial) {
    return {};
  }
  if (!path) {
    return initial;
  }
  return (function recurse(object, keys2, index) {
    const key = keys2[index];
    object ??= isIntString(key) ? [] : {};
    if (isDangerousKey(key, object)) {
      throw new Error(`Unsafe key in path: ${key}`);
    }
    if (index < keys2.length - 1) {
      value = recurse(object[key], keys2, index + 1);
    }
    if (!Object.is(object[key], value)) {
      object = clone(object);
      object[key] = value;
    }
    return object;
  })(initial, path.match(/[^.[\]]+/g), 0);
}

export interface MapSignalsOptions {
  maxDepth?: number;
  warnOnDepthLimit?: boolean;
  warnOnCircularReference?: boolean;
  warnOnObjectValue?: boolean;
}

const VALUE_PROP_KEYS = ['value', 'defaultValue', 'checked', 'defaultChecked'];

export function mapSignals<T extends Record<string, any>>(
  obj: T,
  maxDepthOrOptions?: number | MapSignalsOptions,
): MapSignalsDeep<T> {
  const options: MapSignalsOptions =
    typeof maxDepthOrOptions === 'number' ? { maxDepth: maxDepthOrOptions } : (maxDepthOrOptions ?? {});

  const maxDepth = options.maxDepth ?? 10;
  const warnOnDepthLimit = options.warnOnDepthLimit ?? true;
  const warnOnCircularReference = options.warnOnCircularReference ?? true;
  const warnOnObjectValue = options.warnOnObjectValue ?? true;

  if (!obj || typeof obj !== 'object') {
    return obj as MapSignalsDeep<T>;
  }

  const seen = new WeakSet<object>();
  let depthWarned = false;

  let result = Array.isArray(obj) ? [...obj] : { ...obj };

  traverse(result, (value, key, parent, context) => {
    const depth = context.parents?.length ?? 0;
    const pathStr = context.path.join('.');

    if (value && typeof value === 'object' && !isSignal(value) && !isValidElement(value)) {
      if (seen.has(value)) {
        if (isDev && warnOnCircularReference) {
          console.warn(`[Eficy] Circular reference detected at "${pathStr}". Skipping to prevent infinite loop.`);
        }
        context.skip();
        return;
      }
      seen.add(value);
    }

    if (depth > maxDepth) {
      if (isDev && warnOnDepthLimit && !depthWarned) {
        console.warn(
          `[Eficy] Maximum depth (${maxDepth}) reached at "${pathStr}". Consider flattening your data structure or increasing maxDepth.`,
        );
        depthWarned = true;
      }
      result = set(result, pathStr, value);
      context.skip();
      return;
    }

    if (isValidElement(value)) {
      result = set(result, pathStr, value);
      context.skip();
      return;
    }

    if (isSignal(value)) {
      const resolvedValue = value.value;
      const keyStr = String(key);

      if (isDev && warnOnObjectValue && VALUE_PROP_KEYS.includes(keyStr)) {
        if (resolvedValue && typeof resolvedValue === 'object' && !Array.isArray(resolvedValue)) {
          console.warn(
            `[Eficy] Object Signal passed to "${keyStr}" prop at "${pathStr}". ` +
              `This may cause unexpected behavior. Consider using a specific property like "${keyStr}.someField" instead.`,
          );
        }
      }

      result = set(result, pathStr, resolvedValue);
      context.skip();
      return;
    }
    result = set(result, pathStr, value);
  });

  return result as MapSignalsDeep<T>;
}

export function hasSignals<T extends Record<string, any>>(obj: T, maxDepth = 10): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  let hasSignal = false;
  const seen = new WeakSet<object>();

  traverse(obj, (value, key, parent, context) => {
    const depth = context.parents?.length ?? 0;

    if (value && typeof value === 'object' && !isSignal(value)) {
      if (seen.has(value)) {
        context.skip();
        return;
      }
      seen.add(value);
    }

    if (depth > maxDepth) {
      context.skip();
      return;
    }

    if (isSignal(value)) {
      hasSignal = true;
      return false;
    }
    return;
  });

  return hasSignal;
}
