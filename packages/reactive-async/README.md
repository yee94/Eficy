# @eficy/reactive-async

一个基于 @eficy/reactive 的响应式异步请求库，提供与 ahooks useRequest 完全兼容的 API。

## 特性

🔄 **响应式状态管理** - 基于 @eficy/reactive 的细粒度响应式更新  
⚡ **高性能** - 智能缓存和批量更新优化  
🎯 **完全兼容** - 与 ahooks useRequest API 完全兼容  
🛡️ **TypeScript** - 完整的 TypeScript 类型支持  
🔧 **功能丰富** - 支持轮询、防抖、节流、重试、缓存等高级特性  
📦 **轻量级** - 基于 @preact/signals 的轻量级实现

## 安装

```bash
npm install @eficy/reactive-async
# 或
yarn add @eficy/reactive-async
# 或
pnpm add @eficy/reactive-async
```

## 基础用法

### 自动请求

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

import * as antd from 'antd'
import 'reflect-metadata'


const eficy = new Eficy()

// 配置组件库
eficy.config({
  componentMap: antd
})


// 定义异步服务函数
const getUserInfo = (userId: string) => {
  return fetch(`/api/user/${userId}`).then((res) => res.json());
};
const { data, loading, error, computed } = asyncSignal(() => getUserInfo(userId));

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'welcome',
      '#view': 'div',
      '#children': [
        {
          '#': 'title',
          '#view': 'h1',
          '#content': computed(state => {
            if (state.loading) return 'Loading...';
            if (state.error) return `Error: ${state.error.message}`;
            if (state.data) return `User: ${state.data.name}`;
            return 'No data';
          })
        },
      ]
    }
  ]
}, '#root')
```

### 手动请求

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

import * as antd from 'antd'
import 'reflect-metadata'

const eficy = new Eficy()

// 配置组件库
eficy.config({
  componentMap: antd
})

// 定义异步服务函数
const createUser = (userData: UserData) => {
  return fetch('/api/user', {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json());
};

const { data, loading, error, run, computed } = asyncSignal(createUser, {
  manual: true, // 手动触发
  onSuccess: (result) => {
    console.log('用户创建成功:', result);
  },
  onError: (error) => {
    console.error('创建失败:', error);
  },
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'create-user',
      '#view': 'div',
      '#children': [
        {
          '#': 'form',
          '#view': 'form',
          '#children': [
            {
              '#': 'name-input',
              '#view': 'Input',
              placeholder: '用户名'
            },
            {
              '#': 'email-input',
              '#view': 'Input',
              placeholder: '邮箱'
            },
            {
              '#': 'submit-btn',
              '#view': 'Button',
              disabled: computed(state => state.loading),
              '#content': computed(state => state.loading ? '创建中...' : '创建用户'),
              onClick: () => {
                const userData = {
                  name: 'John Doe',
                  email: 'john@example.com'
                };
                run(userData);
              }
            }
          ]
        },
        {
          '#': 'result',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '创建中...';
            if (state.error) return `错误: ${state.error.message}`;
            if (state.data) return `用户创建成功: ${state.data.name}`;
            return '';
          })
        }
      ]
    }
  ]
}, '#root')
```

## API 参考

### asyncSignal

```typescript
const { data, loading, error, run, refresh, cancel, mutate, computed } = asyncSignal(service, options);
```

#### 参数

- **service**: `(...args: TParams) => Promise<TData>` - 异步服务函数
- **options**: `AsyncSignalOptions<TData, TParams>` - 配置选项

#### 返回值

| 属性     | 类型                                     | 描述                 |
| -------- | ---------------------------------------- | -------------------- |
| data     | `TData \| undefined`                     | 响应数据             |
| loading  | `boolean`                                | 加载状态             |
| error    | `Error \| undefined`                     | 错误信息             |
| run      | `(...params: TParams) => Promise<TData>` | 手动触发请求         |
| refresh  | `() => Promise<TData>`                   | 使用上次参数重新请求 |
| cancel   | `() => void`                             | 取消当前请求         |
| mutate   | `(data) => void`                         | 修改数据             |
| computed | `(fn) => T`                              | 计算属性             |

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

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getStatus = () => {
  return fetch('/api/status').then((res) => res.json());
};

const { data, computed } = asyncSignal(getStatus, {
  pollingInterval: 1000, // 每秒轮询一次
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'status',
      '#view': 'div',
      '#children': [
        {
          '#': 'status-text',
          '#view': 'span',
          '#content': computed(state => {
            if (state.loading) return '检查状态中...';
            return `系统状态: ${state.data?.status || '未知'}`;
          })
        }
      ]
    }
  ]
}, '#root')
```

#### 防抖

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const searchUsers = (keyword: string) => {
  return fetch(`/api/users?q=${keyword}`).then((res) => res.json());
};

const { data, run, computed } = asyncSignal(searchUsers, {
  manual: true,
  debounceWait: 300, // 300ms 防抖
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'search',
      '#view': 'div',
      '#children': [
        {
          '#': 'search-input',
          '#view': 'Input',
          placeholder: '搜索用户...',
          onChange: (e) => {
            run(e.target.value);
          }
        },
        {
          '#': 'search-results',
          '#view': 'div',
          '#children': computed(state => {
            if (state.loading) return [{ '#': 'loading', '#view': 'div', '#content': '搜索中...' }];
            if (state.error) return [{ '#': 'error', '#view': 'div', '#content': `错误: ${state.error.message}` }];
            if (state.data) {
              return state.data.map((user, index) => ({
                '#': `user-${index}`,
                '#view': 'div',
                '#content': user.name
              }));
            }
            return [];
          })
        }
      ]
    }
  ]
}, '#root')
```

#### 节流

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetch('/api/upload', {
    method: 'POST',
    body: formData,
  }).then((res) => res.json());
};

const { data, run, computed } = asyncSignal(uploadFile, {
  manual: true,
  throttleWait: 1000, // 1秒内最多执行一次
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'upload',
      '#view': 'div',
      '#children': [
        {
          '#': 'file-input',
          '#view': 'input',
          type: 'file',
          onChange: (e) => {
            const file = e.target.files?.[0];
            if (file) {
              run(file);
            }
          }
        },
        {
          '#': 'upload-status',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '上传中...';
            if (state.error) return `上传失败: ${state.error.message}`;
            if (state.data) return `上传成功: ${state.data.url}`;
            return '请选择文件';
          })
        }
      ]
    }
  ]
}, '#root')
```

#### 重试

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const fetchData = () => {
  return fetch('/api/data').then((res) => res.json());
};

const { data, error, computed } = asyncSignal(fetchData, {
  retryCount: 3, // 最多重试3次
  retryInterval: 1000, // 重试间隔1秒
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'data-display',
      '#view': 'div',
      '#children': [
        {
          '#': 'data-content',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '加载中...';
            if (state.error) return `加载失败: ${state.error.message}`;
            if (state.data) return `数据: ${JSON.stringify(state.data)}`;
            return '暂无数据';
          })
        }
      ]
    }
  ]
}, '#root')
```

#### 缓存

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getUserInfo = (userId: string) => {
  return fetch(`/api/user/${userId}`).then((res) => res.json());
};

const { data, computed } = asyncSignal(() => getUserInfo(userId), {
  cacheKey: 'user-info', // 缓存键
  cacheTime: 60000, // 缓存1分钟
  staleTime: 30000, // 30秒内认为数据新鲜
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'user-info',
      '#view': 'div',
      '#children': [
        {
          '#': 'user-name',
          '#view': 'h2',
          '#content': computed(state => {
            if (state.loading) return '加载中...';
            if (state.error) return '加载失败';
            if (state.data) return state.data.name;
            return '未知用户';
          })
        }
      ]
    }
  ]
}, '#root')
```

#### 依赖刷新

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getUserInfo = (userId: string) => {
  return fetch(`/api/user/${userId}`).then((res) => res.json());
};

const { data, computed } = asyncSignal(() => getUserInfo(userId), {
  refreshDeps: [userId], // 当 userId 变化时重新请求
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'user-profile',
      '#view': 'div',
      '#children': [
        {
          '#': 'user-details',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '加载用户信息中...';
            if (state.error) return `加载失败: ${state.error.message}`;
            if (state.data) return `用户: ${state.data.name}, 邮箱: ${state.data.email}`;
            return '请选择用户';
          })
        }
      ]
    }
  ]
}, '#root')
```

#### 条件请求

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const fetchUserData = (userId: string) => {
  return fetch(`/api/user/${userId}`).then((res) => res.json());
};

const { data, computed } = asyncSignal(() => fetchUserData(userId), {
  ready: !!userId, // 只有当 userId 存在时才发起请求
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'conditional-data',
      '#view': 'div',
      '#children': [
        {
          '#': 'data-display',
          '#view': 'div',
          '#content': computed(state => {
            if (!userId) return '请输入用户ID';
            if (state.loading) return '加载中...';
            if (state.error) return `错误: ${state.error.message}`;
            if (state.data) return `用户数据: ${JSON.stringify(state.data)}`;
            return '暂无数据';
          })
        }
      ]
    }
  ]
}, '#root')
```

#### 窗口焦点刷新

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getLatestData = () => {
  return fetch('/api/latest').then((res) => res.json());
};

const { data, computed } = asyncSignal(getLatestData, {
  refreshOnWindowFocus: true, // 窗口重新获得焦点时刷新
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'latest-data',
      '#view': 'div',
      '#children': [
        {
          '#': 'data-content',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '获取最新数据中...';
            if (state.error) return `获取失败: ${state.error.message}`;
            if (state.data) return `最新数据: ${JSON.stringify(state.data)}`;
            return '暂无数据';
          })
        }
      ]
    }
  ]
}, '#root')
```

### 数据修改

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getUserList = () => {
  return fetch('/api/users').then((res) => res.json());
};

const { data, mutate, computed } = asyncSignal(getUserList);

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'user-list',
      '#view': 'div',
      '#children': [
        {
          '#': 'add-user-btn',
          '#view': 'Button',
          '#content': '添加用户',
          onClick: () => {
            const newUser = { id: Date.now(), name: 'New User' };
            // 直接修改
            mutate([...data.value, newUser]);
          }
        },
        {
          '#': 'user-items',
          '#view': 'div',
          '#children': computed(state => {
            if (state.loading) return [{ '#': 'loading', '#view': 'div', '#content': '加载中...' }];
            if (state.error) return [{ '#': 'error', '#view': 'div', '#content': `错误: ${state.error.message}` }];
            if (state.data) {
              return state.data.map((user, index) => ({
                '#': `user-${index}`,
                '#view': 'div',
                '#content': user.name,
                onClick: () => {
                  // 函数式修改
                  mutate((prevData) => {
                    if (!prevData) return [user];
                    return prevData.map(u => u.id === user.id ? { ...u, name: u.name + ' (已点击)' } : u);
                  });
                }
              }));
            }
            return [];
          })
        }
      ]
    }
  ]
}, '#root')
```

## 高级用法示例

### 搜索功能

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const searchUsers = (keyword: string) => {
  return fetch(`/api/users?q=${keyword}`).then((res) => res.json());
};

const { data, run, computed } = asyncSignal(searchUsers, {
  manual: true,
  debounceWait: 300,
  formatResult: (response) => response.data,
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'search-container',
      '#view': 'div',
      '#children': [
        {
          '#': 'search-input',
          '#view': 'Input',
          placeholder: '搜索用户...',
          onChange: (e) => {
            const keyword = e.target.value.trim();
            if (keyword) {
              run(keyword);
            }
          }
        },
        {
          '#': 'search-results',
          '#view': 'div',
          '#children': computed(state => {
            if (state.loading) return [{ '#': 'loading', '#view': 'div', '#content': '搜索中...' }];
            if (state.error) return [{ '#': 'error', '#view': 'div', '#content': `搜索失败: ${state.error.message}` }];
            if (state.data) {
              return state.data.map((user, index) => ({
                '#': `user-${index}`,
                '#view': 'div',
                '#content': user.name
              }));
            }
            return [];
          })
        }
      ]
    }
  ]
}, '#root')
```

### 分页列表

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getUserList = (page: number) => {
  return fetch(`/api/users?page=${page}`).then((res) => res.json());
};

const { data, run, computed } = asyncSignal(getUserList, {
  defaultParams: [1],
  cacheKey: (page) => `user-list-${page}`,
  cacheTime: 60000,
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'user-list',
      '#view': 'div',
      '#children': [
        {
          '#': 'user-items',
          '#view': 'div',
          '#children': computed(state => {
            if (state.loading) return [{ '#': 'loading', '#view': 'div', '#content': '加载中...' }];
            if (state.error) return [{ '#': 'error', '#view': 'div', '#content': `加载失败: ${state.error.message}` }];
            if (state.data) {
              return state.data.users.map((user, index) => ({
                '#': `user-${index}`,
                '#view': 'div',
                '#content': user.name
              }));
            }
            return [];
          })
        },
        {
          '#': 'pagination',
          '#view': 'div',
          '#children': [
            {
              '#': 'prev-btn',
              '#view': 'Button',
              '#content': '上一页',
              disabled: computed(state => state.loading),
              onClick: () => {
                const currentPage = 1; // 这里应该从状态中获取当前页
                if (currentPage > 1) {
                  run(currentPage - 1);
                }
              }
            },
            {
              '#': 'page-info',
              '#view': 'span',
              '#content': computed(state => {
                if (state.loading) return '加载中...';
                return `第 ${state.data?.page || 1} 页`;
              })
            },
            {
              '#': 'next-btn',
              '#view': 'Button',
              '#content': '下一页',
              disabled: computed(state => state.loading),
              onClick: () => {
                const currentPage = 1; // 这里应该从状态中获取当前页
                run(currentPage + 1);
              }
            },
            {
              '#': 'refresh-btn',
              '#view': 'Button',
              '#content': '刷新',
              onClick: () => {
                const currentPage = 1; // 这里应该从状态中获取当前页
                run(currentPage);
              }
            }
          ]
        }
      ]
    }
  ]
}, '#root')
```

### 实时数据监控

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getSystemStatus = () => {
  return fetch('/api/system/status').then((res) => res.json());
};

const { data, error, computed } = asyncSignal(getSystemStatus, {
  pollingInterval: 5000, // 每5秒轮询
  refreshOnWindowFocus: true,
  onError: (error) => {
    console.error('获取系统状态失败:', error);
  },
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'system-status',
      '#view': 'div',
      '#children': [
        {
          '#': 'status-title',
          '#view': 'h2',
          '#content': '系统状态'
        },
        {
          '#': 'status-content',
          '#view': 'div',
          '#children': computed(state => {
            if (state.error) {
              return [{
                '#': 'error-message',
                '#view': 'div',
                style: { color: 'red' },
                '#content': '获取状态失败'
              }];
            }
            if (state.data) {
              return [
                {
                  '#': 'cpu-status',
                  '#view': 'div',
                  '#content': `CPU: ${state.data.cpu}%`
                },
                {
                  '#': 'memory-status',
                  '#view': 'div',
                  '#content': `内存: ${state.data.memory}%`
                },
                {
                  '#': 'disk-status',
                  '#view': 'div',
                  '#content': `磁盘: ${state.data.disk}%`
                }
              ];
            }
            return [];
          })
        }
      ]
    }
  ]
}, '#root')
```

## 错误处理

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const fetchData = () => {
  return fetch('/api/data').then((res) => res.json());
};

const { data, error, run, computed } = asyncSignal(fetchData, {
  retryCount: 3,
  onError: (error, params) => {
    // 记录错误日志
    console.error('请求失败:', error, params);

    // 显示用户友好的错误消息
    if (error.message.includes('network')) {
      console.error('网络连接失败，请检查网络设置');
    } else if (error.message.includes('timeout')) {
      console.error('请求超时，请稍后重试');
    } else {
      console.error('请求失败，请稍后重试');
    }
  },
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'error-handling',
      '#view': 'div',
      '#children': [
        {
          '#': 'data-content',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '加载中...';
            if (state.error) {
              return `加载失败: ${state.error.message}`;
            }
            if (state.data) return `数据: ${JSON.stringify(state.data)}`;
            return '暂无数据';
          })
        },
        {
          '#': 'retry-btn',
          '#view': 'Button',
          '#content': '重试',
          onClick: () => run(),
          style: computed(state => ({
            display: state.error ? 'block' : 'none'
          }))
        }
      ]
    }
  ]
}, '#root')
```

## 性能优化

### 请求合并

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getUserInfo = (userId: string) => {
  return fetch(`/api/user/${userId}`).then((res) => res.json());
};

const { data, computed } = asyncSignal(() => getUserInfo(userId), {
  cacheKey: (userId) => `user-${userId}`,
  cacheTime: 300000, // 缓存5分钟
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'user-cache',
      '#view': 'div',
      '#children': [
        {
          '#': 'user-info',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '加载用户信息中...';
            if (state.error) return `加载失败: ${state.error.message}`;
            if (state.data) return `用户: ${state.data.name}`;
            return '请选择用户';
          })
        }
      ]
    }
  ]
}, '#root')
```

### 智能刷新

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const getData = () => {
  return fetch('/api/data').then((res) => res.json());
};

const { data, computed } = asyncSignal(getData, {
  staleTime: 60000, // 1分钟内认为数据新鲜
  cacheTime: 300000, // 缓存5分钟
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'smart-refresh',
      '#view': 'div',
      '#children': [
        {
          '#': 'data-display',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '获取数据中...';
            if (state.error) return `获取失败: ${state.error.message}`;
            if (state.data) return `数据: ${JSON.stringify(state.data)}`;
            return '暂无数据';
          })
        }
      ]
    }
  ]
}, '#root')
```

## 与其他库集成

### 与状态管理集成

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { signal } from '@eficy/reactive';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const userStore = {
  currentUser: signal(null),

  async fetchUser(userId: string) {
    const { run } = asyncSignal(getUserInfo);
    const user = await run(userId);
    this.currentUser.value = user;
    return user;
  },
};

const getUserInfo = (userId: string) => {
  return fetch(`/api/user/${userId}`).then((res) => res.json());
};

const { data, run, computed } = asyncSignal(getUserInfo, {
  manual: true,
  onSuccess: (user) => {
    userStore.currentUser.value = user;
  },
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'user-store',
      '#view': 'div',
      '#children': [
        {
          '#': 'fetch-btn',
          '#view': 'Button',
          '#content': '获取用户',
          onClick: () => run('user123')
        },
        {
          '#': 'user-display',
          '#view': 'div',
          '#content': computed(state => {
            if (state.loading) return '获取中...';
            if (state.error) return `获取失败: ${state.error.message}`;
            if (state.data) return `当前用户: ${state.data.name}`;
            return '请点击获取用户';
          })
        }
      ]
    }
  ]
}, '#root')
```

## 开发调试

```typescript
import { asyncSignal } from '@eficy/reactive-async';
import { Eficy } from '@eficy/core'

const eficy = new Eficy()

const fetchData = () => {
  return fetch('/api/data').then((res) => res.json());
};

const { data, loading, error, computed } = asyncSignal(fetchData, {
  onBefore: (params) => {
    console.log('请求开始:', params);
  },
  onSuccess: (data, params) => {
    console.log('请求成功:', data, params);
  },
  onError: (error, params) => {
    console.error('请求失败:', error, params);
  },
  onFinally: (params, data, error) => {
    console.log('请求完成:', { params, data, error });
  },
});

// 渲染 Schema
await eficy.render({
  views: [
    {
      '#': 'debug-display',
      '#view': 'div',
      '#children': [
        {
          '#': 'debug-info',
          '#view': 'div',
          '#content': computed(state => {
            return `状态: ${state.loading ? '加载中' : state.error ? '错误' : '完成'}`;
          })
        }
      ]
    }
  ]
}, '#root')
```

## 迁移指南

### 从 ahooks useRequest 迁移

本库与 ahooks useRequest 100% API 兼容，可以直接替换导入：

```typescript
// 之前
import { useRequest } from 'ahooks';

// 现在
import { asyncSignal } from '@eficy/reactive-async';

// 其他代码无需修改
const { data, loading, run } = asyncSignal(fetchData, options);
```

## 许可证

MIT
