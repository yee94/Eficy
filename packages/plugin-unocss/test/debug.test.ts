import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { UnocssPlugin } from '../src/UnocssPlugin';
import { Eficy } from '@eficy/core';
import React from 'react';

describe('Debug UnoCSS Plugin', () => {
  let eficy: Eficy;
  let plugin: UnocssPlugin;

  beforeEach(async () => {
    eficy = new Eficy();
    plugin = new UnocssPlugin();

    // Initialize plugin
    const next = vi.fn().mockResolvedValue(undefined);
    await plugin.onInit({} as any, next);

    // Register plugin
    eficy.registerPlugin(plugin);
  });

  it('应该调试插件工作流程', async () => {
    const schema = {
      views: [
        {
          '#': 'root',
          '#view': 'div',
          className: 'text-red-500',
          '#content': 'Debug Test'
        }
      ]
    };

    eficy.config({
      componentMap: {
        div: 'div'
      }
    });

    console.log('Before createElement');
    const element = await eficy.createElement(schema);
    console.log('After createElement, element:', element);
    
    const { container } = render(element);
    console.log('Container HTML:', container.innerHTML);
    
    // Check if there's any style element
    const styleElements = container.querySelectorAll('style');
    console.log('Style elements found:', styleElements.length);
    
    if (styleElements.length > 0) {
      console.log('First style element content:', styleElements[0].innerHTML);
    }
  });
});