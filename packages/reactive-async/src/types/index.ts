import { Signal } from '@eficy/reactive';

/**
 * 通用服务函数类型
 */
export type Service<TData = any, TParams extends any[] = any[]> = (...args: TParams) => Promise<TData>;

/**
 * 服务函数返回的数据类型
 */
export type Data<TService extends Service> = TService extends Service<infer TData, any> ? TData : never;

/**
 * 服务函数的参数类型
 */
export type Params<TService extends Service> = TService extends Service<any, infer TParams> ? TParams : never;

/**
 * AsyncSignal 返回值类型
 */
export interface AsyncSignalResult<TData, TParams extends any[]> {
  /** 响应数据 */
  data: Signal<TData | undefined>;
  /** 加载状态 */
  loading: Signal<boolean>;
  /** 错误信息 */
  error: Signal<Error | undefined>;

  /** 手动触发请求 */
  run: (...params: TParams) => Promise<TData>;
  /** 使用上次的参数重新触发请求 */
  refresh: () => Promise<TData>;
  /** 取消当前请求 */
  cancel: () => void;
  /** 修改数据 */
  mutate: (data: TData | undefined | ((oldData: TData | undefined) => TData | undefined)) => void;

  /** 计算属性 */
  computed: <T>(selector: (state: AsyncSignalResult<TData, TParams>) => T) => Signal<T>;
}

/**
 * AsyncSignal 配置选项
 */
export interface AsyncSignalOptions<TData, TParams extends any[]> {
  /** 是否手动触发，默认 false */
  manual?: boolean;

  /** 默认参数 */
  defaultParams?: TParams;

  /** 成功回调 */
  onSuccess?: (data: TData, params: TParams) => void;

  /** 失败回调 */
  onError?: (error: Error, params: TParams) => void;

  /** 请求开始前回调 */
  onBefore?: (params: TParams) => void;

  /** 请求完成后回调（无论成功失败） */
  onFinally?: (params: TParams, data?: TData, error?: Error) => void;

  /** 格式化结果 */
  formatResult?: (response: any) => TData;

  /** 初始数据 */
  initialData?: TData;

  /** 轮询间隔（毫秒） */
  pollingInterval?: number;

  /** 窗口重新获得焦点时重新请求 */
  refreshOnWindowFocus?: boolean;

  /** 防抖等待时间（毫秒） */
  debounceWait?: number;

  /** 节流等待时间（毫秒） */
  throttleWait?: number;

  /** 重试次数 */
  retryCount?: number;

  /** 重试间隔（毫秒） */
  retryInterval?: number;

  /** 缓存键 */
  cacheKey?: string;

  /** 缓存时间（毫秒） */
  cacheTime?: number;

  /** 数据保鲜时间（毫秒） */
  staleTime?: number;

  /** 是否在组件卸载时取消请求 */
  cancelOnUnmount?: boolean;

  /** 准备就绪时才触发请求 */
  ready?: boolean;

  /** 依赖数组，依赖变化时重新请求 */
  refreshDeps?: any[];

  /** 刷新依赖比较函数 */
  refreshDepsAction?: () => void;
}

/**
 * 请求状态
 */
export interface RequestState<TData> {
  data: TData | undefined;
  loading: boolean;
  error: Error | undefined;
  params: any[] | undefined;
}

/**
 * 缓存数据结构
 */
export interface CacheData<TData> {
  data: TData;
  time: number; // 缓存创建时间
  expireTime: number; // 缓存过期时间
  params: any[];
}

/**
 * 请求管理器接口
 */
export interface RequestManager<TData, TParams extends any[]> {
  run: (...params: TParams) => Promise<TData>;
  cancel: () => void;
  refresh: () => Promise<TData>;
  mutate: (data: TData | undefined | ((oldData: TData | undefined) => TData | undefined)) => void;
}

/**
 * Antd Table 分页参数类型
 */
export interface AntdTableParams {
  current: number;
  pageSize: number;
  sorter?: any;
  filters?: any;
}

/**
 * Antd Table 服务函数类型
 */
export type AntdTableService<TData = any> = (
  params: AntdTableParams,
  formData?: any
) => Promise<{
  total: number;
  list: TData[];
}>;

/**
 * Antd Table 服务函数返回的数据类型
 */
export type AntdTableData<TService extends AntdTableService> = 
  TService extends AntdTableService<infer TData> ? TData : never;

/**
 * Form 实例接口（Antd v4+）
 */
export interface FormInstance {
  getFieldsValue: () => any;
  setFieldsValue: (values: any) => void;
  resetFields: (fields?: string[]) => void;
  validateFields: () => Promise<any>;
}

/**
 * AntdTableSignal 配置选项
 */
export interface AntdTableSignalOptions<TData> {
  /** Form 实例 */
  form?: FormInstance;
  
  /** 默认参数 [分页参数, 表单参数] */
  defaultParams?: [AntdTableParams, any?];
  
  /** 默认搜索类型 */
  defaultType?: 'simple' | 'advance';
  
  /** 默认每页条数 */
  defaultPageSize?: number;
  
  /** 依赖数组，变化时刷新 */
  refreshDeps?: any[];
  
  /** 是否手动触发 */
  manual?: boolean;
  
  /** 是否准备就绪 */
  ready?: boolean;
  
  /** 请求错误回调 */
  onRequestError?: (error: Error) => void;
  
  /** 成功回调 */
  onSuccess?: (data: { total: number; list: TData[] }, params: [AntdTableParams, any?, any?]) => void;
  
  /** 失败回调 */
  onError?: (error: Error, params: [AntdTableParams, any?, any?]) => void;
  
  /** 请求开始前回调 */
  onBefore?: (params: [AntdTableParams, any?, any?]) => void;
  
  /** 请求完成后回调（无论成功失败） */
  onFinally?: (params: [AntdTableParams, any?, any?], data?: { total: number; list: TData[] }, error?: Error) => void;
  
  /** 格式化结果 */
  formatResult?: (response: any) => { total: number; list: TData[] };
  
  /** 初始数据 */
  initialData?: { total: number; list: TData[] };
  
  /** 轮询间隔（毫秒） */
  pollingInterval?: number;
  
  /** 窗口重新获得焦点时重新请求 */
  refreshOnWindowFocus?: boolean;
  
  /** 防抖等待时间（毫秒） */
  debounceWait?: number;
  
  /** 节流等待时间（毫秒） */
  throttleWait?: number;
  
  /** 重试次数 */
  retryCount?: number;
  
  /** 重试间隔（毫秒） */
  retryInterval?: number;
  
  /** 缓存键 */
  cacheKey?: string;
  
  /** 缓存时间（毫秒） */
  cacheTime?: number;
  
  /** 数据保鲜时间（毫秒） */
  staleTime?: number;
}

/**
 * AntdTableSignal 返回值类型
 */
export interface AntdTableSignalResult<TData> {
  /** 表格属性 */
  tableProps: {
    /** 数据源 */
    dataSource: Signal<TData[]>;
    /** 加载状态 */
    loading: Signal<boolean>;
    /** 表格变化回调 */
    onChange: (pagination: any, filters: any, sorter: any) => void;
    /** 分页配置 */
    pagination: {
      current: Signal<number>;
      pageSize: Signal<number>;
      total: Signal<number>;
      showSizeChanger: Signal<boolean>;
      showQuickJumper: Signal<boolean>;
    };
  };
  
  /** 搜索控制 */
  search: {
    /** 搜索类型 */
    type: Signal<'simple' | 'advance'>;
    /** 切换搜索类型 */
    changeType: () => void;
    /** 提交搜索 */
    submit: () => void;
    /** 重置搜索 */
    reset: () => void;
  };
  
  /** 加载状态 */
  loading: Signal<boolean>;
  
  /** 错误信息 */
  error: Signal<Error | undefined>;
  
  /** 刷新数据 */
  refresh: () => Promise<{ total: number; list: TData[] }>;
  
  /** 修改数据 */
  mutate: (data: { total: number; list: TData[] } | undefined | ((oldData: { total: number; list: TData[] } | undefined) => { total: number; list: TData[] } | undefined)) => void;
  
  /** 取消请求 */
  cancel?: () => void;
}
