import { createComputed } from '@eficy/reactive';

/**
 * AsyncState 标记接口
 */
export type AsyncStateMarker<T = any> = (() => ReturnType<typeof createComputed<T>>) & {
  __asyncState: true;
};

export const createAsyncStateComputed = <T>(computed: () => T): AsyncStateMarker<T> => {
  const result = (() => createComputed(computed)) as AsyncStateMarker<T>;
  result.__asyncState = true;
  return result;
};
