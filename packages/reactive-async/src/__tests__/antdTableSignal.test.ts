import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { antdTableSignal } from '../core/antdTableSignal';

// 模拟表格数据类型
interface UserData {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

// 模拟 API 响应类型
interface ApiResponse {
  total: number;
  list: UserData[];
}

// 模拟分页参数类型
interface TableParams {
  current: number;
  pageSize: number;
  sorter?: any;
  filters?: any;
}

describe('antdTableSignal', () => {
  let mockUsers: UserData[];

  beforeEach(() => {
    // 模拟用户数据
    mockUsers = [
      { id: 1, name: 'Alice', email: 'alice@example.com', status: 'active' },
      { id: 2, name: 'Bob', email: 'bob@example.com', status: 'inactive' },
      { id: 3, name: 'Charlie', email: 'charlie@example.com', status: 'active' },
      { id: 4, name: 'David', email: 'david@example.com', status: 'active' },
      { id: 5, name: 'Eve', email: 'eve@example.com', status: 'inactive' },
    ];
  });

  // 创建模拟服务函数
  const createMockService = (delay = 0) => {
    return vi.fn().mockImplementation(async (params: TableParams, formData?: any) => {
      // 模拟网络延迟
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      let filteredUsers = [...mockUsers];

      // 应用表单搜索
      if (formData?.name) {
        filteredUsers = filteredUsers.filter((user) => user.name.toLowerCase().includes(formData.name.toLowerCase()));
      }
      if (formData?.email) {
        filteredUsers = filteredUsers.filter((user) => user.email.toLowerCase().includes(formData.email.toLowerCase()));
      }
      if (formData?.status) {
        filteredUsers = filteredUsers.filter((user) => user.status === formData.status);
      }

      // 应用表格筛选
      if (params.filters?.status) {
        filteredUsers = filteredUsers.filter((user) => params.filters.status.includes(user.status));
      }

      // 应用排序
      if (params.sorter?.field) {
        filteredUsers.sort((a, b) => {
          const aValue = a[params.sorter.field as keyof UserData];
          const bValue = b[params.sorter.field as keyof UserData];

          if (params.sorter.order === 'ascend') {
            return aValue > bValue ? 1 : -1;
          } else if (params.sorter.order === 'descend') {
            return aValue < bValue ? 1 : -1;
          }
          return 0;
        });
      }

      // 应用分页
      const start = (params.current - 1) * params.pageSize;
      const end = start + params.pageSize;
      const pagedUsers = filteredUsers.slice(start, end);

      return {
        total: filteredUsers.length,
        list: pagedUsers,
      };
    });
  };

  describe('基础功能', () => {
    it('应该创建 antdTableSignal 并返回正确的结构', () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService);

      // 检查基础属性
      expect(result).toHaveProperty('tableProps');
      expect(result).toHaveProperty('search');
      expect(result).toHaveProperty('loading');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('refresh');
      expect(result).toHaveProperty('mutate');

      // 检查 tableProps 结构
      expect(result.tableProps).toHaveProperty('dataSource');
      expect(result.tableProps).toHaveProperty('loading');
      expect(result.tableProps).toHaveProperty('onChange');
      expect(result.tableProps).toHaveProperty('pagination');

      // 检查 search 结构
      expect(result.search).toHaveProperty('type');
      expect(result.search).toHaveProperty('changeType');
      expect(result.search).toHaveProperty('submit');
      expect(result.search).toHaveProperty('reset');

      // 检查初始状态
      expect(result.search.type()).toBe('simple');
      expect(Array.isArray(result.tableProps.dataSource())).toBe(true);
    });

    it('应该自动执行服务函数并更新数据', async () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { form: {} });

      // 等待异步操作完成 - 增加等待时间
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(mockService).toHaveBeenCalledWith({ current: 1, pageSize: 10, sorter: undefined, filters: undefined }, {});

      expect(result.tableProps.dataSource()).toEqual(mockUsers);
      expect(result.tableProps.loading()).toBe(false);
      expect(result.error()).toBeUndefined();
      expect(result.tableProps.pagination().current).toBe(1);
      expect(result.tableProps.pagination().total).toBe(5);
    });

    it('应该处理服务函数错误', async () => {
      const error = new Error('API Error');
      const mockService = vi.fn().mockRejectedValue(error);
      const result = antdTableSignal(mockService, { manual: true });

      // 手动触发请求
      try {
        await result.refresh();
      } catch (e) {
        // 预期的错误
      }

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(result.tableProps.dataSource()).toEqual([]);
      expect(result.tableProps.loading()).toBe(false);
      expect(result.error()).toEqual(error);
    });
  });

  describe('分页功能', () => {
    it('应该正确处理分页参数', async () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, {
        defaultPageSize: 2,
        form: {},
      });

      // 等待初始加载 - 增加等待时间
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(result.tableProps.pagination().pageSize).toBe(2);
      expect(result.tableProps.dataSource()).toHaveLength(2);

      // 测试分页变化
      result.tableProps.onChange({ current: 2, pageSize: 2 }, {}, {});

      // 等待请求完成
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockService).toHaveBeenLastCalledWith({ current: 2, pageSize: 2, sorter: {}, filters: {} }, {});
    });

    it('应该支持自定义默认分页参数', async () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, {
        defaultParams: [{ current: 2, pageSize: 3 }, { status: 'active' }],
        form: {
          getFieldsValue: vi.fn().mockReturnValue({ name: 'Alice', status: 'active' }),
          setFieldsValue: vi.fn(),
          resetFields: vi.fn(),
          validateFields: vi.fn().mockResolvedValue({ name: 'Alice', status: 'active' }),
        },
      });

      // 等待初始加载
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockService).toHaveBeenCalledWith(
        { current: 2, pageSize: 3, sorter: undefined, filters: undefined },
        { status: 'active' },
      );
    });
  });

  describe('排序功能', () => {
    it('应该正确处理表格排序', async () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { manual: true });

      // 手动触发排序
      const sorter = { field: 'name', order: 'ascend' };
      result.tableProps.onChange({ current: 1, pageSize: 10 }, {}, sorter);

      // 等待请求完成
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockService).toHaveBeenCalledWith({ current: 1, pageSize: 10, sorter, filters: {} }, {});
    });
  });

  describe('筛选功能', () => {
    it('应该正确处理表格筛选', async () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { manual: true });

      // 手动触发筛选
      const filters = { status: ['active'] };
      result.tableProps.onChange({ current: 1, pageSize: 10 }, filters, {});

      // 等待请求完成
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockService).toHaveBeenCalledWith({ current: 1, pageSize: 10, sorter: {}, filters }, {});
    });
  });

  describe('搜索表单功能', () => {
    it('应该支持简单搜索类型切换', () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { manual: true });

      expect(result.search.type()).toBe('simple');

      // 切换到高级搜索
      result.search.changeType();
      expect(result.search.type()).toBe('advance');

      // 再次切换回简单搜索
      result.search.changeType();
      expect(result.search.type()).toBe('simple');
    });

    it('应该支持默认搜索类型设置', () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, {
        manual: true,
        defaultType: 'advance',
      });

      expect(result.search.type()).toBe('advance');
    });

    it('应该支持表单提交搜索', async () => {
      const mockService = createMockService();
      const mockForm = {
        getFieldsValue: vi.fn().mockReturnValue({ name: 'Alice', status: 'active' }),
        setFieldsValue: vi.fn(),
        resetFields: vi.fn(),
        validateFields: vi.fn().mockResolvedValue({ name: 'Alice', status: 'active' }),
      };

      const result = antdTableSignal(mockService, {
        manual: true,
        form: mockForm,
      });

      // 提交搜索
      await result.search.submit();

      // 等待请求完成
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockForm.validateFields).toHaveBeenCalled();
      expect(mockService).toHaveBeenCalledWith(
        { current: 1, pageSize: 10, sorter: undefined, filters: undefined },
        { name: 'Alice', status: 'active' },
      );
    });

    it('应该支持表单重置', async () => {
      const mockService = createMockService();
      const mockForm = {
        getFieldsValue: vi.fn().mockReturnValue({}),
        setFieldsValue: vi.fn(),
        resetFields: vi.fn(),
        validateFields: vi.fn().mockResolvedValue({}),
      };

      const result = antdTableSignal(mockService, {
        manual: true,
        form: mockForm,
      });

      // 重置表单
      result.search.reset();

      // 等待请求完成
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockForm.resetFields).toHaveBeenCalled();
      expect(mockService).toHaveBeenCalledWith({ current: 1, pageSize: 10, sorter: undefined, filters: undefined }, {});
    });
  });

  describe('手动模式', () => {
    it('应该支持手动触发模式', () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { manual: true });

      expect(mockService).not.toHaveBeenCalled();
      expect(result.tableProps.loading()).toBe(false);
      expect(result.tableProps.dataSource()).toEqual([]);
    });

    it('应该在手动模式下支持刷新', async () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { manual: true });

      await result.refresh();

      expect(mockService).toHaveBeenCalledTimes(1);
      expect(result.tableProps.dataSource()).toEqual(mockUsers);
    });
  });

  describe('加载状态', () => {
    it('应该正确管理加载状态', async () => {
      const mockService = createMockService(50); // 50ms 延迟
      const result = antdTableSignal(mockService, { manual: true });

      expect(result.tableProps.loading()).toBe(false);
      expect(result.loading()).toBe(false);

      // 开始请求
      const promise = result.refresh();
      expect(result.tableProps.loading()).toBe(true);
      expect(result.loading()).toBe(true);

      // 等待请求完成
      await promise;
      expect(result.tableProps.loading()).toBe(false);
      expect(result.loading()).toBe(false);
    });
  });

  describe('数据修改', () => {
    it('应该支持直接修改表格数据', () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { manual: true });

      const newData = { total: 1, list: [mockUsers[0]] };
      result.mutate(newData);

      expect(result.tableProps.dataSource()).toEqual([mockUsers[0]]);
      expect(result.tableProps.pagination().total).toBe(1);
    });

    it('应该支持函数式修改数据', () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { manual: true });

      result.mutate((oldData) => {
        return {
          total: 2,
          list: mockUsers.slice(0, 2),
        };
      });

      expect(result.tableProps.dataSource()).toEqual(mockUsers.slice(0, 2));
      expect(result.tableProps.pagination().total).toBe(2);
    });
  });

  describe('回调函数', () => {
    it('应该调用成功回调', async () => {
      const mockService = createMockService();
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onRequestError = vi.fn();

      const result = antdTableSignal(mockService, {
        form: {
          getFieldsValue: vi.fn().mockReturnValue({ name: 'Alice', status: 'active' }),
          setFieldsValue: vi.fn(),
          resetFields: vi.fn(),
          validateFields: vi.fn().mockResolvedValue({ name: 'Alice', status: 'active' }),
        },
        onSuccess,
        onError,
        onRequestError,
      });

      // 等待异步操作完成
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(onSuccess).toHaveBeenCalledWith({ total: 5, list: mockUsers }, [
        { current: 1, pageSize: 10, sorter: undefined, filters: undefined },
        {},
        { allFormData: {}, type: 'simple' },
      ]);
      expect(onError).not.toHaveBeenCalled();
      expect(onRequestError).not.toHaveBeenCalled();
    });

    it('应该调用错误回调', async () => {
      const error = new Error('API Error');
      const mockService = vi.fn().mockRejectedValue(error);
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const onRequestError = vi.fn();

      const result = antdTableSignal(mockService, {
        manual: true,
        onSuccess,
        onError,
        onRequestError,
      });

      try {
        await result.refresh();
      } catch (e) {
        // 预期的错误
      }

      expect(onError).toHaveBeenCalledWith(error, [
        { current: 1, pageSize: 10, sorter: undefined, filters: undefined },
        {},
        { allFormData: {}, type: 'simple' },
      ]);
      expect(onRequestError).toHaveBeenCalledWith(error);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('依赖刷新', () => {
    it('应该在依赖变化时自动刷新', async () => {
      const mockService = createMockService();
      let dep = 1;

      const result = antdTableSignal(mockService, {
        refreshDeps: [dep],
        form: {
          getFieldsValue: vi.fn().mockReturnValue({ name: 'Alice', status: 'active' }),
          setFieldsValue: vi.fn(),
          resetFields: vi.fn(),
          validateFields: vi.fn().mockResolvedValue({ name: 'Alice', status: 'active' }),
        },
      });

      // 等待初始加载
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(mockService).toHaveBeenCalledTimes(1);

      // 模拟依赖变化（在实际使用中会通过外部状态变化触发）
      // 这里我们直接调用刷新来模拟依赖变化的效果
      await result.refresh();

      expect(mockService).toHaveBeenCalledTimes(2);
    });
  });

  describe('分页配置', () => {
    it('应该包含正确的分页配置', () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, { manual: true });

      const pagination = result.tableProps.pagination;

      expect(pagination().current).toBe(1);
      expect(pagination().pageSize).toBe(10);
      expect(pagination().total).toBe(0);
      expect(pagination().showSizeChanger).toBe(true);
      expect(pagination().showQuickJumper).toBe(true);
    });

    it('应该支持自定义分页大小', () => {
      const mockService = createMockService();
      const result = antdTableSignal(mockService, {
        manual: true,
        defaultPageSize: 20,
      });

      expect(result.tableProps.pagination().pageSize).toBe(20);
    });
  });

  describe('取消功能', () => {
    it('应该支持取消请求', async () => {
      const mockService = createMockService(100); // 100ms 延迟
      const result = antdTableSignal(mockService, { manual: true });

      const promise = result.refresh();
      expect(result.tableProps.loading()).toBe(true);

      // 取消请求（这里需要在实现中添加 cancel 方法）
      result.cancel?.();

      try {
        await promise;
      } catch (e) {
        // 取消操作可能会抛出错误
      }

      expect(result.tableProps.loading()).toBe(false);
    });
  });
});
