import 'reflect-metadata';
import * as antd from 'antd';
import * as antdIcons from '@ant-design/icons';

// @ts-ignore
import tableRaw from './jsxs/table.jsx?raw';

import { transform } from 'sucrase';
import { create, EficyProvider } from 'eficy';
import React from 'react';

const result = transform(tableRaw, {
  transforms: ['typescript', 'jsx'],
  disableESTransforms: true,
  jsxRuntime: 'automatic',
  production: process.env.NODE_ENV === 'production',
  jsxImportSource: '@eficy/core-v3',
});

async function loadCode(code: string) {
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  const module = await import(/* @vite-ignore */ url);
  URL.revokeObjectURL(url);
  return module.default;
}

// 运行 Code
(async () => {
  try {
    const core = await create();
    core.registerComponents({ ...(antd as any), ...(antdIcons as any) });
    const Component = await loadCode(result.code);

    // 渲染组件到DOM
    const root = document.getElementById('root');
    if (root) {
      const ReactDOM = await import('react-dom/client');
      const client = ReactDOM.createRoot(root);
      client.render(
        <EficyProvider core={core}>
          <Component />
        </EficyProvider>,
      );
    }
  } catch (error) {
    console.error('🚀 #### ~ 执行代码时出错:', error);
  }
})();
