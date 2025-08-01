# @eficy/plugin-form

Form plugin for @eficy/core.

## 🚀 Quick Start

### Installation

```bash
npm install @eficy/plugin-form
# or
yarn add @eficy/plugin-form
# or
pnpm add @eficy/plugin-form
```

### Basic Usage

```tsx
import { createFormPlugin } from '@eficy/plugin-form';
import { Eficy } from '@eficy/core';

import * as antd from 'antd';
import 'reflect-metadata';

const eficy = new Eficy();

// 配置组件库
eficy.config({
  componentMap: antd,
});

const formPlugin = createFormPlugin();
eficy.registerPlugin(formPlugin);

// 渲染 Schema
await eficy.render(
  {
    views: [
      {
        '#': 'welcome',
        '#view': 'div',
        '#children': [
          {
            '#': 'title',
            '#view': 'div',
            '#children': {
              '#view': 'Form',
              '#children': [
                {
                  '#': 'name',
                  '#view': 'Form.Item',
                  '#children': {
                    '#view': 'Input',
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  },
  '#root',
);
```
