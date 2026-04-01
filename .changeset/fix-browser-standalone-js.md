---
'@eficy/browser': patch
---

fix: restore `standalone.js` CDN output by adding `"type": "module"` back to package.json

Without `"type": "module"`, rslib ESM format outputs `.mjs` instead of `.js`, breaking the unpkg URL `@eficy/browser/dist/standalone.js`. Also adds `"unpkg"` field to package.json for proper CDN resolution.
