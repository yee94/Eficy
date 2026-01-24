import 'reflect-metadata';
import { createUnocssGenerator, extractClassNames, generateCSS } from '@eficy/plugin-unocss';
import { type Eficy, EficyProvider, create } from 'eficy';
import React, { type ComponentType, type ReactNode, isValidElement } from 'react';
import ReactDOM from 'react-dom/client';
import { transform } from 'sucrase';

export { Fragment, jsx, jsxs } from 'eficy';

let globalEficy: Promise<Eficy> | null = null;
let pendingCSS = '';

async function createEficy(): Promise<Eficy> {
  if (!globalEficy) {
    globalEficy = create();
  }
  return globalEficy;
}

export async function getEficy(): Promise<Eficy> {
  if (!globalEficy) {
    throw new Error('Eficy instance not initialized. Call createEficy() first.');
  }
  return globalEficy;
}

export async function registerComponent(name: string, component: React.ComponentType<any>): Promise<void> {
  const eficy = await getEficy();
  eficy.registerComponent(name, component);
}

export async function registerComponents(components: Record<string, React.ComponentType<any>>): Promise<void> {
  const eficy = await getEficy();
  eficy.registerComponents(components);
}

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

export async function compileJSXWithCSS(code: string): Promise<{ compiledCode: string; css: string }> {
  const compiledCode = compileJSX(code);
  const classes = extractClassNames(code);
  const css = classes.size > 0 ? await generateCSS(classes) : '';
  return { compiledCode, css };
}

function injectCSS(css: string): void {
  if (!css) return;

  let styleElement = document.getElementById('eficy-unocss-styles') as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'eficy-unocss-styles';
    document.head.appendChild(styleElement);
  }

  const existingCSS = styleElement.textContent || '';
  const newRules = css.split('\n').filter((rule) => !existingCSS.includes(rule.trim()));
  if (newRules.length > 0) {
    styleElement.textContent = `${existingCSS}\n${newRules.join('\n')}`;
  }
}

export async function loadCode(code: string): Promise<any> {
  const { compiledCode, css } = await compileJSXWithCSS(code);
  pendingCSS += css;

  const blob = new Blob([compiledCode], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  try {
    const module = await import(url);
    return module.default;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function render(Component: ComponentType<any> | ReactNode, container: HTMLElement): Promise<void> {
  if (pendingCSS) {
    injectCSS(pendingCSS);
    pendingCSS = '';
  }

  const eficy = await getEficy();
  const root = ReactDOM.createRoot(container);

  const isComponent = (c: any): boolean => {
    return typeof c === 'function' || (typeof c === 'object' && c !== null && !isValidElement(c) && !Array.isArray(c));
  };

  root.render(
    <EficyProvider core={eficy}>
      {isComponent(Component) ? React.createElement(Component as ComponentType<any>) : (Component as ReactNode)}
    </EficyProvider>,
  );
}

export async function initEficy(options?: { components?: Record<string, React.ComponentType<any>> }): Promise<Eficy> {
  const eficy = await createEficy();

  if (options?.components) {
    eficy.registerComponents(options.components);
  }

  await createUnocssGenerator();

  return eficy;
}

export * from 'eficy';
export { React, ReactDOM };
export { extractClassNames, generateCSS, createUnocssGenerator } from '@eficy/plugin-unocss';

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
  await createUnocssGenerator();

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

  if (pendingCSS) {
    injectCSS(pendingCSS);
    pendingCSS = '';
  }
})();
