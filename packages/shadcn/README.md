# @eficy/shadcn-ui

一个基于 shadcn/ui 的 ESM 模块，通过 CDN 提供服务，专为 Eficy 框架优化。

## 📦 特性

- **完整的 shadcn/ui 组件库** - 包含 50+ 个高质量 React 组件
- **ESM 模块支持** - 现代化的 ES 模块格式，支持 tree-shaking
- **CDN 部署** - 通过 CDN 快速加载，减少构建时间
- **TypeScript 支持** - 完整的类型定义
- **Tailwind CSS 集成** - 基于 Tailwind CSS 的样式系统
- **Radix UI 基础** - 基于 Radix UI 的无障碍组件
- **响应式设计** - 支持移动端和桌面端

## 🚀 快速开始

### 通过 CDN 使用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shadcn UI Demo</title>
  <script type="module">
    import { Button, Card, CardContent, CardHeader, CardTitle } from 'https://cdn.jsdelivr.net/npm/@eficy/shadcn-ui@0.0.10/+esm';
    
    // 使用组件
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Shadcn UI 示例</h1>
        <div class="max-w-sm">
          <div class="bg-white rounded-lg border shadow-sm">
            <div class="p-6">
              <h3 class="text-lg font-semibold">欢迎使用</h3>
              <p class="text-gray-600 mt-2">这是一个使用 shadcn/ui 组件的示例。</p>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700">
                点击我
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  </script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

### 在 React 项目中使用

```bash
npm install @eficy/shadcn-ui
```

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@eficy/shadcn-ui';

function App() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>欢迎使用 Shadcn UI</CardTitle>
        </CardHeader>
        <CardContent>
          <p>这是一个使用 shadcn/ui 组件的示例。</p>
          <Button className="mt-4">点击我</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 📚 可用组件

### 基础组件
- **Button** - 按钮组件
- **Input** - 输入框组件
- **Label** - 标签组件
- **Textarea** - 文本域组件
- **Badge** - 徽章组件
- **Avatar** - 头像组件
- **Skeleton** - 骨架屏组件

### 布局组件
- **Card** - 卡片组件
- **Separator** - 分隔线组件
- **AspectRatio** - 宽高比组件
- **ScrollArea** - 滚动区域组件
- **Resizable** - 可调整大小组件

### 导航组件
- **NavigationMenu** - 导航菜单
- **Breadcrumb** - 面包屑导航
- **Pagination** - 分页组件
- **Tabs** - 标签页组件
- **Sidebar** - 侧边栏组件

### 交互组件
- **Dialog** - 对话框组件
- **AlertDialog** - 警告对话框
- **Popover** - 弹出框组件
- **Tooltip** - 工具提示组件
- **HoverCard** - 悬停卡片组件
- **Sheet** - 抽屉组件
- **Drawer** - 抽屉组件

### 表单组件
- **Form** - 表单组件
- **Checkbox** - 复选框组件
- **RadioGroup** - 单选按钮组
- **Switch** - 开关组件
- **Slider** - 滑块组件
- **Select** - 选择器组件
- **InputOTP** - OTP 输入组件

### 数据展示组件
- **Table** - 表格组件
- **Calendar** - 日历组件
- **Progress** - 进度条组件
- **Chart** - 图表组件

### 反馈组件
- **Alert** - 警告组件
- **Toast** - 消息提示组件
- **Toaster** - 消息提示容器

### 其他组件
- **Accordion** - 手风琴组件
- **Collapsible** - 可折叠组件
- **Command** - 命令面板组件
- **ContextMenu** - 右键菜单组件
- **DropdownMenu** - 下拉菜单组件
- **Menubar** - 菜单栏组件
- **Toggle** - 切换按钮组件
- **ToggleGroup** - 切换按钮组
- **Carousel** - 轮播图组件
- **Sonner** - 轻量级消息提示

## 🎨 样式配置

### Tailwind CSS 配置

确保你的项目包含必要的 Tailwind CSS 配置：

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### CSS 变量

在你的全局 CSS 文件中添加必要的 CSS 变量：

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

## 🔧 开发

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

## 📦 发布

### 发布新版本

1. 更新 `package.json` 中的版本号
2. 添加新组件，确保在 `src/index.ts` 中导出
3. 运行 `pnpm build`
4. 运行 `npm publish`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [shadcn/ui](https://ui.shadcn.com/) - 原始组件库
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件基础
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Magic Patterns](https://magicpatterns.com/) - 灵感来源
