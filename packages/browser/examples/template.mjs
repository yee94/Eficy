import { render, initEficy, signal, isSignal, computed, effect } from 'eficy';

await initEficy({ components: { ...window.antd5 } });

// 1. 基础计数器示例
const count = signal(0);

function Counter() {
  return (
    <div>
      <div class="counter">Count: {count}</div>
      <e-Button onClick={() => count(count() + 1)}>+1</e-Button>
      <button onClick={() => count(count() - 1)}>-1</button>
      <button onClick={() => count(0)}>Reset</button>
    </div>
  );
}

// 2. 响应式输入示例
const name = signal('World');
const greeting = computed(() => `Hello, ${name()}!`);
function InputDemo() {
  return (
    <div>
      <div className="text-lg mb-2">{greeting}</div>
      <input value={name} onChange={(e) => name(e.target.value)} placeholder="输入你的名字" />
    </div>
  );
}

// 3. Todo 列表示例
const todos = signal([
  { id: 1, text: '学习 Eficy', completed: false },
  { id: 2, text: '构建应用', completed: true },
  { id: 3, text: '分享给朋友', completed: false },
]);
const newTodoText = signal('');
function TodoList() {
  const addTodo = () => {
    if (newTodoText().trim()) {
      const newTodo = {
        id: Date.now(),
        text: newTodoText(),
        completed: false,
      };
      todos([...todos(), newTodo]);
      newTodoText('');
    }
  };

  const toggleTodo = (id) => {
    todos(todos().map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id) => {
    todos(todos().filter((todo) => todo.id !== id));
  };

  return (
    <div>
      <div className="mb-4">
        <input
          value={newTodoText}
          onChange={(e) => newTodoText(e.target.value)}
          placeholder="添加新的待办事项"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>添加</button>
      </div>

      <div>
        {computed(() =>
          todos().map((todo) => (
            <div key={todo.id} class="todo-item">
              <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
              <span class={`todo-text ${todo.completed ? 'completed' : ''}`}>{todo.text}</span>
              <button onClick={() => deleteTodo(todo.id)}>删除</button>
            </div>
          )),
        )}
      </div>

      {todos().length === 0 && <div className="text-center text-gray-500 p-5">暂无待办事项</div>}
    </div>
  );
}

function FormDemo() {
  function handleSubmit(values) {
    console.log('🚀 #### ~ handleSubmit ~ values:', values);
  }
  return (
    <e-ThemeProvider prefixCls="e">
      <>
      Hi
      </>
      <e-Form layout="vertical" style={{ maxWidth: '400px' }} onSubmit={handleSubmit} onFinish={handleSubmit}>
        <e-Form-Item label="用户名" name="username">
          <e-Input placeholder="请输入用户名" />
        </e-Form-Item>

        <e-Form-Item label="邮箱" required rules={[{ required: true }]} name="email">
          <e-Input placeholder="请输入邮箱" />
        </e-Form-Item>

        <e-Form-Item label="密码" required rules={[{ required: true }]} name="password">
          <e-Input-Password placeholder="请输入密码" />
        </e-Form-Item>

        <e-Form-Item label="确认密码" required rules={[{ required: true }]} name="confirmPassword">
          <e-Input-Password placeholder="请再次输入密码" />
        </e-Form-Item>

        <e-Form-Item
          required
          rules={[{ required: true, message: '请同意用户协议' }]}
          name="agree"
          valuePropName="checked"
        >
          <e-Checkbox>
            我已阅读并同意
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('用户协议');
              }}
            >
              用户协议
            </a>
          </e-Checkbox>
        </e-Form-Item>

        <e-Form-Item>
          <e-Button type="primary" htmlType="submit">
            提交
          </e-Button>
        </e-Form-Item>
      </e-Form>
    </e-ThemeProvider>
  );
}

// 渲染所有示例
render(Counter, document.getElementById('counter-demo'));
render(InputDemo, document.getElementById('input-demo'));
render(TodoList, document.getElementById('todo-demo'));
render(FormDemo, document.getElementById('form-demo'));
