import { AsyncStateMarker } from "../utils/marker";

/**
 * 通用服务函数类型
 */
export type Service<TData = any, TParams extends any[] = any[]> = (
  ...args: TParams
) => Promise<TData>;

/**
 * 服务函数返回的数据类型
 */
export type Data<TService extends Service> = TService extends Service<
  infer TData,
  any
>
  ? TData
  : never;

/**
 * 服务函数的参数类型
 */
export type Params<TService extends Service> = TService extends Service<
  any,
  infer TParams
>
  ? TParams
  : never;

/**
 * AsyncSignal 返回值类型
 */
export interface AsyncSignalResult<TData, TParams extends any[]> {
  /** 响应数据 */
  data: TData | undefined;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | undefined;
  /** 手动触发请求 */
  run: (...params: TParams) => Promise<TData>;
  /** 使用上次的参数重新触发请求 */
  refresh: () => Promise<TData>;
  /** 取消当前请求 */
  cancel: () => void;
  /** 修改数据 */
  mutate: (data: TData | undefined | ((oldData: TData | undefined) => TData | undefined)) => void;
  
  // 信号访问器 - 用于高级响应式用法
  /** 数据信号 - 可以在 computed 中使用 */
  $data?: any;
  /** 加载状态信号 - 可以在 computed 中使用 */
  $loading?: any;
  /** 错误信号 - 可以在 computed 中使用 */
  $error?: any;

  /** 计算属性 */
  computed: <T>(selector: (state: AsyncSignalResult<TData, TParams>) => T) => AsyncStateMarker<T>;
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
