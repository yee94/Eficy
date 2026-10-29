import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as upstream from 'recharts';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import ts from 'typescript';
import { afterEach, expect, test, vi } from 'vitest';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifact = resolve(packageRoot, 'dist/index.js');
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test('single ESM artifact has no external module requests or embedded React implementation', () => {
  const source = readFileSync(artifact, 'utf8');
  const ast = ts.createSourceFile(artifact, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const requests: string[] = [];
  function visit(node: ts.Node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      requests.push(node.moduleSpecifier.getText(ast));
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(ast) === 'require')) {
      requests.push(node.getText(ast));
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  expect(requests).toEqual([]);
  expect(source).toContain('window.React');
  expect(source).not.toMatch(/react\.production\.min|react\.development\.js|react-dom\.production\.min|react-dom\.development\.js/);
});

test('complete exports render with legacy shadcn context, tooltip and legend overrides', async () => {
  Object.assign(window, { React, ReactDOM });
  vi.stubGlobal('ResizeObserver', class {
    constructor(private callback: ResizeObserverCallback) {}
    observe(target: Element) {
      this.callback([{ target, contentRect: { width: 640, height: 320 } } as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const height = this.classList.contains('recharts-legend-wrapper') ? 20 : 320;
    return { x: 0, y: 0, left: 0, top: 0, right: 640, bottom: height, width: 640, height, toJSON() {} };
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(640);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('recharts-legend-wrapper') ? 20 : 320;
  });
  const charts = await import(/* @vite-ignore */ artifact);
  const shadcn = await import(/* @vite-ignore */ resolve(packageRoot, '../shadcn-ui/dist/index.js'));
  const ui = { ...shadcn, Recharts: charts.Recharts, ChartTooltip: charts.Tooltip, ChartLegend: charts.Legend };
  const keys = Object.keys(upstream).filter(key => key !== 'default').sort();
  expect(Object.keys(charts.Recharts).sort()).toEqual(keys);
  expect(Object.keys(charts).filter(key => key !== 'Recharts').sort()).toEqual(keys);
  for (const key of keys) expect(charts[key]).toBe(charts.Recharts[key]);
  expect(charts.Bar.prototype).toBeInstanceOf(React.PureComponent);
  expect(charts.Tooltip.prototype).toBeInstanceOf(React.PureComponent);
  expect(ui.ChartTooltip).toBe(ui.Recharts.Tooltip);
  expect(ui.ChartLegend).toBe(ui.Recharts.Legend);
  const h = React.createElement;
  const view = render(h(ui.ChartContainer, { config: { count: { label: 'Requests', color: '#123456' } } },
    h(ui.Recharts.BarChart, { data: [{ name: 'January', count: 128 }, { name: 'February', count: 64 }] },
      h(ui.Recharts.XAxis, { dataKey: 'name' }),
      h(ui.Recharts.Bar, { dataKey: 'count', isAnimationActive: false }),
      h(ui.ChartTooltip, { content: h(ui.ChartTooltipContent), isAnimationActive: false }),
      h(ui.ChartLegend, { content: h(ui.ChartLegendContent) }))));
  await waitFor(() => expect(view.container.querySelectorAll('.recharts-bar-rectangle').length).toBe(2));
  expect(view.container.querySelector('.recharts-legend-wrapper')?.textContent).toContain('Requests');
  fireEvent.mouseMove(view.container.querySelector('.recharts-wrapper')!, { clientX: 160, clientY: 100 });
  await waitFor(() => {
    const tooltip = view.container.querySelector('.recharts-tooltip-wrapper');
    expect(tooltip?.textContent).toContain('128');
    expect(tooltip?.textContent).toContain('Requests');
    expect(tooltip?.textContent).toContain('January');
  });
});
