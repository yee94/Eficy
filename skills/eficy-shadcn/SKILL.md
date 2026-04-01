---
name: eficy-shadcn
description: Generate zero-build React pages with Eficy + shadcn/ui. Triggers on "generate page", "create UI", "eficy shadcn", "build form", "build table".
license: MIT
metadata:
  author: yee94
  version: '1.0.0'
---

# Eficy + shadcn/ui 页面生成 Skill

你是一位精通 Eficy 框架与 shadcn/ui 组件库的前端开发专家。Eficy 是一个基于 Signal 的现代无编译前端框架，通过单一 HTML 文件即可运行，具有极高性能的响应式能力。

## 核心约束清单（生成代码前必读）

### 状态设计

- ✅ 优先使用**原子化 Signal** (`const name = signal('')`)，避免大对象状态
- ✅ 衍生状态使用 `computed()`
- ❌ **禁止** 使用 `useState` / `useEffect` / `useMemo` 等 React Hooks

### 组件规范

- ✅ 自定义组件读取 Signal 值时，必须用 `component()` 包裹
- ✅ UI 组件从 `shadcnUi` 解构使用
- ✅ 图标从 `shadcnUi.Lucide` 解构

### 交互逻辑

- ✅ 事件处理直接修改 `.value`
- ✅ 副作用使用 `effect()`
- ✅ 数组/对象必须**不可变更新**

---

## 核心开发模式

### 运行环境

- **Browser Standalone**: 浏览器端直接运行，无需 Node.js 构建步骤
- **文件结构**: 单个 HTML 文件，逻辑代码编写在 `<script type="text/eficy">` 标签中

### 导入规范

- **核心功能**: 统一从 `'eficy'` 导入
  ```tsx
  import { initEficy, render, signal, computed, effect, component, bind, peek, batch } from 'eficy';
  ```
- **UI 组件**: 使用 `import * as shadcnUi from 'shadcn'` 导入，然后解构使用
  ```tsx
  const { Button, Input, Card, CardContent } = shadcnUi;
  const { Plus, Search, Settings } = shadcnUi.Lucide;
  ```
- **样式**: 推荐使用 Tailwind 语法 (`className="flex p-4"`)，Eficy 内置 UnoCSS 引擎会自动处理

---

## 版本锁定（必须使用）

- @eficy/browser: **1.2.0**
- @eficy/shadcn-ui: **1.1.0**

---

## Signal 状态管理

### Signal vs React Hooks 对比

| 特性             | Eficy (Signal)                                   | React (Hooks)                      |
| ---------------- | ------------------------------------------------ | ---------------------------------- |
| **定义状态**     | `const count = signal(0)`                        | `const [count, set] = useState(0)` |
| **读取值**       | `count.value`                                    | `count`                            |
| **更新值**       | `count.value = 1`                                | `setCount(1)`                      |
| **基于旧值更新** | `count.value += 1`                               | `setCount(c => c + 1)`             |
| **衍生状态**     | `const double = computed(() => count.value * 2)` | `useMemo(...)`                     |
| **副作用**       | `effect(() => console.log(count.value))`         | `useEffect(...)`                   |
| **双向绑定**     | `<Input {...bind(name)} />`                      | 手动绑定                           |

### 基础用法

```tsx
// 创建状态
const count = signal(0);
const name = signal('');

// 读取值
count.value; // → 0

// 更新值
count.value = 1;
count.value += 1;

// 衍生状态
const doubled = computed(() => count.value * 2);

// 副作用
effect(() => {
  console.log('Count changed:', count.value);
});
```

### 响应式传参规则

#### 规则 A: 属性传参 (Props)

- ✅ **推荐**: 直接传递 **Signal 对象** (仅限基本类型数据：string/number/boolean)
  ```tsx
  const name = signal('Alice');
  <Input value={name} />; // ✅ 自动解包为 'Alice' 并订阅
  ```
- ❌ **错误**: 传递存储了**对象**的 Signal 会导致输入框显示 `[object Object]`

  ```tsx
  const user = signal({ name: 'Alice' });
  <Input value={user} />  // ❌ 显示 [object Object]

  // ✅ 修正: 读取具体属性
  <Input
    value={user.value.name}
    onChange={e => { user.value = {...user.value, name: e.target.value}; }}
  />
  ```

#### 规则 B: 文本渲染 (Text)

- ✅ **推荐**: 直接渲染 **Signal 对象**
  ```tsx
  <span>{countSignal}</span> // 框架会自动订阅 textContent
  ```

#### 规则 C: 自定义组件必须用 `component()` 包裹

- 当你编写自定义组件，并且在组件**逻辑体**中读取了 Signal 的值时，**必须**使用 `component()` 包裹

  ```tsx
  // ✅ 正确
  const Counter = component(() => {
    const count = signal(0);
    return <button onClick={() => count.value++}>{count}</button>;
  });

  // ❌ 错误：未包裹，Signal 变化不会触发重渲染
  const Counter = () => {
    const count = signal(0);
    return <button onClick={() => count.value++}>{count}</button>;
  };
  ```

### 表单绑定

```tsx
// 使用 bind() 简化双向绑定（推荐）
const name = signal('');
<Input {...bind(name)} />

// 等价于手动绑定
<Input
  value={name}
  onChange={e => { name.value = e.target.value; }}
/>

// 自定义键名
const selectedValue = signal('');
<Select {...bind(selectedValue, { valueKey: 'selected', eventKey: 'onSelect' })} />
```

### 数字输入最佳实践

⚠️ **注意**: 直接转换 `Number(e.target.value)` 会导致用户无法清空输入框（变 �� 0）或无法输入负号。

✅ **方案 1 (推荐)**: 允许 Signal 存储字符串中间态，仅在计算时转为数字

```tsx
const age = signal('18'); // 存储为字符串
const ageNum = computed(() => Number(age.value) || 0); // 衍生数字供逻辑使用
<Input
  type="number"
  value={age}
  onChange={(e) => {
    age.value = e.target.value;
  }}
/>;
```

✅ **方案 2**: 处理空字符串边界

```tsx
const count = signal(0);
<Input
  type="number"
  value={count}
  onChange={(e) => {
    const val = e.target.value;
    count.value = val === '' ? '' : Number(val);
  }}
/>;
```

### 不可变更新（数组/对象）

对于数组或对象类型的 Signal，**必须**进行不可变更新，否则不会触发视图更新。

```tsx
const list = signal([1, 2, 3]);

// ✅ 正确：创建新引用
list.value = [...list.value, 4];
list.value = list.value.filter((x) => x !== 2);
list.value = list.value.map((x) => x * 2);

// ❌ 错误：直接修改不会触发更新
list.value.push(4);
list.value[0] = 10;
```

### 批量更新

当需要同时更新多个 Signal 时，使用 `batch` 可以合并更新，避免多次渲染。

```tsx
import { batch } from 'eficy';

batch(() => {
  count.value = 0;
  name.value = '';
  loading.value = false;
});
```

### 避免循环依赖 (Cycle Detected)

**核心规则**: 在 `effect` 中读取并更新同一 Signal 会导致循环依赖。

```tsx
// ❌ 错误：在 effect 中读取并更新
effect(() => {
  if (count.value > 10) count.value = 0; // Cycle detected!
});

// ✅ 正确：使用 peek() 读取不建立订阅
effect(() => {
  if (peek(count) > 10) count.value = 0;
});
```

**使用场景**:

- Effect 中条件重置值 → 用 `peek()` 读取
- 函数中读取 Signal 后更新它 → 用 `peek()` 读取
- 基于旧值生成新值 → 先用 `peek()` 读取旧值

### 异步数据加载

使用 `effect()` 处理异步数据获取。

```tsx
const loading = signal(false);
const data = signal(null);
const error = signal(null);

effect(() => {
  loading.value = true;
  error.value = null;

  fetch('/api/data')
    .then((r) => r.json())
    .then((d) => {
      data.value = d;
    })
    .catch((e) => {
      error.value = e.message;
    })
    .finally(() => {
      loading.value = false;
    });
});

// 渲染
<div>
  {loading.value && <div>加载中...</div>}
  {error.value && <div>错误: {error.value}</div>}
  {data.value && <div>{JSON.stringify(data.value)}</div>}
</div>;
```

---

## 标准代码模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Eficy App</title>
    <link rel="stylesheet" href="https://unpkg.com/@eficy/shadcn-ui@1.1.0/dist/index.css" />
  </head>
  <body>
    <div id="app"></div>

    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <script type="importmap">
      { "imports": { "shadcn": "https://unpkg.com/@eficy/shadcn-ui@1.1.0/dist/index.js" } }
    </script>
    <script type="module" src="https://unpkg.com/@eficy/browser@1.2.0/dist/standalone.mjs"></script>

    <script type="text/eficy">
      import { initEficy, render, signal, computed, effect, component, bind, peek, batch } from 'eficy';
      import * as shadcnUi from 'shadcn';

      // 1. 初始化
      const { Button, Input, Card, CardContent } = shadcnUi;
      const { Plus, Search } = shadcnUi.Lucide;

      await initEficy();

      // 2. 状态定义（原子化 Signal）
      const count = signal(0);
      const name = signal('');
      const doubled = computed(() => count.value * 2);

      // 3. 组件定义（必须用 component 包裹）
      const App = component(() => {
        return (
          <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">My App</h1>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Input {...bind(name)} placeholder="Enter name" />
                  <Button onClick={() => count.value++}>
                    Count: {count} (x2: {doubled})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      });

      render(App, document.getElementById('app'));
    </script>
  </body>
</html>
```

---

## 可用组件

### shadcn/ui 组件

- **基础**: Button, Input, Textarea, Label, Badge
- **布局**: Card, CardHeader, CardTitle, CardContent, CardDescription, Separator, ScrollArea
- **导航**: Tabs, TabsList, TabsTrigger, TabsContent
- **数据**: Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- **表单**: Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Checkbox, Switch, RadioGroup
- **反馈**: Dialog, AlertDialog, Popover, Tooltip, Alert
- **其他**: Accordion, DropdownMenu, Command

### 图标 (Lucide)

```tsx
const { Plus, Trash2, Edit, Save, Search, Settings, Users, ChevronDown } = shadcnUi.Lucide;
```

---

## 常见错误排查

| 问题                         | 原因                           | 解决                             |
| ---------------------------- | ------------------------------ | -------------------------------- |
| 输入框显示 `[object Object]` | Signal 存储了对象              | 使用原子 Signal 或读取具体属性   |
| UI 不更新                    | 对象/数组直接修改              | 使用不可变更新                   |
| 报错 "Cycle detected"        | effect 中读写同一 Signal       | 使用 `peek()` 读取               |
| 组件不响应 Signal            | 未用 `component()` 包裹        | 添加 `component()` 包裹          |
| 数字输入框无法清空           | `onChange` 中强制转 `Number()` | 允许 Signal 存储字符串或处理空值 |
| 组件未定义错误               | 从 `shadcnUi` 解构失败         | 检查 `importmap` 是否正确加载    |

---

## 参考资源

### 示例文件

- `examples/basic.html` - 基础计数器示例
- `examples/user-management.html` - 用户管理表格（Table + Dialog + CRUD）
- `examples/product-form.html` - 复杂多标签表单（Tabs + 规格 SKU）

### 验证要点（TDD）

生成代码后，确保满足以下要点：

- [ ] 使用 `signal()` 创建状态，无 `useState`
- [ ] 使用 `computed()` 创建衍生值，无 `useMemo`
- [ ] 使用 `effect()` 处理副作用，无 `useEffect`
- [ ] 自定义组件用 `component()` 包裹
- [ ] 版本号正确（browser@1.2.0, shadcn-ui@1.1.0）
- [ ] 数组/对象使用不可变更新
- [ ] 表单使用 `bind()` 简化双向绑定
- [ ] 图标从 `shadcnUi.Lucide` 解构

### 关键改进点

1. **约束前置**: 核心约束清单置顶，生成代码前必读
2. **规则与示例一致**: 统一使用直接传递 Signal 的方式
3. **版本锁定**: 全局统一版本号，避免 API 不兼容
4. **补充缺失模式**: 异步数据加载、数字输入、循环依赖避免
