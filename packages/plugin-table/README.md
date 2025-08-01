# @eficy/plugin-table

Table plugin for @eficy/core - Automatically generates and injects CSS styles from className attributes in Eficy components.

## 📦 Installation

```bash
npm install @eficy/plugin-table
# or
yarn add @eficy/plugin-table
# or
pnpm add @eficy/plugin-table
```

## 📖 Usage

### Basic Usage

```ts
import { Eficy } from '@eficy/core';
import { createTablePlugin } from '@eficy/plugin-table';

// Create Eficy instance
const eficy = new Eficy();

// Create and register the plugin
const tablePlugin = createTablePlugin();
tablePlugin.extend({
  components: {
    USDCurrency: (helpers) => (text, record, index) => {
      return eficy.createElement({
        '#view': 'USDCurrency',
        '#children': helpers.format(text, record, index),
      });
    },
  },
});

eficy.registerPlugin(tablePlugin);

// Use in your schema
const schema = {
  views: [
    {
      '#': 'root',
      '#view': 'div',
      '#children': {
        '#': 'table',
        '#view': 'Table',
        '#columns': [
          {
            title: 'Name',
            dataIndex: 'name',
            format: 'USDCurrency',
          },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            format: ['Time', { format: 'YYYY-MM-DD HH:mm:ss' }],
          },
          {
            title: '状态',
            dataIndex: 'status',
            format: [
              'Enum',
              {
                active: { color: 'green', text: '启用', icon: 'check' },
                pending: { color: 'gold', text: '待处理', icon: 'clock' },
                inactive: { color: 'red', text: '禁用', icon: 'close' },
              },
            ],
          },
          {
            title: 'Age',
            dataIndex: 'age',
            render: (value, record) => {
              return {
                '#view': 'Button',
                '#children': 'Edit',
              };
            },
          },
        ],
        dataSource: [],
      },
    },
  ],
};

// The plugin will automatically collect className attributes and inject the corresponding CSS
const element = await eficy.createElement(schema);
```
