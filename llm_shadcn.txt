# Eficy + shadcn/ui 页面开发规范

## 核心理念

Eficy 是一个无编译的 JSX 框架，使用单个 HTML 文件完成页面开发，配合 shadcn/ui 组件库：

### Eficy vs React 关键差异

1. **状态管理**: 使用 **Signal** 替代 React Hooks
   - Signal: `const count = signal(0)` - 简单直观的响应式状态
   - React: `const [count, setCount] = useState(0)` - 复杂的 Hook 机制
2. **导入方式**: 统一从 `'eficy'` 导入所有功能
   - ✅ `import { render, signal, computed, effect } from 'eficy'`
3. **组件注册**: 预注册组件使用 `e-` 前缀
   - `e-Button`、`e-Card`、`e-Form-Item`（不能用 `.` 访问子组件）
   - 使用标准 JSX props 传递属性
4. **样式**: 你可以直接在 `className` 中使用 Tailwind CSS，快速完成样式声明

### 基础设置

```tsx
import { render, signal, computed, effect } from "eficy";
import * as shadcnUi from "shadcdn";

// 初始化（内置 UnoCSS）
await initEficy({ components: { ...shadcnUi, ...shadcnUi.Lucide } });
```

## Signal 状态管理

### 基础用法

```tsx
// 从 eficy 统一导入
import { signal, computed, effect } from "eficy";

// 响应式状态
const count = signal(0);
const name = signal("World");

// 计算属性
const greeting = computed(() => `Hello, ${name()}!`);

// 副作用
effect(() => {
  console.log(`Count is: ${count()}`);
});

const App = () => (
  <div>
    <h1>{greeting}</h1>
    <p>Count: {count}</p>
    <e-Input value={name} onChange={(e) => name(e.target.value)} />
    <e-Button onClick={() => count(count() + 1)}>+</e-Button>
  </div>
);
```

### 异步数据处理

```tsx
import { asyncSignal } from "eficy";

const asyncState = asyncSignal(async () => {
  const response = await fetch("/api/users");
  return response.json();
});

const UserList = () => {
  return (
    <div>
      {asyncState.loading() && <div>Loading...</div>}
      {asyncState.error() && <div>Error: {asyncState.error().message}</div>}
      {asyncState.data() && (
        <ul>
          {asyncState.data().map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 表单处理

```tsx
import { signal } from "eficy";

const formData = signal({
  name: '',
  email: '',
  message: ''
});

const ContactForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData());
  };

  return (
    <e-Card>
      <e-CardHeader>
        <e-CardTitle>Contact Form</e-CardTitle>
      </e-CardHeader>
      <e-CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <e-Label htmlFor="name">Name</e-Label>
            <e-Input
              id="name"
              value={formData().name}
              onChange={(e) => formData({...formData(), name: e.target.value})}
            />
          </div>
          <div>
            <e-Label htmlFor="email">Email</e-Label>
            <e-Input
              id="email"
              type="email"
              value={formData().email}
              onChange={(e) => formData({...formData(), email: e.target.value})}
            />
          </div>
          <div>
            <e-Label htmlFor="message">Message</e-Label>
            <e-Textarea
              id="message"
              value={formData().message}
              onChange={(e) => formData({...formData(), message: e.target.value})}
            />
          </div>
          <e-Button type="submit">Submit</e-Button>
        </form>
      </e-CardContent>
    </e-Card>
  );
};
```

## shadcn/ui 组件使用规范

### 可用组件

所有 shadcn/ui 组件都可以使用 `e-` 前缀访问：

**基础组件**:
- `e-Button`, `e-Input`, `e-Label`, `e-Textarea`
- `e-Card`, `e-CardHeader`, `e-CardTitle`, `e-CardDescription`, `e-CardContent`, `e-CardFooter`
- `e-Badge`, `e-Avatar`, `e-AvatarImage`, `e-AvatarFallback`

**表单组件**:
- `e-Form`, `e-FormItem`, `e-FormLabel`, `e-FormControl`, `e-FormMessage`, `e-FormField`
- `e-Checkbox`, `e-RadioGroup`, `e-RadioGroupItem`
- `e-Select`, `e-SelectTrigger`, `e-SelectValue`, `e-SelectContent`, `e-SelectItem`

**数据展示**:
- `e-Table`, `e-TableHeader`, `e-TableBody`, `e-TableHead`, `e-TableRow`, `e-TableCell`
- `e-Tabs`, `e-TabsList`, `e-TabsTrigger`, `e-TabsContent`

**图标** (Lucide React):
- `e-Plus`, `e-Minus`, `e-Search`, `e-User`, `e-Settings`
- `e-Github`, `e-Chrome`, `e-Mail`, `e-Phone`
- 所有 Lucide 图标都可以用 `e-` 前缀使用

### React Hook Form 集成

```tsx
const ReactHookForm = shadcnUi.ReactHookForm;

const MyForm = () => {
  const form = ReactHookForm.useForm({
    defaultValues: {
      username: '',
      email: '',
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <e-Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <e-FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <e-FormItem>
              <e-FormLabel>Username</e-FormLabel>
              <e-FormControl>
                <e-Input placeholder="Enter username" {...field} />
              </e-FormControl>
              <e-FormMessage />
            </e-FormItem>
          )}
        />
        <e-Button type="submit">Submit</e-Button>
      </form>
    </e-Form>
  );
};
```

## 页面模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Eficy + shadcn/ui 示例</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/@eficy/shadcn-ui@0.0.11/dist/index.css"
    />
  </head>
  <body>
    <div id="app"></div>

    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <script type="importmap">
      {
        "imports": {
          "shadcdn": "https://unpkg.com/@eficy/shadcn-ui@0.0.11/dist/index.js"
        }
      }
    </script>

    <script
      type="module"
      src="https://unpkg.com/@eficy/browser@1.0.19/dist/standalone.mjs"
    ></script>

    <script type="text/eficy">
      import { render, initEficy, signal, computed, effect } from 'eficy';
      import * as shadcnUi from 'shadcdn';

      const icons = shadcnUi.Lucide;
      const ReactHookForm = shadcnUi.ReactHookForm;

      // 初始化 Eficy
      await initEficy({ 
        components: { 
          ...shadcnUi, 
          ...icons 
        } 
      });

      function App() {
        const count = signal(0);
      
        return (
          <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-4xl space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Hello Eficy + shadcn/ui</h1>
                <p className="text-muted-foreground">现代化的无编译开发体验</p>
              </div>
            
              <e-Card>
                <e-CardHeader>
                  <e-CardTitle>计数器示例</e-CardTitle>
                  <e-CardDescription>
                    使用 Signal 状态管理的简单计数器
                  </e-CardDescription>
                </e-CardHeader>
                <e-CardContent>
                  <div className="flex items-center space-x-4">
                    <e-Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => count(count() - 1)}
                    >
                      <e-Minus className="h-4 w-4" />
                    </e-Button>
                    <span className="text-2xl font-bold">{count}</span>
                    <e-Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => count(count() + 1)}
                    >
                      <e-Plus className="h-4 w-4" />
                    </e-Button>
                  </div>
                </e-CardContent>
              </e-Card>
            </div>
          </div>
        );
      }

      render(App, document.getElementById("app"));
    </script>
  </body>
</html>
```

## 关键要点

1. **统一导入**: 从 `'eficy'` 导入所有框架功能，从 `'shadcdn'` 导入 UI 组件
2. **Signal 优先**: 用 Signal 替代 React Hooks 进行状态管理
3. **组件前缀**: 所有 shadcn/ui 组件使用 `e-` 前缀
4. **样式优先**: 使用 Tailwind CSS 进行样式声明
5. **表单处理**: 可以使用 React Hook Form 或简单的 Signal 状态
6. **无编译**: 单 HTML 文件，`<script type="text/eficy">`
7. **图标使用**: 所有 Lucide 图标都可以通过 `e-` 前缀使用
