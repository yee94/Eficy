# Eficy

[![Using TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/npm/l/generator-bxd-oss.svg)](#License)
[![](https://flat.badgen.net/npm/v/@eficy/core?icon=npm)](https://www.npmjs.com/package/@eficy/core)
[![NPM downloads](http://img.shields.io/npm/dm/@eficy/core.svg?style=flat-square)](http://npmjs.com/@eficy/core)

Eficy 前端编排框架，通过 JSON 配置编排 React 组件，简单配置即可生成完整页面。

推荐编排组件库：[AntD](https://ant.design/)

[English](./README.md) | 简体中文

## ✨ 功能

- 使用 JSON 编排任意 React 组件库，快速形成可用页面
- 内置 Mobx Store，页面开发无需关心 Store 变更
- 内置 request 机制，简单配置即可完成数据请求
- 内置双向绑定，轻松配置页面实时同步
- 细化组件变更范围，组件渲染性能实时查看
- 支持 Plugin 定制，可统一配置 HOC，轻松实现前端 OOP
- 开箱即用，适合大型多页后台应用
- 无缝接入 AntD 4.0+

## 🖥 支持环境

- 现代浏览器和 IE11 及以上。
- 支持服务端渲染。
- [Electron](https://www.electronjs.org/)

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Electron |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE11, Edge                                                                                                                                                                                                     | last 2 versions                                                                                                                                                                                                  | last 2 versions                                                                                                                                                                                              | last 2 versions                                                                                                                                                                                              | last 2 versions                                                                                                                                                                                                      |

## 📦 安装

```bash
npm install @eficy/core --save
```

```bash
yarn add -S @eficy/core
```

Script 引入：

```html
<script src="https://unpkg.com/@eficy/core"></script>
```

## 🔨 示例

渲染至 DOM 节点：

```jsx
import * as Eficy from '@eficy/core';
import antd from 'antd';

// config global default componentMap
Eficy.Config.defaultComponentMap = Object.assign({}, antd);

Eficy.render(
  {
    '#view': 'div',
    style: {
      padding: 10,
      background: '#CCC',
    },
    '#children': [
      {
        '#view': 'Alert',
        message: 'Hello this is a Alert',
        type: 'info',
        showIcon: true,
      },
    ],
  },
  '#root',
);
```

输出为 ReactElement：

```jsx
import * as Eficy from '@eficy/core';
import antd from 'antd';

// config global default componentMap
Eficy.Config.defaultComponentMap = Object.assign({}, antd);

const App = () => {
  return Eficy.createElement({
    '#view': 'div',
    style: {
      padding: 10,
      background: '#CCC',
    },
    '#children': [
      {
        '#view': 'Alert',
        message: 'Hello this is a Alert',
        type: 'info',
        showIcon: true,
      },
    ],
  });
};
```

在浏览器中使用：

```html
<link rel="stylesheet" href="https://unpkg.com/antd@4.0.3/dist/antd.min.css" />
<script src="https://unpkg.com/antd@4.0.3/dist/antd.min.js"></script>
<script src="https://unpkg.com/@ant-design/icons@4.0.2/dist/index.umd.js"></script>

<div id="root"></div>

<script>
  Eficy.Config.successAlert = ({ msg }) => antd.message.success(msg);
  Eficy.Config.failAlert = ({ msg }) => antd.message.error(msg);
  Eficy.Config.defaultComponentMap = Object.assign({}, antd, { Icons: icons });

  Eficy.render(
    {
      '#view': 'div',
      style: {
        padding: 10,
        background: '#CCC',
      },
      '#children': [
        {
          '#view': 'Alert',
          message: 'Hello this is a Alert',
          type: 'info',
          showIcon: true,
        },
      ],
    },
    '#root',
  );
</script>
```

#### 实时更新

<div align="center">

![](http://md.xiaobe.top/117c9790-1c62-5b41-a223-82947bdc180c.png)

</div>

```jsx harmony
export default [
  {
    '#view': 'Alert',
    message: 'quick bind ${models.input.value}', // => will be output as "quick bind value"
    type: 'success',
    showIcon: true,
  },
  {
    '#': 'input',
    '#view': 'Input',
    value: 'value', // => value change will be sync to Alert message
  },
];
```

#### 异步请求渲染

根据异步返回结果更新视图：

```jsx harmony
export default {
  views: [],
  requests: {
    immediately: true,
    url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/reload',
  },
};
```

根据异步返回结果，填充数据：

<div align="center">

![](http://md.xiaobe.top/0c1012d6-8631-63bc-a37c-56586ad88040.png)

</div>

```jsx harmony
export default {
  views: [
    {
      '#view': 'Table',
      '#request': {
        '#': 'getTableData',
        url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/table/getlist',
        format: res => ({
          action: 'update',
          data: [
            {
              '#': 'table',
              dataSource: res.data,
            },
          ],
        }),
      },
      pagination: {
        total: 50,
      },
      columns: [
        ...
      ],
    },
  ],
};
```
