import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { UnocssPlugin } from '../src/UnocssPlugin';
import React from 'react';

describe('Direct Plugin Test', () => {
  let plugin: UnocssPlugin;

  beforeEach(async () => {
    plugin = new UnocssPlugin();
    
    // Initialize plugin
    const next = vi.fn().mockResolvedValue(undefined);
    await plugin.onInit({} as any, next);
  });

  it('应该直接测试插件渲染功能', async () => {
    // Collect some classes
    const props = { className: 'text-red-500 p-4' };
    const mockNext = vi.fn().mockResolvedValue(props);
    const mockContext = {} as any;
    const mockNode = { id: 'test' } as any;

    await plugin.onProcessProps(props, mockNode, mockContext, mockNext);
    
    console.log('Collected classes:', Array.from(plugin['collectedClasses']));

    // Test render with root node
    const mockElement = React.createElement('div', { className: 'text-red-500 p-4' }, 'Test Content');
    const mockRootNode = { id: '__eficy_root' } as any;
    const mockRenderContext = {} as any;
    const mockRenderNext = vi.fn().mockResolvedValue(mockElement);

    const result = await plugin.onRender(mockRootNode, mockRenderContext, mockRenderNext);
    
    console.log('Render result:', result);
    console.log('Result type:', result.type);
    console.log('Result props:', result.props);

    // Render the result
    const { container } = render(result);
    console.log('Final HTML:', container.innerHTML);

    // Should have style tag
    const styleElement = container.querySelector('style');
    expect(styleElement).toBeTruthy();
    
    if (styleElement) {
      console.log('Style content:', styleElement.innerHTML);
    }
  });
});