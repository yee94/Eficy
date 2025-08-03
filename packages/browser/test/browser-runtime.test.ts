/**
 * @eficy/browser Browser Runtime Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initEficyBrowser, renderJSX, compileJSX, getEficy } from '../src/browser-runtime.js';

describe('Browser Runtime', () => {
  beforeEach(() => {
    // 清理全局实例
    (global as any).EficyBrowser = undefined;
  });

  afterEach(() => {
    // 清理 DOM
    document.body.innerHTML = '';
  });

  it('should initialize Eficy browser instance', () => {
    const eficy = initEficyBrowser();
    expect(eficy).toBeDefined();
    expect(typeof eficy.registerComponent).toBe('function');
  });

  it('should compile JSX code', () => {
    const jsxCode = `
      function App() {
        return <div>Hello World</div>;
      }
      export default App;
    `;
    
    const compiled = compileJSX(jsxCode);
    expect(compiled).toContain('React.createElement');
    expect(compiled).toContain('Hello World');
  });

  it('should render JSX to DOM', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const jsxCode = `
      function App() {
        return <div>Hello World</div>;
      }
      export default App;
    `;

    await renderJSX(jsxCode, container);
    
    expect(container.innerHTML).toContain('Hello World');
  });

  it('should handle errors gracefully', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const invalidJSX = `
      function App() {
        return <invalid-tag>Hello</invalid-tag>;
      }
      export default App;
    `;

    await expect(renderJSX(invalidJSX, container)).rejects.toThrow();
  });

  it('should support signals in JSX', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const jsxCode = `
      import { signal } from '@eficy/browser';
      
      function App() {
        const count = signal(0);
        return <div>Count: {count}</div>;
      }
      export default App;
    `;

    await renderJSX(jsxCode, container);
    
    expect(container.innerHTML).toContain('Count: 0');
  });
}); 