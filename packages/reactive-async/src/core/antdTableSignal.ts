import { computed, signal } from '@eficy/reactive';
import type {
  AntdTableService,
  AntdTableData,
  AntdTableSignalOptions,
  AntdTableSignalResult,
  AntdTableParams,
  AsyncSignalOptions,
  FormInstance,
} from '../types';
import { asyncSignal } from './asyncSignal';

/**
 * 增强的表格状态管理器
 */
class EnhancedTableStateManager<TData> {
  // 表格状态
  public current = signal<number>(1);
  public pageSize = signal<number>(10);
  public sorter = signal<any>(undefined);
  public filters = signal<any>(undefined);
  public extra = signal<any>(undefined);

  // 搜索状态
  public searchType = signal<'simple' | 'advance'>('simple');
  public currentFormData = signal<any>({});
  public allFormData = signal<any>({}); // 保存所有表单数据（包括切换类型时的数据）

  // 分页配置
  public showSizeChanger = signal<boolean>(true);
  public showQuickJumper = signal<boolean>(true);

  // 状态标识
  public ready = signal<boolean>(true);
  public runSuccessRef = signal<boolean>(false);

  // Form 实例
  private formInstance?: FormInstance;
  // 是否需要等待 form 设置
  private needsFormToStart: boolean;

  constructor(private options: AntdTableSignalOptions<TData> = {}) {
    this.formInstance = options.form;
    this.needsFormToStart = !options.form; // 如果没有传入 form，则需要等待外部设置
    this.initializeState();
  }

  private initializeState(): void {
    const defaultParams = this.options.defaultParams?.[0];
    if (defaultParams) {
      this.current(defaultParams.current);
      this.pageSize(defaultParams.pageSize);
      this.sorter(defaultParams.sorter);
      this.filters(defaultParams.filters);
    }

    if (this.options.defaultPageSize) {
      this.pageSize(this.options.defaultPageSize);
    }

    if (this.options.defaultType) {
      this.searchType(this.options.defaultType);
    }

    if (this.options.defaultParams?.[1]) {
      this.currentFormData(this.options.defaultParams[1]);
      this.allFormData(this.options.defaultParams[1]);
    }

    if (this.options.ready !== undefined) {
      this.ready(this.options.ready);
    }
  }

  /**
   * 获取当前 form 实例
   */
  private getForm(): FormInstance | undefined {
    return this.formInstance;
  }

  /**
   * 构建请求参数
   */
  buildRequestParams(): [AntdTableParams, any, any] {
    const tableParams: AntdTableParams = {
      current: this.current(),
      pageSize: this.pageSize(),
      sorter: this.sorter(),
      filters: this.filters(),
    };

    const cacheData = {
      allFormData: this.allFormData(),
      type: this.searchType(),
    };

    return [tableParams, this.currentFormData(), cacheData];
  }

  /**
   * 更新分页参数
   */
  updatePagination(pagination: any, filters: any, sorter: any, extra?: any): void {
    this.current(pagination.current || this.current());
    this.pageSize(pagination.pageSize || this.pageSize());
    this.filters(filters);
    this.sorter(sorter);
    if (extra) {
      this.extra(extra);
    }
  }

  /**
   * 重置到第一页
   */
  resetToFirstPage(): void {
    this.current(1);
  }

  /**
   * 切换搜索类型（保存当前表单数据）
   */
  toggleSearchType(): void {
    const form = this.getForm();
    if (form) {
      // 保存当前表单数据
      const activeValues = form.getFieldsValue();
      const newAllFormData = { ...this.allFormData(), ...activeValues };
      this.allFormData(newAllFormData);
    }

    this.searchType(this.searchType() === 'simple' ? 'advance' : 'simple');
  }

  /**
   * 恢复表单数据
   */
  restoreFormData(): void {
    const form = this.getForm();
    if (form) {
      form.setFieldsValue(this.allFormData());
    }
  }

  /**
   * 验证并获取表单数据
   */
  async validateAndGetFormData(): Promise<Record<string, any>> {
    const form = this.getForm();
    if (!form) {
      return {};
    }

    try {
      const values = await form.validateFields();
      return values;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 重置表单
   */
  resetForm(): void {
    const form = this.getForm();
    if (form) {
      form.resetFields();
    }
    this.currentFormData({});
    this.allFormData({});
  }

  /**
   * 更新表单数据
   */
  updateFormData(data: any): void {
    this.currentFormData(data);
    const newAllFormData = { ...this.allFormData(), ...data };
    this.allFormData(newAllFormData);
  }

  /**
   * 标记运行成功
   */
  markRunSuccess(): void {
    this.runSuccessRef(true);
  }

  /**
   * 设置 form 实例
   */
  setForm(form: FormInstance): void {
    this.formInstance = form;
    this.needsFormToStart = false; // 设置后不再需要等待
  }

  /**
   * 是否需要等待 form 设置才能开始
   */
  isWaitingForForm(): boolean {
    return this.needsFormToStart;
  }
}

/**
 * 增强的表单控制器
 */
class EnhancedFormController<TData> {
  constructor(
    private stateManager: EnhancedTableStateManager<TData>,
    private asyncResult: any,
    private options: AntdTableSignalOptions<TData>,
  ) {}

  /**
   * 提交搜索
   */
  submit = async (e?: any): Promise<void> => {
    e?.preventDefault?.();

    if (!this.stateManager.ready()) {
      return;
    }

    try {
      const values = await this.stateManager.validateAndGetFormData();

      // 更新表单数据
      this.stateManager.updateFormData(values);

      // 重置到第一页 (简化逻辑，总是重置到第一页)
      this.stateManager.resetToFirstPage();

      // 构建参数并触发请求 (不等待，保持与v2版本一致)
      const params = this.stateManager.buildRequestParams();
      this.asyncResult.run(...params);
    } catch (error) {
      // 表单验证失败，不做处理
      console.warn('Form validation failed:', error);
    }
  };

  /**
   * 重置搜索
   */
  reset = (): void => {
    // 重置表单
    this.stateManager.resetForm();

    // 重置到第一页
    this.stateManager.resetToFirstPage();

    // 使用默认参数触发请求
    const defaultParams = this.options.defaultParams?.[0] || {
      current: 1,
      pageSize: this.options.defaultPageSize || 10,
    };

    this.stateManager.current(defaultParams.current);
    this.stateManager.pageSize(defaultParams.pageSize);

    const params = this.stateManager.buildRequestParams();
    this.asyncResult.run(...params);
  };

  /**
   * 切换搜索类型
   */
  changeType = (): void => {
    this.stateManager.toggleSearchType();

    // 恢复对应类型的表单数据
    setTimeout(() => {
      this.stateManager.restoreFormData();
    }, 0);
  };
}

/**
 * 增强的表格控制器
 */
class EnhancedTableController<TData> {
  constructor(private stateManager: EnhancedTableStateManager<TData>, private asyncResult: any) {}

  /**
   * 表格变化处理
   */
  onChange = (pagination: any, filters: any, sorter: any, extra?: any): void => {
    // 获取旧的参数
    const oldParams = this.stateManager.buildRequestParams();

    // 更新状态
    this.stateManager.updatePagination(pagination, filters, sorter, extra);

    // 构建新参数（保持表单数据和缓存数据不变）
    const [, formData, cacheData] = oldParams;
    const newTableParams: AntdTableParams = {
      current: pagination.current,
      pageSize: pagination.pageSize,
      filters,
      sorter,
    };

    this.asyncResult.run(newTableParams, formData, cacheData);
  };
}

/**
 * 增强的结果适配器
 */
class EnhancedTableResultAdapter<TData> {
  public dataSource = computed(() => {
    const data = this.asyncResult.data();
    if (data && typeof data === 'object' && 'list' in data) {
      return data.list as TData[];
    }
    return [];
  });

  public total = computed(() => {
    const data = this.asyncResult.data();
    if (data && typeof data === 'object' && 'total' in data) {
      return data.total as number;
    }
    return 0;
  });

  constructor(private asyncResult: any, private stateManager: EnhancedTableStateManager<TData>) {
    this.setupSuccessCallback();
  }

  private setupSuccessCallback(): void {
    // 监听成功状态，标记运行成功
    // 注意：这里需要在实际的回调中处理
  }

  /**
   * 修改表格数据
   */
  mutateTableData(
    data:
      | { total: number; list: TData[] }
      | undefined
      | ((oldData: { total: number; list: TData[] } | undefined) => { total: number; list: TData[] } | undefined),
  ): void {
    if (typeof data === 'function') {
      const currentData = {
        total: this.total(),
        list: this.dataSource(),
      };
      const newData = data(currentData.total === 0 && currentData.list.length === 0 ? undefined : currentData);
      this.asyncResult.mutate(newData);
    } else {
      this.asyncResult.mutate(data);
    }
  }
}

/**
 * 增强的 antdTableSignal 实现
 */
export function antdTableSignal<TService extends AntdTableService>(
  service: TService,
  options?: AntdTableSignalOptions<AntdTableData<TService>>,
): AntdTableSignalResult<AntdTableData<TService>> {
  type TableData = AntdTableData<TService>;

  // 创建增强的状态管理器
  const stateManager = new EnhancedTableStateManager<TableData>(options);

  // 创建包装后的服务函数
  const wrappedService = async (...args: [AntdTableParams, any, any?]) => {
    const result = await service(args[0], args[1]);

    // 标记运行成功
    stateManager.markRunSuccess();

    return result;
  };

  // 构建 asyncSignal 的选项
  const asyncOptions: AsyncSignalOptions<any, [AntdTableParams, any, any?]> = {
    // 基础配置
    manual: options?.manual || stateManager.isWaitingForForm(), // 如果需要等待 form，则设置为手动模式
    ready: options?.ready,
    defaultParams: stateManager.buildRequestParams(),

    // 数据处理
    initialData: options?.initialData,
    formatResult: options?.formatResult,

    // 回调函数
    onSuccess: (data, params) => {
      stateManager.markRunSuccess();
      options?.onSuccess?.(data, params);
    },

    onError: (error, params) => {
      options?.onError?.(error, params);
      options?.onRequestError?.(error);
    },

    onBefore: options?.onBefore,
    onFinally: options?.onFinally,

    // 高级功能（直接透传给 asyncSignal）
    pollingInterval: options?.pollingInterval,
    refreshOnWindowFocus: options?.refreshOnWindowFocus,
    debounceWait: options?.debounceWait,
    throttleWait: options?.throttleWait,
    retryCount: options?.retryCount,
    retryInterval: options?.retryInterval,
    cacheKey: options?.cacheKey,
    cacheTime: options?.cacheTime,
    staleTime: options?.staleTime,
  };

  // 创建底层的 asyncSignal
  const asyncResult = asyncSignal(wrappedService, asyncOptions);

  // 创建适配器和控制器
  const resultAdapter = new EnhancedTableResultAdapter<TableData>(asyncResult, stateManager);
  const formController = new EnhancedFormController<TableData>(stateManager, asyncResult, options || {});
  const tableController = new EnhancedTableController<TableData>(stateManager, asyncResult);

  // 构建最终返回值
  const result: AntdTableSignalResult<TableData> = {
    // 表格属性
    tableProps: {
      dataSource: resultAdapter.dataSource,
      loading: asyncResult.loading,
      onChange: tableController.onChange,
      pagination: computed(() => ({
        current: stateManager.current(),
        pageSize: stateManager.pageSize(),
        total: resultAdapter.total(),
        showSizeChanger: stateManager.showSizeChanger(),
        showQuickJumper: stateManager.showQuickJumper(),
      })),
    },

    // 搜索控制
    search: {
      type: stateManager.searchType,
      changeType: formController.changeType,
      submit: formController.submit,
      reset: formController.reset,
    },

    // 基础属性（直接复用 asyncSignal）
    loading: asyncResult.loading,
    error: asyncResult.error,

    // 方法
    refresh: () => {
      const params = stateManager.buildRequestParams();
      return asyncResult.run(...params);
    },

    mutate: resultAdapter.mutateTableData.bind(resultAdapter),
    cancel: asyncResult.cancel,

    // Form 设置方法
    setForm: (form: FormInstance) => {
      const wasWaitingForForm = stateManager.isWaitingForForm();
      stateManager.setForm(form);

      // 如果之前在等待 form，现在触发请求
      if (wasWaitingForForm) {
        formController.submit();
      }
    },
  };

  return result;
}

/**
 * 使用示例：
 *
 * // 创建 signal（如果没有传入 form，会等待外部设置）
 * const tableSignal = antdTableSignal(fetchTableData);
 *
 * // 在组件中获取 form 实例后设置（会自动触发请求）
 * const [form] = Form.useForm();
 * tableSignal.setForm?.(form);
 *
 * // 或者在创建时直接传入
 * const tableSignal2 = antdTableSignal(fetchTableData, { form: formInstance });
 */
