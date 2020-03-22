# Eficy

[![Using TypeScript](https://img.shields.io/badge/%3C/%3E-TypeScript-0072C4.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/npm/l/generator-bxd-oss.svg)](#License)
[![](https://flat.badgen.net/npm/v/@eficy/core?icon=npm)](https://www.npmjs.com/package/@eficy/core)
[![NPM downloads](http://img.shields.io/npm/dm/@eficy/core.svg?style=flat-square)](http://npmjs.com/@eficy/core)

Eficy, a front-end orchestration framework.Can orchestrate any React components library through JSON configuration, simple configuration can generate complete page~

Recommended for use with component libraries: [AntD](https://ant.design/)

English | [简体中文](./README-zh_CN.md)

## ✨ Features

- Use JSON to orchestrate any React component library to quickly form a usable page
- Built-in Mobx Store, no need to care about store changes for page development
- Built-in request mechanism, simple configuration can complete data request
- Built-in two-way binding for easy configuration page synchronization in real time
- Refine the scope of component changes, and view component rendering performance in real time
- Support Plugin customization, can uniformly configure HOC, easily achieve front-end OOP
- suitable for large multi-page applications
- Works seamlessly with AntD 4.0+

## 🖥 Environment Support

- Modern browsers and Internet Explorer 11+ (with [polyfills](https://ant.design/docs/react/getting-started#Compatibility))
- Server-side Rendering
- [Electron](https://www.electronjs.org/)

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br>Electron |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE11, Edge                                                                                                                                                                                                     | last 2 versions                                                                                                                                                                                                  | last 2 versions                                                                                                                                                                                              | last 2 versions                                                                                                                                                                                              | last 2 versions                                                                                                                                                                                                      |

## 📦 Install

```bash
npm install @eficy/core --save
```

```bash
yarn add -S @eficy/core
```

Import from Script:

```html
<script src="https://unpkg.com/@eficy/core"></script>
```

## 🔨 Usage

Render to DOM：

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

Render as ReactElement：

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

In Browser use:

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

#### Live Update

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

#### Async request rendering

Update view based on async results：

```jsx harmony
export default {
  views: [],
  requests: {
    immediately: true,
    url: 'https://mock.xiaobe.top/mock/5da6e8bf6aac2900153c9b7e/request/reload',
  },
};
```

Fill the data according to the async return result：

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
