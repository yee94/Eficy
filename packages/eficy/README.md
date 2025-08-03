# Eficy

[![Using TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/npm/l/eficy.svg)](#License)
[![](https://flat.badgen.net/npm/v/eficy?icon=npm)](https://www.npmjs.com/package/eficy)
[![NPM downloads](http://img.shields.io/npm/dm/eficy.svg?style=flat-square)](http://npmjs.com/eficy)

**Eficy** 是一个现代化的 React 组件系统，专为 B 端系统设计，通过自定义 JSX runtime 和 signals 响应式系统，实现在单文件 JSX 中完成完整页面渲染的目标。这是整个 Eficy 生态系统的完整入口包，集成了核心框架和常用插件。

[English](./README-en.md) | 简体中文

## 🎯 核心理念

在 B 端系统中，我们希望通过一个单文件的 JSX 来完成完整的页面渲染，页面中的所有状态都可以通过 signals 来完成管理，无需依赖复杂的 React 状态管理方案。

```jsx
import { signal, computed } from '@eficy/reactive';
import { asyncSignal } from '@eficy/reactive-async';

const name = signal("Yee");
const { loading, data } = asyncSignal(async () => ({ list: [], total: 0 }));

export default () => (
  <div>
    Hi, {name}
    
    {loading ? <div>Loading...</div> : (
      <div>
        {computed(() => data().list.map((item) => (
          <div key={item.id}>{item.name}</div>
        )))}
      </div>
    )}
  </div>
);
```

## ✨ 核心特性

### 🔄 响应式系统集成
- **自动 Signal 识别**: 在 JSX 中使用的 signal 会被自动识别并订阅
- **零配置响应**: 无需手动调用 `useState` 或其他 React Hooks
- **细粒度更新**: 只有使用了变化 signal 的组件会重新渲染
- **异步数据支持**: 内置异步信号，自动处理加载和错误状态

### 🧩 组件注册系统
- **预注册组件**: 通过 `create()` 创建实例后可注册组件，在 JSX 中直接使用
- **动态组件解析**: 支持字符串类型的组件名称，自动从注册表中查找对应组件
- **原生标签支持**: 完全支持原生 HTML 标签渲染
- **TypeScript 支持**: 完整的类型定义和类型安全

### 🔌 插件体系
- **开箱即用**: `create()` 函数自动安装 UnoCSS 等常用插件
- **生命周期钩子**: 提供完整的组件生命周期钩子系统
- **渲染拦截**: 插件可以拦截和修改渲染过程
- **洋葱式中间件**: 插件按照洋葱模型执行，支持 pre/post 执行顺序

### 🎨 样式系统
- **UnoCSS 集成**: 内置 UnoCSS 插件，自动提取和生成原子化 CSS
- **实时样式生成**: 在组件渲染过程中实时收集样式类并生成 CSS
- **缓存优化**: 智能缓存机制，避免重复生成相同的样式
- **自定义配置**: 支持完全自定义的 UnoCSS 配置

### 📦 自定义 JSX Runtime
- **透明集成**: 通过自定义 JSX runtime 实现对 signals 的自动处理
- **零运行时开销**: 编译时转换，运行时性能优异
- **完整兼容**: 与现有 React 生态系统完全兼容

## 📦 安装

```bash
npm install eficy
# 或
yarn add eficy
# 或
pnpm add eficy
```

## 🚀 快速开始

### 1. 配置 JSX Runtime

在你的 `tsconfig.json` 中：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "eficy"
  }
}
```

### 2. 基础使用

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { create, EficyProvider } from 'eficy';
import { signal } from '@eficy/reactive';

// 创建 Eficy 实例（已预装 UnoCSS 插件）
const core = await create();

// 注册自定义组件
const CustomButton = ({ children, ...props }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" {...props}>
    {children}
  </button>
);

core.registerComponents({
  CustomButton,
});

// 应用组件
const App = () => {
  const count = signal(0);
  const name = signal('Eficy User');
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Welcome to Eficy! 👋
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name:
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => name.set(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="text-center">
            <p className="text-lg mb-4">
              Hello, <span className="font-semibold text-blue-600">{name}</span>!
            </p>
            <p className="text-xl mb-4">
              Count: <span className="font-bold text-green-600">{count}</span>
            </p>
            
            <div className="flex gap-2 justify-center">
              <CustomButton onClick={() => count.set(count() + 1)}>
                Increment
              </CustomButton>
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                onClick={() => count.set(0)}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 渲染应用
const root = createRoot(document.getElementById('root'));
root.render(
  <EficyProvider core={core}>
    <App />
  </EficyProvider>
);
```

## 📦 包含的模块

Eficy 完整包包含以下核心模块：

### 核心框架
- **@eficy/core-jsx** - 第三代核心引擎，基于自定义 JSX runtime
- **@eficy/reactive** - 高性能响应式状态管理系统
- **@eficy/reactive-react** - React 响应式集成
- **@eficy/reactive-async** - 异步响应式支持

### 内置插件
- **@eficy/plugin-unocss** - UnoCSS 原子化 CSS 自动生成插件

### 开箱即用特性
- ✅ 自动安装 UnoCSS 插件
- ✅ 响应式系统完整集成
- ✅ TypeScript 类型定义
- ✅ JSX Runtime 配置
- ✅ 错误边界处理

## 🎨 样式系统

内置 UnoCSS 插件，支持原子化 CSS，自动提取和生成样式：

```tsx
// 样式类会被自动提取并生成对应的 CSS
const StyledComponent = () => (
  <div className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors">
    <span className="text-lg font-bold">
      原子化样式示例
    </span>
  </div>
);

// 支持动态样式
const DynamicStyles = () => {
  const isActive = signal(false);
  
  return (
    <button 
      className={`px-4 py-2 rounded ${isActive() ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}
      onClick={() => isActive.set(!isActive())}
    >
      {isActive() ? 'Active' : 'Inactive'}
    </button>
  );
};
```

### 自定义 UnoCSS 配置

```tsx
import { UnocssPlugin } from 'eficy';

const core = await create();

// 自定义 UnoCSS 配置
await core.install(UnocssPlugin, {
  config: {
    rules: [
      ['btn-custom', { 
        padding: '12px 24px', 
        borderRadius: '8px',
        fontWeight: '500'
      }],
    ],
    shortcuts: [
      ['btn-primary', 'btn-custom bg-blue-500 text-white hover:bg-blue-600'],
    ],
    theme: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
    },
  },
});
```

## 🔄 响应式数据

基于 `@eficy/reactive` 的现代响应式系统，在 JSX 中自动响应数据变化：

### Signal 基础用法

```tsx
import { signal, computed } from '@eficy/reactive';

// 基础 Signal
const count = signal(0);
const name = signal('World');

// 计算属性
const greeting = computed(() => `Hello, ${name()}!`);

const App = () => (
  <div>
    <h1>{greeting}</h1>
    <p>Count: {count}</p>
    
    <input 
      value={name}
      onChange={(e) => name.set(e.target.value)}
      placeholder="Enter your name"
    />
    
    <button onClick={() => count.set(count() + 1)}>
      Increment
    </button>
  </div>
);
```

### 异步数据处理

```tsx
import { asyncSignal } from '@eficy/reactive-async';

const UserList = () => {
  const { data: users, loading, error } = asyncSignal(async () => {
    const response = await fetch('/api/users');
    return response.json();
  });
  
  return (
    <div>
      {loading && <div>Loading users...</div>}
      {error && <div>Error: {error.message}</div>}
      {users && (
        <ul>
          {users().map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 复杂状态管理

```tsx
// 创建一个用户管理 store
const createUserStore = () => {
  const users = signal([]);
  const searchTerm = signal('');
  const loading = signal(false);
  
  const filteredUsers = computed(() =>
    users().filter(user => 
      user.name.toLowerCase().includes(searchTerm().toLowerCase())
    )
  );
  
  const addUser = async (userData) => {
    loading.set(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const newUser = await response.json();
      users.set([...users(), newUser]);
    } finally {
      loading.set(false);
    }
  };
  
  return {
    users,
    searchTerm,
    loading,
    filteredUsers,
    addUser,
  };
};

const UserManagement = () => {
  const store = createUserStore();
  
  return (
    <div className="p-6">
      <input
        className="w-full px-3 py-2 border rounded mb-4"
        placeholder="Search users..."
        value={store.searchTerm}
        onChange={(e) => store.searchTerm.set(e.target.value)}
      />
      
      {store.loading && <div>Loading...</div>}
      
      <div className="grid gap-4">
        {store.filteredUsers().map(user => (
          <div key={user.id} className="p-4 border rounded">
            <h3 className="font-bold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔌 插件系统

### 使用内置插件

```tsx
import { create } from 'eficy'

// create() 函数已自动安装 UnoCSS 插件
const core = await create()
```

### 开发自定义插件

```tsx
import { injectable, ILifecyclePlugin, Initialize, Render } from 'eficy';

@injectable()
class MyPlugin implements ILifecyclePlugin {
  public readonly name = 'my-plugin';
  public readonly version = '1.0.0';
  public readonly enforce = 'pre';
  
  @Initialize()
  async initialize(config?: any) {
    console.log('Plugin initialized with config:', config);
  }
  
  @Render()
  onRender(context, next) {
    const OriginalComponent = next();
    
    // 包装组件添加自定义功能
    return (props) => (
      <div className="plugin-wrapper">
        <OriginalComponent {...props} />
      </div>
    );
  }
}

// 安装自定义插件
const core = await create();
await core.install(MyPlugin, { 
  // 插件配置
});
```

### 插件间通信

```tsx
@injectable()
class PluginA implements ILifecyclePlugin {
  name = 'plugin-a';
  
  @Initialize()
  async initialize() {
    // 发送事件
    this.eventEmitter.emit('plugin-a:ready', { data: 'some data' });
  }
}

@injectable()
class PluginB implements ILifecyclePlugin {
  name = 'plugin-b';
  
  @Initialize()
  async initialize() {
    // 监听事件
    this.eventEmitter.on('plugin-a:ready', (data) => {
      console.log('Plugin A is ready:', data);
    });
  }
}
```

## 🏗️ 高级特性

### 组件注册和使用

```tsx
import { create } from 'eficy';
import * as antd from 'antd';

const core = await create();

// 批量注册 Ant Design 组件
core.registerComponents(antd);

// 注册自定义组件
const MyCard = ({ title, children, ...props }) => (
  <div className="border rounded-lg shadow-md p-6" {...props}>
    {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
    {children}
  </div>
);

core.registerComponent('MyCard', MyCard);

// 在 JSX 中直接使用注册的组件
const App = () => {
  const users = signal([
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
  ]);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User List</h1>
      
      {/* 使用 Ant Design 组件 */}
      <Button type="primary" className="mb-4">
        Add User
      </Button>
      
      {/* 使用自定义组件 */}
      <div className="grid gap-4">
        {users().map(user => (
          <MyCard key={user.id} title={user.name}>
            <p className="text-gray-600">{user.email}</p>
          </MyCard>
        ))}
      </div>
    </div>
  );
};
```

### 条件渲染

```tsx
const ConditionalComponent = () => {
  const isLoggedIn = signal(false);
  const userRole = signal('guest');
  
  return (
    <div>
      {/* 简单条件渲染 */}
      {isLoggedIn() && (
        <div className="bg-green-100 p-4 rounded">
          Welcome back!
        </div>
      )}
      
      {/* 复杂条件渲染 */}
      {isLoggedIn() ? (
        userRole() === 'admin' ? (
          <AdminPanel />
        ) : (
          <UserPanel />
        )
      ) : (
        <LoginForm />
      )}
      
      <button onClick={() => isLoggedIn.set(!isLoggedIn())}>
        Toggle Login Status
      </button>
    </div>
  );
};
```

### 列表渲染

```tsx
const TodoList = () => {
  const todos = signal([
    { id: 1, text: 'Learn Eficy', completed: false },
    { id: 2, text: 'Build an app', completed: true },
  ]);
  
  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
    };
    todos.set([...todos(), newTodo]);
  };
  
  const toggleTodo = (id) => {
    todos.set(todos().map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Todo List</h2>
      
      {/* 列表渲染 */}
      <div className="space-y-2">
        {todos().map(todo => (
          <div 
            key={todo.id} 
            className={`flex items-center p-3 border rounded ${
              todo.completed ? 'bg-gray-50 line-through' : 'bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-3"
            />
            <span className="flex-1">{todo.text}</span>
          </div>
        ))}
      </div>
      
      {/* 空状态 */}
      {todos().length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No todos yet. Add one above!
        </div>
      )}
    </div>
  );
};
```

## 🎯 实际应用示例

### 完整的用户管理系统

```tsx
import { create, EficyProvider } from 'eficy';
import { signal, computed } from '@eficy/reactive';
import { asyncSignal } from '@eficy/reactive-async';
import * as antd from 'antd';

const core = await create();
core.registerComponents(antd);

// 用户管理 Store
const createUserStore = () => {
  const users = signal([]);
  const searchTerm = signal('');
  const loading = signal(false);
  const selectedUser = signal(null);
  const modalVisible = signal(false);
  
  // 计算过滤后的用户列表
  const filteredUsers = computed(() =>
    users().filter(user =>
      user.name.toLowerCase().includes(searchTerm().toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm().toLowerCase())
    )
  );
  
  // 异步加载用户数据
  const { data, loading: dataLoading, error, run: loadUsers } = asyncSignal(
    async () => {
      const response = await fetch('/api/users');
      return response.json();
    },
    { manual: true }
  );
  
  // 添加用户
  const addUser = async (userData) => {
    loading.set(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const newUser = await response.json();
      users.set([...users(), newUser]);
      modalVisible.set(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    } finally {
      loading.set(false);
    }
  };
  
  // 编辑用户
  const editUser = (user) => {
    selectedUser.set(user);
    modalVisible.set(true);
  };
  
  // 删除用户
  const deleteUser = async (userId) => {
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      users.set(users().filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };
  
  return {
    users,
    searchTerm,
    loading,
    selectedUser,
    modalVisible,
    filteredUsers,
    dataLoading,
    error,
    loadUsers,
    addUser,
    editUser,
    deleteUser,
  };
};

// 用户表单组件
const UserForm = ({ user, onSubmit, onCancel }) => {
  const name = signal(user?.name || '');
  const email = signal(user?.email || '');
  const role = signal(user?.role || 'user');
  
  const handleSubmit = () => {
    onSubmit({
      id: user?.id,
      name: name(),
      email: email(),
      role: role(),
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">姓名</label>
        <Input
          value={name}
          onChange={(e) => name.set(e.target.value)}
          placeholder="请输入姓名"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">邮箱</label>
        <Input
          value={email}
          onChange={(e) => email.set(e.target.value)}
          placeholder="请输入邮箱"
          type="email"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">角色</label>
        <Select
          value={role}
          onChange={(value) => role.set(value)}
          className="w-full"
        >
          <Select.Option value="user">普通用户</Select.Option>
          <Select.Option value="admin">管理员</Select.Option>
        </Select>
      </div>
      
      <div className="flex gap-2 justify-end pt-4">
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" onClick={handleSubmit}>
          {user ? '更新' : '添加'}
        </Button>
      </div>
    </div>
  );
};

// 主要的用户管理组件
const UserManagement = () => {
  const store = createUserStore();
  
  // 组件挂载时加载数据
  React.useEffect(() => {
    store.loadUsers();
  }, []);
  
  // 表格列配置
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            onClick={() => store.editUser(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            onClick={() => store.deleteUser(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">用户管理</h1>
        <p className="text-gray-600">管理系统用户信息</p>
      </div>
      
      {/* 操作栏 */}
      <div className="mb-4 flex gap-4 items-center">
        <Input.Search
          placeholder="搜索用户名或邮箱..."
          value={store.searchTerm}
          onChange={(e) => store.searchTerm.set(e.target.value)}
          className="flex-1 max-w-md"
        />
        <Button
          type="primary"
          onClick={() => {
            store.selectedUser.set(null);
            store.modalVisible.set(true);
          }}
        >
          添加用户
        </Button>
      </div>
      
      {/* 用户表格 */}
      <Table
        dataSource={store.filteredUsers()}
        columns={columns}
        loading={store.dataLoading()}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
      
      {/* 用户表单弹窗 */}
      <Modal
        title={store.selectedUser() ? '编辑用户' : '添加用户'}
        open={store.modalVisible()}
        onCancel={() => store.modalVisible.set(false)}
        footer={null}
        destroyOnClose
      >
        <UserForm
          user={store.selectedUser()}
          onSubmit={store.addUser}
          onCancel={() => store.modalVisible.set(false)}
        />
      </Modal>
      
      {/* 错误提示 */}
      {store.error() && (
        <Alert
          message="加载失败"
          description={store.error().message}
          type="error"
          showIcon
          className="mt-4"
        />
      )}
    </div>
  );
};

// 应用入口
const App = () => (
  <EficyProvider core={core}>
    <UserManagement />
  </EficyProvider>
);
```

## 🔧 高级配置

### 自定义 UnoCSS 配置

```tsx
import { create, UnocssPlugin } from 'eficy';

const core = await create();

// 重新安装 UnoCSS 插件以覆盖默认配置
await core.install(UnocssPlugin, {
  config: {
    presets: [
      presetUno(),
      presetAttributify(),
    ],
    rules: [
      ['btn', { 
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      }],
    ],
    shortcuts: [
      ['btn-primary', 'btn bg-blue-500 text-white hover:bg-blue-600'],
      ['btn-secondary', 'btn bg-gray-200 text-gray-800 hover:bg-gray-300'],
    ],
    theme: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
});
```

### 错误处理和调试

```tsx
import { create, EficyProvider } from 'eficy';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
    <pre className="text-sm text-red-600 mb-4">{error.message}</pre>
    <button 
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      onClick={resetErrorBoundary}
    >
      Try again
    </button>
  </div>
);

const App = () => {
  const core = await create();
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application Error:', error);
        console.error('Error Info:', errorInfo);
        
        // 可选：发送错误报告到监控服务
        // errorReportingService.report(error, errorInfo);
      }}
    >
      <EficyProvider core={core}>
        <YourApp />
      </EficyProvider>
    </ErrorBoundary>
  );
};
```

## 🚀 性能优化

### 自动优化特性
- **Signal 细粒度更新** - 只有使用了变化 signal 的组件会重新渲染
- **缓存机制** - UnoCSS 插件自动缓存生成的样式
- **错误边界** - 自动提供组件级错误隔离
- **组件注册** - 一次注册，全局可用，避免重复传递

### 手动优化技巧

```tsx
import { signal, computed } from '@eficy/reactive';
import { memo } from 'react';

// ✅ 使用 computed 缓存计算结果
const useDataStore = () => {
  const rawData = signal([]);
  
  const processedData = computed(() => {
    // 复杂计算会被缓存，只在 rawData 变化时重新计算
    return rawData().map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
  });
  
  return { rawData, processedData };
};

// ✅ 使用 React.memo 优化非响应式组件
const StaticComponent = memo(({ title, description }) => (
  <div className="p-4 border rounded">
    <h3 className="font-bold">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
));

// ✅ 合理拆分组件，避免大组件重渲染
const UserItem = ({ user }) => (
  <div className="p-4 border rounded">
    <h3 className="font-bold">{user.name}</h3>
    <p className="text-gray-600">{user.email}</p>
  </div>
);

const UserList = () => {
  const users = signal([]);
  
  return (
    <div className="space-y-2">
      {/* 每个 UserItem 都是独立的组件，用户数据变化时只会重渲染对应的项 */}
      {users().map(user => (
        <UserItem key={user.id} user={user} />
      ))}
    </div>
  );
};

// ✅ 避免在渲染函数中创建新对象
const OptimizedComponent = () => {
  const count = signal(0);
  
  // ❌ 避免这样做 - 每次渲染都会创建新对象
  // const style = { padding: '1rem', color: count() > 5 ? 'red' : 'blue' };
  
  // ✅ 使用计算属性或条件渲染
  const textColor = computed(() => count() > 5 ? 'text-red-500' : 'text-blue-500');
  
  return (
    <div className={`p-4 ${textColor()}`}>
      Count: {count}
    </div>
  );
};
```

## 🌐 浏览器支持

- 现代浏览器和 Internet Explorer 11+
- 服务端渲染 (SSR)
- Electron 应用

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari |
|---|---|---|---|
| IE11, Edge | last 2 versions | last 2 versions | last 2 versions |

## 📚 相关文档

- [核心框架文档](../core-v3/README.md) - @eficy/core-jsx 详细文档
- [响应式系统文档](../reactive/README.md) - @eficy/reactive 详细文档
- [React 响应式集成文档](../reactive-react/README.md) - @eficy/reactive-react 详细文档
- [异步响应式文档](../reactive-async/README.md) - @eficy/reactive-async 详细文档
- [UnoCSS 插件文档](../plugin-unocss/README.md) - @eficy/plugin-unocss 详细文档
- [Playground 示例](../../playground/README.md) - 完整的应用示例

## 🔗 API 参考

### 核心 API

- `create()` - 创建预配置的 Eficy 实例
- `EficyProvider` - 提供 Eficy 上下文的组件
- `useEficyContext()` - 获取 Eficy 实例的 Hook

### 响应式 API

- `signal(value)` - 创建响应式信号
- `computed(fn)` - 创建计算属性
- `asyncSignal(fn, options)` - 创建异步信号
- `useObserver(fn)` - React Hook，监听信号变化

### 插件 API

- `core.install(Plugin, config)` - 安装插件
- `core.registerComponent(name, component)` - 注册单个组件
- `core.registerComponents(components)` - 批量注册组件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](../../LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目的启发和支持：

- [React](https://reactjs.org/) - 用户界面库
- [Preact Signals](https://preactjs.com/guide/v10/signals/) - 响应式系统基础
- [@preact/signals-react](https://github.com/preactjs/signals) - React 响应式集成
- [UnoCSS](https://unocss.dev/) - 原子化 CSS 引擎
- [TSyringe](https://github.com/microsoft/tsyringe) - 依赖注入容器
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言

---

<div align="center">
  <strong>用 ❤️ 构建，为了更好的前端开发体验</strong>
</div>
