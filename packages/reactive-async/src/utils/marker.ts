import { computed } from '@eficy/reactive';

/**
 * AsyncState 标记接口
 */
export type AsyncStateMarker<T = any> = (() => ReturnType<typeof computed<T>>) & {
  __asyncState: true;
};

export const createAsyncStateComputed = <T>(computed: () => T): AsyncStateMarker<T> => {
  const result = (() => computed(computed)) as AsyncStateMarker<T>;
  result.__asyncState = true;
  return result;
};
