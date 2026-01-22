import 'reflect-metadata';
import * as antdIcons from '@ant-design/icons';
import * as antd from 'antd';

import { batch, bind, computed, effect, signal } from '@eficy/reactive';
import { observer } from '@eficy/reactive-react';
import { EficyProvider, create } from 'eficy';
import React from 'react';
import { createRoot } from 'react-dom/client';

// ============================================
// Eficy V3 Playground - 最新 Signal 写法演示
// ============================================

// 1. 基础 Signal 状态
const count = signal(0);
const name = signal('Eficy');
const isDarkMode = signal(false);

// 2. 计算属性 (Computed)
const doubled = computed(() => count.value * 2);
const greeting = computed(() => `Hello, ${name.value}!`);
const theme = computed(() => (isDarkMode.value ? 'dark' : 'light'));

// 3. 表单状态 - 推荐使用原子化 Signal
const formName = signal('');
const formEmail = signal('');
const formAge = signal('25'); // 数字输入使用字符串避免清空问题
const formAgree = signal(false);

// 4. 列表状态
const todos = signal<Array<{ id: number; text: string; done: boolean }>>([
  { id: 1, text: '学习 Eficy Signal', done: true },
  { id: 2, text: '使用 $ 后缀协议', done: false },
  { id: 3, text: '体验 bind() 双向绑定', done: false },
]);

// 5. 计算派生列表
const completedCount = computed(() => todos.value.filter((t) => t.done).length);
const pendingCount = computed(() => todos.value.filter((t) => !t.done).length);

// 副作用示例
effect(() => {
  console.log(`[Effect] Theme changed to: ${theme.value}`);
});

// ============================================
// 组件定义
// ============================================

// 计数器组件 - 展示基础 Signal 用法
const Counter = observer(() => {
  return (
    <antd.Card title="计数器 - 基础 Signal" size="small">
      <div className="flex items-center gap-4">
        <antd.Button
          onClick={() => {
            count.value = count.value - 1;
          }}
        >
          -
        </antd.Button>
        <span className="text-2xl font-bold w-16 text-center">{count}</span>
        <antd.Button
          onClick={() => {
            count.value = count.value + 1;
          }}
        >
          +
        </antd.Button>
      </div>
      <div className="mt-2 text-gray-500">
        Double: <span className="font-semibold">{doubled}</span>
      </div>
    </antd.Card>
  );
});

// 表单组件 - 展示 $ 后缀协议和 bind()
const FormDemo = observer(() => {
  const handleSubmit = () => {
    antd.message.success(
      `提交: ${formName.value}, ${formEmail.value}, 年龄: ${formAge.value}, 同意条款: ${formAgree.value}`,
    );
  };

  const handleReset = () => {
    batch(() => {
      formName.value = '';
      formEmail.value = '';
      formAge.value = '25';
      formAgree.value = false;
    });
  };

  return (
    <antd.Card title="表单 - bind() 双向绑定" size="small">
      <antd.Space direction="vertical" className="w-full">
        {/* 使用 bind() 简化双向绑定 */}
        <div>
          <label className="block text-sm mb-1">姓名 (bind)</label>
          <antd.Input {...bind(formName)} placeholder="输入姓名" />
        </div>

        <div>
          <label className="block text-sm mb-1">邮箱 (bind)</label>
          <antd.Input {...bind(formEmail)} placeholder="输入邮箱" />
        </div>

        {/* 数字输入 - 使用字符串 Signal */}
        <div>
          <label className="block text-sm mb-1">年龄 (字符串中间态)</label>
          <antd.Input
            type="number"
            value={formAge.value}
            onChange={(e) => {
              formAge.value = e.target.value;
            }}
            placeholder="输入年龄"
          />
        </div>

        {/* Checkbox 使用 bind() */}
        <div className="flex items-center gap-2">
          <antd.Checkbox {...bind(formAgree, { valueKey: 'checked' })}>同意条款</antd.Checkbox>
        </div>

        <div className="flex gap-2">
          <antd.Button type="primary" onClick={handleSubmit}>
            提交
          </antd.Button>
          <antd.Button onClick={handleReset}>重置</antd.Button>
        </div>

        {/* 实时预览 */}
        <antd.Alert
          type="info"
          message={
            <span>
              实时数据: {formName.value} | {formEmail.value} | {formAge.value}岁 | 同意: {String(formAgree.value)}
            </span>
          }
        />
      </antd.Space>
    </antd.Card>
  );
});

// Todo 列表 - 展示数组状态和不可变更新
const TodoList = observer(() => {
  const newTodo = signal('');

  const addTodo = () => {
    const text = newTodo.value.trim();
    if (!text) return;
    // 不可变更新
    todos.value = [...todos.value, { id: Date.now(), text, done: false }];
    newTodo.value = '';
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: number) => {
    todos.value = todos.value.filter((t) => t.id !== id);
  };

  return (
    <antd.Card
      title={
        <span>
          Todo 列表 - 完成 {completedCount}/{computed(() => todos.value.length)}
        </span>
      }
      size="small"
    >
      <div className="flex gap-2 mb-4">
        <antd.Input {...bind(newTodo)} placeholder="添加新任务" onPressEnter={addTodo} />
        <antd.Button type="primary" onClick={addTodo}>
          添加
        </antd.Button>
      </div>

      <antd.List
        size="small"
        dataSource={todos.value}
        renderItem={(item) => (
          <antd.List.Item
            actions={[
              <antd.Button key="delete" type="link" danger size="small" onClick={() => deleteTodo(item.id)}>
                删除
              </antd.Button>,
            ]}
          >
            <antd.Checkbox checked={item.done} onChange={() => toggleTodo(item.id)}>
              <span className={item.done ? 'line-through text-gray-400' : ''}>{item.text}</span>
            </antd.Checkbox>
          </antd.List.Item>
        )}
      />

      <div className="mt-2 text-sm text-gray-500">
        待完成: {pendingCount} | 已完成: {completedCount}
      </div>
    </antd.Card>
  );
});

// 主题切换 - 展示 Signal 驱动 UI
const ThemeToggle = observer(() => {
  return (
    <antd.Card title="主题切换" size="small">
      <div className="flex items-center gap-4">
        <span>当前主题: {theme}</span>
        <antd.Switch
          checked={isDarkMode.value}
          onChange={(checked) => {
            isDarkMode.value = checked;
          }}
          checkedChildren="暗色"
          unCheckedChildren="亮色"
        />
      </div>
    </antd.Card>
  );
});

// 问候组件
const Greeting = observer(() => {
  return (
    <antd.Card title="问候 - Computed" size="small">
      <antd.Input {...bind(name)} placeholder="输入你的名字" className="mb-2" />
      <div className="text-lg">{greeting}</div>
    </antd.Card>
  );
});

// 主应用组件
const App = observer(() => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <antd.Typography.Title level={2} className="text-center mb-6">
          Eficy V3 Playground
        </antd.Typography.Title>

        <antd.Alert
          type="success"
          className="mb-6"
          message="Signal 响应式系统演示"
          description={
            <ul className="list-disc list-inside mt-2">
              <li>
                <code>signal()</code> - 创建响应式状态
              </li>
              <li>
                <code>computed()</code> - 创建派生状态
              </li>
              <li>
                <code>bind()</code> - 双向绑定辅助函数 (返回 value$ + onChange)
              </li>
              <li>
                <code>batch()</code> - 批量更新
              </li>
              <li>
                <code>observer()</code> - 包裹读取 Signal 的组件
              </li>
            </ul>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Counter />
          <Greeting />
          <ThemeToggle />
          <FormDemo />
          <div className="md:col-span-2">
            <TodoList />
          </div>
        </div>

        <antd.Card className="mt-6" size="small">
          <antd.Typography.Title level={5}>技术栈</antd.Typography.Title>
          <antd.Space wrap>
            <antd.Tag color="blue">Eficy V3</antd.Tag>
            <antd.Tag color="green">@eficy/reactive</antd.Tag>
            <antd.Tag color="orange">$ 后缀协议</antd.Tag>
            <antd.Tag color="purple">bind() 双向绑定</antd.Tag>
            <antd.Tag color="cyan">Ant Design 5</antd.Tag>
          </antd.Space>
        </antd.Card>
      </div>
    </div>
  );
});

// ============================================
// 启动应用
// ============================================
(async () => {
  try {
    const core = await create();
    core.registerComponents({ ...(antd as any), ...(antdIcons as any) });

    const root = document.getElementById('root');
    if (root) {
      const client = createRoot(root);
      client.render(
        <EficyProvider core={core}>
          <App />
        </EficyProvider>,
      );
    }
  } catch (error) {
    console.error('启动失败:', error);
  }
})();
