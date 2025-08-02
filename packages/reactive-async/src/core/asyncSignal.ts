import { Action, computed, ObservableClass, signal } from '@eficy/reactive';
import type { AsyncSignalOptions, AsyncSignalResult, Data, Params, Service } from '../types';
import { CancelToken, createCancelToken, debounce, delay, isEqual, makeCancellable, throttle } from '../utils';
import { cacheManager } from './cache';

/**
 * 请求状态管理类
 */
class RequestManager<TData, TParams extends any[]> extends ObservableClass {
  // 响应式状态
  public data = signal<TData | undefined>(undefined);
  public loading = signal<boolean>(false);
  public error = signal<Error | undefined>(undefined);
  public params = signal<TParams | undefined>(undefined);

  // 内部状态
  private currentCancelToken: CancelToken | null = null;
  private pollingTimer: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private windowFocusHandler: (() => void) | null = null;

  constructor(private service: Service<TData, TParams>, private options: AsyncSignalOptions<TData, TParams> = {}) {
    super();

    // 设置初始数据
    if (options.initialData !== undefined) {
      this.data(options.initialData);
    }

    // 绑定窗口焦点事件
    if (options.refreshOnWindowFocus) {
      this.windowFocusHandler = this.handleWindowFocus.bind(this);
      window.addEventListener('focus', this.windowFocusHandler);
    }

    // 自动触发请求
    if (!options.manual && options.ready !== false) {
      // 使用 setTimeout 确保在下一个事件循环中执行，避免同步执行问题
      setTimeout(() => {
        this.runRequest(...(options.defaultParams || ([] as any)));
      }, 0);
    }
  }

  /**
   * 执行请求
   */
  @Action
  private async runRequest(...params: TParams): Promise<TData> {
    // 检查是否已准备就绪
    if (this.options.ready === false) {
      throw new Error('Request is not ready');
    }

    // 取消当前请求
    this.cancelRequest();

    // 检查缓存
    if (this.options.cacheKey) {
      const cached = cacheManager.get<TData>(this.options.cacheKey);
      if (cached && isEqual(cached.params, params)) {
        // 检查数据是否在保鲜期内
        const isStale = this.options.staleTime ? Date.now() - cached.time > this.options.staleTime : false;

        if (!isStale) {
          this.data(cached.data);
          this.loading(false);
          this.error(undefined);
          this.params(params);
          return cached.data;
        }
      }
    }

    // 创建取消令牌
    this.currentCancelToken = createCancelToken();

    // 设置loading状态
    this.loading(true);
    this.error(undefined);
    this.params(params);

    // 调用 onBefore 回调
    this.options.onBefore?.(params);

    try {
      // 执行请求
      const servicePromise = this.service(...params);
      const result = await makeCancellable(servicePromise, this.currentCancelToken);

      // 格式化结果
      const formattedResult = this.options.formatResult ? this.options.formatResult(result) : result;

      // 更新状态
      this.data(formattedResult);
      this.loading(false);
      this.error(undefined);
      this.retryCount = 0;

      // 缓存结果
      if (this.options.cacheKey && this.options.cacheTime) {
        cacheManager.set(this.options.cacheKey, formattedResult, params, this.options.cacheTime);
      }

      // 调用成功回调
      this.options.onSuccess?.(formattedResult, params);
      this.options.onFinally?.(params, formattedResult, undefined);

      // 启动轮询
      this.startPolling();

      return formattedResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // 如果是取消错误，直接返回
      if (this.currentCancelToken?.isCancelled) {
        throw error;
      }

      // 重试逻辑
      if (this.shouldRetry(error)) {
        this.retryCount++;
        await delay(this.options.retryInterval || 1000);
        return this.runRequest(...params);
      }

      // 更新错误状态
      this.loading(false);
      this.error(error);

      // 调用错误回调
      this.options.onError?.(error, params);
      this.options.onFinally?.(params, undefined, error);

      throw error;
    }
  }

  /**
   * 防抖包装的请求函数
   */
  private debouncedRun = this.options.debounceWait
    ? debounce(this.runRequest.bind(this), this.options.debounceWait)
    : null;

  /**
   * 节流包装的请求函数
   */
  private throttledRun = this.options.throttleWait
    ? throttle(this.runRequest.bind(this), this.options.throttleWait)
    : null;

  /**
   * 公共运行方法
   */
  run = (...params: TParams): Promise<TData> => {
    if (this.debouncedRun) {
      return new Promise((resolve, reject) => {
        this.debouncedRun!(...params);
        // 防抖情况下，我们需要等待实际请求完成
        // 这里简化处理，实际使用中可能需要更复杂的逻辑
        setTimeout(() => {
          if (this.error()) {
            reject(this.error());
          } else {
            resolve(this.data()!);
          }
        }, this.options.debounceWait! + 100);
      });
    }

    if (this.throttledRun) {
      return new Promise((resolve, reject) => {
        this.throttledRun!(...params);
        // 节流情况下的处理逻辑
        setTimeout(() => {
          if (this.error()) {
            reject(this.error());
          } else {
            resolve(this.data()!);
          }
        }, 100);
      });
    }

    return this.runRequest(...params);
  };

  /**
   * 刷新请求（使用上次参数）
   */
  refresh = (): Promise<TData> => {
    if (!this.params()) {
      throw new Error('No previous params to refresh');
    }
    return this.run(...this.params());
  };

  /**
   * 取消请求
   */
  cancel = (): void => {
    this.cancelRequest();
    this.stopPolling();
  };

  /**
   * 修改数据
   */
  @Action
  mutate(data: TData | undefined | ((oldData: TData | undefined) => TData | undefined)): void {
    if (typeof data === 'function') {
      this.data((data as Function)(this.data()));
    } else {
      this.data(data);
    }
  }

  /**
   * 销毁管理器
   */
  destroy = (): void => {
    this.cancel();

    // 移除窗口焦点事件监听
    if (this.windowFocusHandler) {
      window.removeEventListener('focus', this.windowFocusHandler);
    }
  };

  /**
   * 内部方法：取消当前请求
   */
  private cancelRequest(): void {
    if (this.currentCancelToken && !this.currentCancelToken.isCancelled) {
      this.currentCancelToken.cancel();
    }
    this.loading(false);
  }

  /**
   * 内部方法：启动轮询
   */
  private startPolling(): void {
    if (this.options.pollingInterval && this.options.pollingInterval > 0) {
      this.pollingTimer = setTimeout(() => {
        if (this.params()) {
          this.runRequest(...this.params()).catch(() => {
            // 轮询错误时继续下一次轮询
          });
        }
      }, this.options.pollingInterval);
    }
  }

  /**
   * 内部方法：停止轮询
   */
  private stopPolling(): void {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * 内部方法：判断是否应该重试
   */
  private shouldRetry(error: Error): boolean {
    const maxRetries = this.options.retryCount || 0;
    return this.retryCount < maxRetries;
  }

  /**
   * 内部方法：处理窗口焦点
   */
  private handleWindowFocus = (): void => {
    if (this.params() && this.data() !== undefined) {
      this.refresh().catch(() => {
        // 忽略焦点刷新错误
      });
    }
  };
}

/**
 * useRequest Hook - 返回响应式对象
 */
export function asyncSignal<TService extends Service>(
  service: TService,
  options?: AsyncSignalOptions<Data<TService>, Params<TService>>,
): AsyncSignalResult<Data<TService>, Params<TService>> {
  // 创建请求管理器
  const manager = new RequestManager(service, options);

  type RequestResult = AsyncSignalResult<Data<TService>, Params<TService>>;

  // 返回响应式结果对象 - 使用 getter 保持响应性
  const result = {
    // 基础属性使用 getter，保持与 signal 同步
    // 注意：@eficy/reactive 的 signal 是函数调用风格，不是 .value 风格
    get data() {
      return manager.data();
    },
    get loading() {
      return manager.loading();
    },
    get error() {
      return manager.error();
    },

    // 方法直接绑定
    run: manager.run,
    refresh: manager.refresh,
    cancel: manager.cancel,
    mutate: manager.mutate,

    // 信号访问器 - 用于高级响应式用法
    $data: manager.data,
    $loading: manager.loading,
    $error: manager.error,
  } as unknown as RequestResult;

  result.computed = <T>(selector: (state: RequestResult) => T) => computed<T>(() => selector(result));

  return result;
}
