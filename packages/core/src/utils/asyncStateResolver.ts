import { computed } from '@eficy/reactive';
import mapValues from 'lodash/mapValues';

/**
 * AsyncState 标记接口（约定）
 * 任何符合这个约定的对象都会被识别为异步状态标记
 */
export type AsyncStateMarker<T = any> = () => ReturnType<typeof computed<T>> & {
  __asyncState: true;
};

/**
 * 检查是否为 AsyncState 标记（约定式识别）
 */
export function isAsyncState(value: any): value is AsyncStateMarker {
  return (
    value !== null && typeof value === 'object' && value.__asyncState === true && typeof value.selector === 'function'
  );
}

/**
 * 处理属性对象中的 AsyncState 标记
 * 递归遍历属性，将 AsyncState 标记转换为响应式值
 */
export function processAsyncStateProps(props: Record<string, any>): Record<string, any> {
  return mapValues(props, (value) => {
    if (isAsyncState(value)) {
      return value();
    }
    return value;
  }) as Record<string, any>;
}
