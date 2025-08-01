import { useCreation } from 'ahooks';
import get from 'lodash/get';
import { formatRender } from './format-render';
import { ExtendableFormatRender, InferFormatTypeFromExtendableFormatRender, RenderOptions } from './type';

export type FormatComponentProps<T = any, F extends ExtendableFormatRender<any> = typeof formatRender> = {
  /**
   * 格式化类型，支持所有注册的格式器及其参数
   */
  format: InferFormatTypeFromExtendableFormatRender<F>;
  /**
   * 数据值, 支持数据索引
   */
  value:
    | T
    | {
        /**
         * 数据索引
         */
        dataIndex: string | string[];
        /**
         * 数据记录
         */
        record: Record<string, any>;
      };
  /**
   * 格式化渲染器
   * @default formatRender
   */
  formatRender?: F;
  /**
   * 扩展渲染器
   */
  extendRenders?: RenderOptions['extendRenders'];
};

/**
 * 动态格式化组件，通过 format 和 value 动态渲染组件
 * @param params
 * @returns
 */
export const FormatComponent = <T, F extends ExtendableFormatRender<any> = typeof formatRender>(
  params: FormatComponentProps<T, F>,
) => {
  const { format, value, formatRender: _formatRender = formatRender as F, ...restOptions } = params;

  const [renderValue, record] = useCreation(() => {
    // @ts-ignore
    if (typeof value === 'object' && 'dataIndex' in value && 'record' in value) {
      return [get(value.record, value.dataIndex), value.record];
    }
    return [value, { value }];
  }, [value]);

  const render = useCreation(
    () =>
      _formatRender(format, {
        ...restOptions,
      }),
    [format],
  );

  return render(renderValue, record);
};
