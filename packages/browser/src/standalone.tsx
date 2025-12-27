/**
 * @eficy/browser Standalone - 自包含版本
 *
 * 包含所有必要的依赖，可以直接在浏览器中使用
 */

import 'reflect-metadata';
import { create, Eficy, EficyProvider } from 'eficy';
import React, { ComponentType, ReactNode, isValidElement } from 'react';
import ReactDOM from 'react-dom/client';
import { transform } from 'sucrase';

export { Fragment, jsx, jsxs } from 'eficy';

// 全局 Eficy 实例
let globalEficy: Promise<Eficy> | null = null;

/**
 * 创建全局 Eficy 实例
 */
async function createEficy(): Promise<Eficy> {
  if (!globalEficy) {
    globalEficy = create();
  }
  return globalEficy;
}

/**
 * 获取全局 Eficy 实例
 */
export async function getEficy(): Promise<Eficy> {
  if (!globalEficy) {
    throw new Error('Eficy instance not initialized. Call createEficy() first.');
  }
  return globalEficy;
}

/**
 * 注册组件到全局 Eficy 实例
 */
export async function registerComponent(name: string, component: React.ComponentType<any>): Promise<void> {
  const eficy = await getEficy();
  eficy.registerComponent(name, component);
}

/**
 * 批量注册组件
 */
export async function registerComponents(components: Record<string, React.ComponentType<any>>): Promise<void> {
  const eficy = await getEficy();
  eficy.registerComponents(components);
}

/**
 * 编译 JSX 代码
 */
export function compileJSX(code: string): string {
  const result = transform(code, {
    transforms: ['typescript', 'jsx'],
    disableESTransforms: true,
    jsxRuntime: 'automatic',
    production: true,
    jsxImportSource: 'eficy',
  });
  return result.code;
}

/**
 * 动态加载编译后的代码
 */
export async function loadCode(code: string): Promise<any> {
  const compiledCode = compileJSX(code);
  const blob = new Blob([compiledCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  try {
    const module = await import(url);
    return module.default;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * 渲染组件到指定 DOM 元素
 */
export async function render(Component: ComponentType<any> | ReactNode, container: HTMLElement): Promise<void> {
  const eficy = await getEficy();
  const root = ReactDOM.createRoot(container);

  const isComponent = (c: any): boolean => {
    return typeof c === 'function' || (typeof c === 'object' && c !== null && !isValidElement(c) && !Array.isArray(c));
  };

  root.render(
    <EficyProvider core={eficy}>
      {isComponent(Component) ? React.createElement(Component as ComponentType<any>) : Component}
    </EficyProvider>,
  );
}

/**
 * 初始化 Eficy 浏览器环境
 */
export async function initEficy(options?: { components?: Record<string, React.ComponentType<any>> }): Promise<Eficy> {
  const eficy = await createEficy();

  if (options?.components) {
    eficy.registerComponents(options.components);
  }

  return eficy;
}

// 导出所有必要的功能
export * from 'eficy';
export { React, ReactDOM };

function setImportMap() {
  const importMap = document.createElement('script');
  importMap.type = 'importmap';
  importMap.textContent = `{
    "imports": {
      "eficy/jsx-runtime": "${import.meta.url}",
      "eficy": "${import.meta.url}"
    }
}`;
  document.head.appendChild(importMap);
}

(async () => {
  setImportMap();
  const eficyScripts = document.querySelectorAll('script[type="text/eficy"]');
  for (const script of Array.from(eficyScripts)) {
    const code = script.textContent;
    if (code) {
      await loadCode(code);
      continue;
    }

    const src = script.getAttribute('src');
    if (src) {
      const str = await fetch(src).then((res) => res.text());
      await loadCode(str);
    }
  }
})();
