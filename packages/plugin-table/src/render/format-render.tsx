import { CopyText, CurrencyText, Description, NumberText, RangePrice, TimeText } from '@ali/merlion-ui';
import type { TagProps } from 'antd';
import { Badge, Tag } from 'antd';
import type { ColumnType } from 'antd/es/table';
import get from 'lodash/get';
import { ComponentProps } from 'react';
import {
  BaseFormatType,
  ExtendableFormatRender,
  FormatRender,
  InferFormatRender,
  InferFormatType,
  RenderHelpers,
  RendererFunction,
} from './type';

const Empty = ({ text = '--' }) => <span className="text-gray-400">{text}</span>;

const basicRender: FormatRender = (format, options) => {
  const { extendRenders, ignoreCase } = options ?? {};
  const [formatName, ...args] = Array.isArray(format) ? format : [format, null];
  const [columnArgs = {}, ...extraArgs] = args;

  const nextFormatRender = (format: BaseFormatType) => basicRender(format, options);

  // Check for registered renderer first
  const render = (() => {
    if (ignoreCase) {
      return Object.entries(extendRenders ?? {}).find(([key]) => key.toLowerCase() === formatName.toLowerCase())?.[1];
    }
    return extendRenders?.[formatName];
  })();

  if (render) {
    return (text: any, record: any, index?: number) => {
      const helpers: RenderHelpers = {
        formatRender: nextFormatRender,
        renderEmpty: () => <Empty />,
        columnArgs,
        extraArgs,
      };
      return render(helpers)(text, record, index);
    };
  }

  // Basic type handling
  return (text: any) => {
    if (typeof text === 'string') {
      return text;
    }

    if (Array.isArray(text)) {
      return <span className="max-w-50 text-sm">{text.join(',')}</span>;
    }

    if (text === null || text === undefined) {
      return <Empty />;
    }

    return text;
  };
};

// 定义内置渲染器，使用明确的 Props 类型
export type NumberTextProps = ComponentProps<typeof NumberText>;
export type CurrencyTextProps = ComponentProps<typeof CurrencyText>;
export type CopyTextProps = ComponentProps<typeof CopyText>;
export type TimeTextProps = ComponentProps<typeof TimeText>;

// 定义内置渲染器
const builtInRenderers = {
  Number: ((helpers: RenderHelpers) => (text: number) => (
    <NumberText value={text} {...helpers.columnArgs} />
  )) as RendererFunction<NumberTextProps>,

  Percent: ((helpers: RenderHelpers) => (text: number) => (
    <NumberText value={text} percent {...helpers.columnArgs} />
  )) as RendererFunction<NumberTextProps>,

  Boolean: ((helpers: RenderHelpers) => (text: any) => {
    const {
      Yes = <Badge status="success" text="Yes" />,
      No = <Badge status="error" text="No" />,
      Default = Empty,
    } = helpers.columnArgs || {};

    if (text === null || text === undefined) {
      return <Default />;
    }
    const isTrue = (value: any) => {
      if (typeof value === 'boolean') {
        return value;
      }
      return value === 'true' || value === 1 || value === '1';
    };

    return isTrue(text) ? Yes : No;
  }) as RendererFunction<Record<string, any>>,

  USDCurrency: ((helpers: RenderHelpers) => (text: number) => (
    <CurrencyText value={text} country="US" iso precision={2} {...helpers.columnArgs} />
  )) as RendererFunction<CurrencyTextProps>,

  Currency: ((helpers: RenderHelpers) => (text: number) => (
    <CurrencyText value={text} precision={2} {...helpers.columnArgs} />
  )) as RendererFunction<CurrencyTextProps>,

  CopyText: ((helpers: RenderHelpers) => (text: string) =>
    text ? (
      <CopyText value={text} hoverShowEdit {...helpers.columnArgs}>
        {text}
      </CopyText>
    ) : (
      '--'
    )) as RendererFunction<CopyTextProps>,

  Time: ((helpers: RenderHelpers) => (text: number | string) =>
    text ? <TimeText value={text} {...helpers.columnArgs} /> : '--') as RendererFunction<TimeTextProps>,

  Text: ((helpers: RenderHelpers) => (text: string) => (text ? text : <Empty />)) as RendererFunction<
    Record<string, any>
  >,

  PriceRange: ((helpers: RenderHelpers) => (text: number, record) => {
    const [min, max] = helpers.columnArgs.map((key) => get(record, key as string[]));
    return <RangePrice value={[min, max]} />;
  }) as RendererFunction<[number, number]>,

  NumberRange: ((helpers: RenderHelpers) => (text: number, record) => {
    const [min, max] = helpers.columnArgs.map((key) => get(record, key as string[]));
    return <RangePrice value={[min, max]} />;
  }) as RendererFunction<[number, number]>,

  Array: ((helpers: RenderHelpers) => (text: string[]) => (
    <div className="max-w-50 text-sm">
      {Array.isArray(text) ? text.join(helpers.columnArgs?.separator || ',') : text}
    </div>
  )) as RendererFunction<{ separator?: string }>,

  Enum: ((helpers: RenderHelpers) => (text: string) => {
    const { as: As = Tag, Default = Empty } = helpers.extraArgs[0] ?? {};
    const propsMap = helpers.columnArgs;
    const props = propsMap[text];

    if (!props) {
      return <Default />;
    }

    return <As {...props}>{props?.text || text}</As>;
  }) as RendererFunction<Record<string, Partial<TagProps> & { text: string }>>,

  Description: ((helpers: RenderHelpers) => (text: string, record) => {
    const { items = [], ...rest } = helpers.columnArgs ?? {};
    return (
      <Description className="format-description w-max" {...rest}>
        {items?.map((item, index) => {
          const title = item.title as any;
          return (
            <Description.Item key={title} label={title}>
              {(() => {
                const render = item.render ?? helpers.formatRender(item.format!);
                return render?.(get(record, item.dataIndex as string[])!, record, index);
              })()}
            </Description.Item>
          );
        })}
      </Description>
    );
  }) as RendererFunction<Record<string, any>>,
};

/**
 * 创建可递归注册的格式化渲染器
 * 每个创建的渲染器都可以继续被扩展和注册
 * @param baseRender 基础渲染器，默认使用 formatToRender
 * @param initialExtends 初始扩展的渲染器集合
 * @returns 可扩展的格式化渲染器
 */
export const createExtendableFormatRender = <T extends Record<string, RendererFunction<any>>>(
  baseRender: FormatRender = basicRender,
  initialExtends: T = {} as T,
): ExtendableFormatRender<T> => {
  // 创建当前渲染函数
  const currentRender: InferFormatRender<T> = (format, options) => {
    return baseRender(format as BaseFormatType, {
      ...options,
      extendRenders: {
        ...initialExtends,
        ...options?.extendRenders,
      },
    });
  };

  // 添加扩展能力
  const extendableRender = currentRender as ExtendableFormatRender<T>;

  // 实现 register 和 extend 方法（功能相同，为了语义化）
  extendableRender.register = <R extends Record<string, RendererFunction<any>>>(
    extendsRender: R,
  ): ExtendableFormatRender<T & R> => {
    return createExtendableFormatRender<T & R>(baseRender, { ...initialExtends, ...extendsRender } as T & R);
  };

  extendableRender.extend = extendableRender.register;

  return extendableRender;
};

// 导出类型化的格式化渲染器
export const formatRender = createExtendableFormatRender(basicRender, builtInRenderers);

/**
 * 转换格式化的列配置
 */
export const transformFormatTableColumn = <T extends Record<string, RendererFunction<any>>>(
  columnSchema: any[],
  _formatRender: InferFormatRender<T> = formatRender as any,
) => {
  return columnSchema.map((item) => {
    return {
      ellipsis: true,
      ...item,
      render: item.render ?? _formatRender(item.format as InferFormatType<T>),
    } as ColumnType<any>;
  });
};
