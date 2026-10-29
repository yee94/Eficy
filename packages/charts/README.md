# @eficy/charts

Recharts 2.15.4 and its transitive dependencies in one browser ESM file, for
Eficy previews that should not fetch a graph of individual CDN modules.
All upstream named exports are available, plus a `Recharts` namespace for
legacy `ui.Recharts` adapters. TypeScript exports reuse the pinned upstream
types through `index.ts`.

## Host contract

Initialize `window.React` and `window.ReactDOM` with the same React 18.3.1
runtime used to render the page **before** dynamically importing this module.
The bundle reuses the shadcn build's window-backed React mocks; it does not
embed React or ReactDOM. It is a browser-only entry, not an SSR entry.

After publication, a version-pinned CDN URL has this shape (replace the
placeholder with an actually published version):

```js
const { BarChart, Bar, Tooltip, Legend } = await import(
  'https://cdn.jsdelivr.net/npm/@eficy/charts@<published-version>/dist/index.js'
);
```

For local validation, serve `dist/index.js` with JavaScript MIME type and CORS
enabled, then use its local HTTP URL in place of the template.

## Existing shadcn adapters

Keep shadcn's existing public bundle unchanged. Replace the adapter's external
Recharts import with this package, retaining its overrides:

```js
export * from 'https://cdn.jsdelivr.net/npm/@eficy/shadcn-ui@1.1.3/dist/index.js';
import { Recharts } from '<charts-module-url>';
export { Recharts };
export const ChartTooltip = Recharts.Tooltip;
export const ChartLegend = Recharts.Legend;
```

These overrides ensure the chart primitives, Tooltip and Legend use the same
Recharts instance. The shadcn `ChartContainer` still owns configuration for
`ChartTooltipContent` / `ChartLegendContent`; its original ResponsiveContainer
and some Recharts internals remain in the shadcn bundle. This approach removes
the adapter's separate network module graph, not all duplicate Recharts code
across the two standalone bundles. No existing production adapter URL is
changed before publication.

## Development

From the workspace root:

```sh
pnpm --filter @eficy/charts build
pnpm --filter @eficy/charts test
pnpm --filter @eficy/charts typecheck
```

The tests inspect emitted ESM requests and render the built chart with the
existing shadcn wrapper bundle, including a hover-driven tooltip and legend.
Build `@eficy/shadcn-ui` before running that integration test. Browser network
and timing A/B measurements must be performed separately in a real iframe.
