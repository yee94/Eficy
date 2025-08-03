# @eficy/reactive-async

一个基于 @eficy/reactive 的响应式异步请求库，提供与 ahooks useRequest 完全兼容的 API。

## 特性

🔄 **响应式状态管理** - 基于 @eficy/reactive 的细粒度响应式更新  
⚡ **高性能** - 智能缓存和批量更新优化  
🎯 **完全兼容** - 与 ahooks useRequest 和 useAntdTable API 完全兼容  
🛡️ **TypeScript** - 完整的 TypeScript 类型支持  
🔧 **功能丰富** - 支持轮询、防抖、节流、重试、缓存、表格分页等高级特性  
📦 **轻量级** - 基于 @preact/signals 的轻量级实现  
📋 **表格支持** - 内置 Ant Design Table 集成，支持分页、排序、筛选、搜索  
🌍 **组件外使用** - signals 可以在组件外独立使用，提供更灵活的状态管理

## 安装

```bash
npm install @eficy/reactive-async
# 或
yarn add @eficy/reactive-async
# 或
pnpm add @eficy/reactive-async
```

## JSX Import Source 配置

为了在 JSX 中使用 signals，需要配置 JSX Import Source：

### 在文件顶部添加注释

```jsx
/** @jsxImportSource eficy */

import { asyncSignal } from '@eficy/reactive-async';

const userService = (userId) => fetch(`/api/user/${userId}`).then(res => res.json());

// signals 在组件外定义和使用
const userSignal = asyncSignal(() => userService('123'));

function UserProfile() {
  return (
    <div>
      <h1>用户信息</h1>
      {userSignal.loading() && <div>加载中...</div>}
      {userSignal.error() && <div>错误: {userSignal.error().message}</div>}
      {userSignal.data() && <div>用户名: {userSignal.data().name}</div>}
      <button onClick={() => userSignal.refresh()}>刷新</button>
    </div>
  );
}
```

### TypeScript 配置

在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "eficy"
  }
}
```

### Vite 配置

```js
// vite.config.js
export default {
  esbuild: {
    jsxImportSource: 'eficy'
  }
}
```

## 基础用法

### 自动请求

```jsx
/** @jsxImportSource eficy */

import { asyncSignal } from '@eficy/reactive-async';

// 定义服务函数
const getUserInfo = (userId) => {
  return fetch(`/api/user/${userId}`).then(res => res.json());
};

// 在组件外定义 signal - 这是关键特性
const userDataSignal = asyncSignal(() => getUserInfo('123'));

function UserCard() {
  return (
    <div className="user-card">
      {userDataSignal.loading() && <div>加载中...</div>}
      {userDataSignal.error() && (
        <div className="error">错误: {userDataSignal.error().message}</div>
      )}
      {userDataSignal.data() && (
        <div>
          <h2>{userDataSignal.data().name}</h2>
          <p>{userDataSignal.data().email}</p>
        </div>
      )}
      <button onClick={() => userDataSignal.refresh()}>刷新</button>
    </div>
  );
}
```

### 手动请求

```jsx
/** @jsxImportSource eficy */

import { asyncSignal } from '@eficy/reactive-async';

const createUser = (userData) => {
  return fetch('/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }).then(res => res.json());
};

// 在组件外定义手动触发的 signal
const createUserSignal = asyncSignal(createUser, {
  manual: true,
  onSuccess: (result) => {
    console.log('用户创建成功:', result);
  },
  onError: (error) => {
    console.error('创建失败:', error);
  },
});

function CreateUserForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
    };
    createUserSignal.run(userData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="姓名" required />
      <input name="email" type="email" placeholder="邮箱" required />
      <button 
        type="submit" 
        disabled={createUserSignal.loading()}
      >
        {createUserSignal.loading() ? '创建中...' : '创建用户'}
      </button>
      
      {createUserSignal.error() && (
        <div className="error">
          创建失败: {createUserSignal.error().message}
        </div>
      )}
      
      {createUserSignal.data() && (
        <div className="success">
          用户创建成功: {createUserSignal.data().name}
        </div>
      )}
    </form>
  );
}
```

### 组件外使用 - 核心特性

signals 的最大优势是可以在组件外定义和使用，实现真正的状态共享：

```jsx
/** @jsxImportSource eficy */

import { asyncSignal } from '@eficy/reactive-async';

// ============ 在组件外定义 signals ============
const userService = (userId) => fetch(`/api/user/${userId}`).then(res => res.json());
const todosService = (userId) => fetch(`/api/user/${userId}/todos`).then(res => res.json());

// 全局用户状态
const userSignal = asyncSignal(() => userService(getCurrentUserId()), {
  staleTime: 5 * 60 * 1000, // 5分钟内认为数据新鲜
  cacheKey: 'current-user'
});

// 依赖用户数据的待办事项
const todosSignal = asyncSignal(() => {
  const user = userSignal.data();
  if (!user) return Promise.resolve([]);
  return todosService(user.id);
}, {
  refreshDeps: [userSignal.data] // 当用户数据变化时自动刷新
});

// ============ 多个组件可以共享同一个 signal ============

function Header() {
  return (
    <header>
      <div>
        欢迎, {userSignal.data()?.name || '游客'}
        {userSignal.loading() && <span> (加载中...)</span>}
      </div>
      <button onClick={() => userSignal.refresh()}>刷新用户信息</button>
    </header>
  );
}

function Profile() {
  return (
    <div className="profile">
      <h2>个人资料</h2>
      {userSignal.loading() && <div>加载用户信息中...</div>}
      {userSignal.error() && <div>加载失败: {userSignal.error().message}</div>}
      {userSignal.data() && (
        <div>
          <p>姓名: {userSignal.data().name}</p>
          <p>邮箱: {userSignal.data().email}</p>
          <p>注册时间: {userSignal.data().createdAt}</p>
        </div>
      )}
    </div>
  );
}

function TodoList() {
  return (
    <div className="todos">
      <h2>待办事项</h2>
      {todosSignal.loading() && <div>加载待办事项中...</div>}
      {todosSignal.error() && <div>加载失败: {todosSignal.error().message}</div>}
      {todosSignal.data() && (
        <ul>
          {todosSignal.data().map(todo => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      )}
      <button onClick={() => todosSignal.refresh()}>刷新待办</button>
    </div>
  );
}

// ============ 在任何地方都可以访问和操作 signals ============

// 在事件处理函数中
function handleLogout() {
  userSignal.mutate(null); // 清除用户数据
  todosSignal.mutate([]); // 清除待办数据
}

// 在工具函数中
function getCurrentUser() {
  return userSignal.data();
}

// 在异步函数中
async function refreshAllUserData() {
  await userSignal.refresh();
  await todosSignal.refresh();
}

function getCurrentUserId() {
  return localStorage.getItem('userId') || '1';
}
```

## API 参考

### asyncSignal

```typescript
const { data, loading, error, run, refresh, cancel, mutate } = asyncSignal(service, options);
```

#### 参数

- **service**: `(...args: TParams) => Promise<TData>` - 异步服务函数
- **options**: `AsyncSignalOptions<TData, TParams>` - 配置选项

#### 返回值

| 属性     | 类型                                     | 描述                 |
| -------- | ---------------------------------------- | -------------------- |
| data     | `Signal<TData \| undefined>`             | 响应数据 signal      |
| loading  | `Signal<boolean>`                        | 加载状态 signal      |
| error    | `Signal<Error \| undefined>`             | 错误信息 signal      |
| run      | `(...params: TParams) => Promise<TData>` | 手动触发请求         |
| refresh  | `() => Promise<TData>`                   | 使用上次参数重新请求 |
| cancel   | `() => void`                             | 取消当前请求         |
| mutate   | `(data) => void`                         | 修改数据             |

#### 配置选项

| 选项          | 类型                              | 默认值  | 描述         |
| ------------- | --------------------------------- | ------- | ------------ |
| manual        | `boolean`                         | `false` | 是否手动触发 |
| defaultParams | `TParams`                         | -       | 默认参数     |
| initialData   | `TData`                           | -       | 初始数据     |
| onBefore      | `(params) => void`                | -       | 请求前回调   |
| onSuccess     | `(data, params) => void`          | -       | 成功回调     |
| onError       | `(error, params) => void`         | -       | 失败回调     |
| onFinally     | `(params, data?, error?) => void` | -       | 完成回调     |
| formatResult  | `(response) => TData`             | -       | 格式化结果   |

### 高级特性

#### 轮询

```jsx
/** @jsxImportSource eficy */

import { asyncSignal } from '@eficy/reactive-async';

const getStatus = () => fetch('/api/status').then(res => res.json());

const statusSignal = asyncSignal(getStatus, {
  pollingInterval: 1000, // 每秒轮询一次
});

function StatusMonitor() {
  return (
    <div>
      <h3>系统状态监控</h3>
      {statusSignal.loading() && <div>检查状态中...</div>}
      <div>系统状态: {statusSignal.data()?.status || '未知'}</div>
      <div>最后更新: {new Date().toLocaleTimeString()}</div>
    </div>
  );
}
```

#### 防抖搜索

```jsx
/** @jsxImportSource eficy */

import { asyncSignal } from '@eficy/reactive-async';

const searchUsers = (keyword) => {
  return fetch(`/api/users?q=${keyword}`).then(res => res.json());
};

const searchSignal = asyncSignal(searchUsers, {
  manual: true,
  debounceWait: 300, // 300ms 防抖
});

function SearchUsers() {
  const handleSearch = (e) => {
    const keyword = e.target.value.trim();
    if (keyword) {
      searchSignal.run(keyword);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="搜索用户..." 
        onChange={handleSearch}
      />
      
      {searchSignal.loading() && <div>搜索中...</div>}
      {searchSignal.error() && <div>搜索失败: {searchSignal.error().message}</div>}
      
      <div className="search-results">
        {searchSignal.data()?.map(user => (
          <div key={user.id} className="user-item">
            {user.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 缓存和智能刷新

```jsx
/** @jsxImportSource eficy */

import { asyncSignal } from '@eficy/reactive-async';

const getUserInfo = (userId) => {
  return fetch(`/api/user/${userId}`).then(res => res.json());
};

const userInfoSignal = asyncSignal(() => getUserInfo(currentUserId), {
  cacheKey: 'user-info', // 缓存键
  cacheTime: 60000, // 缓存1分钟
  staleTime: 30000, // 30秒内认为数据新鲜
  refreshOnWindowFocus: true, // 窗口重新获得焦点时刷新
});

function UserInfo() {
  return (
    <div>
      <h2>用户信息</h2>
      {userInfoSignal.loading() && <div>加载中...</div>}
      {userInfoSignal.error() && <div>加载失败</div>}
      {userInfoSignal.data() && (
        <div>
          <p>姓名: {userInfoSignal.data().name}</p>
          <p>最后登录: {userInfoSignal.data().lastLogin}</p>
        </div>
      )}
    </div>
  );
}
```

#### 依赖刷新

```jsx
/** @jsxImportSource eficy */

import { asyncSignal } from '@eficy/reactive-async';
import { signal } from '@eficy/reactive';

// 用户ID state
const userIdSignal = signal('1');

const getUserInfo = (userId) => {
  return fetch(`/api/user/${userId}`).then(res => res.json());
};

// 当 userId 变化时自动重新请求
const userInfoSignal = asyncSignal(() => getUserInfo(userIdSignal.value), {
  refreshDeps: [userIdSignal.value], // 依赖 userId
});

function UserSelector() {
  return (
    <div>
      <select 
        value={userIdSignal.value} 
        onChange={e => userIdSignal.value = e.target.value}
      >
        <option value="1">用户 1</option>
        <option value="2">用户 2</option>
        <option value="3">用户 3</option>
      </select>
      
      <div className="user-info">
        {userInfoSignal.loading() && <div>加载用户信息中...</div>}
        {userInfoSignal.error() && <div>加载失败: {userInfoSignal.error().message}</div>}
        {userInfoSignal.data() && (
          <div>
            <h3>{userInfoSignal.data().name}</h3>
            <p>{userInfoSignal.data().email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

## antdTableSignal

专为 Ant Design Table 组件设计的响应式表格数据管理工具，提供与 ahooks useAntdTable 完全兼容的 API。

### 基础用法

```jsx
/** @jsxImportSource eficy */

import { antdTableSignal } from '@eficy/reactive-async';
import { Table } from 'antd';

// 定义数据类型
interface UserData {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

// 定义 API 服务函数
const getUserList = async (
  { current, pageSize, sorter, filters },
  formData?
): Promise<{ total: number; list: UserData[] }> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: current,
      size: pageSize,
      sortField: sorter?.field,
      sortOrder: sorter?.order,
      ...formData,
      ...filters,
    }),
  });
  
  return response.json();
};

// 在组件外定义表格 signal
const userTableSignal = antdTableSignal(getUserList, {
  defaultPageSize: 10,
  onSuccess: (data) => {
    console.log(`加载了 ${data.list.length} 条数据，总共 ${data.total} 条`);
  }
});

function UserTable() {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '激活', value: 'active' },
        { text: '禁用', value: 'inactive' },
      ],
    },
  ];

  return (
    <Table
      {...userTableSignal.tableProps}
      columns={columns}
      rowKey="id"
    />
  );
}
```

### 带搜索表单的用法

```jsx
/** @jsxImportSource eficy */

import { antdTableSignal } from '@eficy/reactive-async';
import { Form, Input, Button, Table, Card } from 'antd';

const [form] = Form.useForm();

const userTableWithSearchSignal = antdTableSignal(getUserList, {
  form,
  defaultType: 'simple',
});

function UserTableWithSearch() {
  // 简单搜索表单
  const renderSimpleForm = () => (
    <Form form={form} layout="inline">
      <Form.Item name="name" label="姓名">
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={userTableWithSearchSignal.search.submit}>
          搜索
        </Button>
        <Button onClick={userTableWithSearchSignal.search.reset} style={{ marginLeft: 8 }}>
          重置
        </Button>
        <Button type="link" onClick={userTableWithSearchSignal.search.changeType}>
          高级搜索
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <Card>
      {userTableWithSearchSignal.search.type() === 'simple' ? renderSimpleForm() : null}
      <Table 
        {...userTableWithSearchSignal.tableProps} 
        columns={columns} 
        rowKey="id" 
      />
    </Card>
  );
}
```

### API 参考

#### antdTableSignal

```typescript
const { tableProps, search, loading, error, refresh, mutate } = antdTableSignal(service, options);
```

##### 参数

- **service**: `(params: AntdTableParams, formData?: any) => Promise<{ total: number; list: TData[] }>` - 异步服务函数
- **options**: `AntdTableSignalOptions<TData>` - 配置选项

##### 返回值

| 属性       | 类型                                           | 描述           |
| ---------- | ---------------------------------------------- | -------------- |
| tableProps | `{ dataSource, loading, onChange, pagination }` | 表格属性       |
| search     | `{ type, changeType, submit, reset }`          | 搜索控制       |
| loading    | `Signal<boolean>`                              | 加载状态       |
| error      | `Signal<Error \| undefined>`                   | 错误信息       |
| refresh    | `() => Promise<any>`                           | 刷新数据       |
| mutate     | `(data) => void`                               | 修改数据       |

## 迁移指南

### 从 ahooks useRequest 迁移

本库与 ahooks useRequest 100% API 兼容，只需要：

1. 替换导入
2. 添加 JSX Import Source
3. 在组件外定义 signals（推荐）

```jsx
// 之前
import { useRequest } from 'ahooks';

function MyComponent() {
  const { data, loading, run } = useRequest(fetchData, options);
  // ...
}

// 现在
/** @jsxImportSource eficy */
import { asyncSignal } from '@eficy/reactive-async';

// 在组件外定义（推荐）
const dataSignal = asyncSignal(fetchData, options);

function MyComponent() {
  // 直接使用 signals
  return (
    <div>
      {dataSignal.loading() && <div>加载中...</div>}
      {dataSignal.data() && <div>{dataSignal.data().title}</div>}
      <button onClick={() => dataSignal.run()}>刷新</button>
    </div>
  );
}
```

### 从 ahooks useAntdTable 迁移

```jsx
// 之前
import { useAntdTable } from 'ahooks';

function TableComponent() {
  const { tableProps, search, loading, error, refresh } = useAntdTable(service, options);
  // ...
}

// 现在
/** @jsxImportSource eficy */
import { antdTableSignal } from '@eficy/reactive-async';

// 在组件外定义
const tableSignal = antdTableSignal(service, options);

function TableComponent() {
  return (
    <Table {...tableSignal.tableProps} columns={columns} rowKey="id" />
  );
}
```

## 核心优势

### 1. 组件外使用
- signals 可以在组件外定义和使用
- 实现真正的全局状态管理
- 多个组件可以共享同一个 signal
- 在任何地方都可以访问和操作数据

### 2. 细粒度响应式
- 基于 @preact/signals 的细粒度更新
- 只有依赖变化的组件会重新渲染
- 避免不必要的性能开销

### 3. 完全兼容
- 与 ahooks API 100% 兼容
- 平滑迁移，学习成本低
- 支持所有高级特性

### 4. 现代化开发体验
- TypeScript 原生支持
- JSX Import Source 配置
- 声明式的响应式编程

## 许可证

MIT