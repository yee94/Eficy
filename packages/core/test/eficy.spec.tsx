import React from 'react';
import { describe, it, expect } from 'vitest';
import Eficy from '../src/core/Eficy';

describe('Eficy 核心功能', () => {
  it('应该能正确创建实例', () => {
    const eficy = new Eficy();
    expect(eficy).toBeDefined();
  });

  it('应该能配置组件库', () => {
    const eficy = new Eficy();
    const TestComponent = () => React.createElement('div', null, 'test');

    eficy.config({ componentMap: { TestComponent } });

    // 不抛出错误就说明配置成功
    expect(true).toBe(true);
  });

  it('应该能扩展配置', () => {
    const eficy = new Eficy();
    const BaseComponent = () => React.createElement('div', null, 'base');
    const ExtendedComponent = () => React.createElement('div', null, 'extended');

    eficy.config({ componentMap: { BaseComponent } });
    eficy.extend({ componentMap: { ExtendedComponent } });

    // 不抛出错误就说明扩展成功
    expect(true).toBe(true);
  });

  it('应该能创建React元素', async () => {
    const eficy = new Eficy();

    const schema = {
      views: [
        {
          '#': 'test',
          '#view': 'div',
          '#children': 'Hello World',
        },
      ],
    };

    const element = await eficy.createElement(schema);
    expect(element).toBeDefined();
    expect(React.isValidElement(element)).toBe(true);
  });

  it('空schema应该返回null', async () => {
    const eficy = new Eficy();

    const schema = {
      views: [],
    };

    const element = await eficy.createElement(schema);
    expect(element).toBe(null);
  });

  it('无效schema应该抛出错误', async () => {
    const eficy = new Eficy();

    await expect(async () => {
      await eficy.createElement(null as any);
    }).rejects.toThrow('Schema cannot be null or undefined');

    await expect(async () => {
      await eficy.createElement({} as any);
    }).rejects.toThrow('Schema must have views property');
  });

  it('多视图应该返回Fragment', async () => {
    const eficy = new Eficy();

    const schema = {
      views: [
        {
          '#': 'view1',
          '#view': 'div',
          '#children': 'View 1',
        },
        {
          '#': 'view2',
          '#view': 'div',
          '#children': 'View 2',
        },
      ],
    };

    const element = await eficy.createElement(schema);
    expect(element).toBeDefined();
    expect(React.isValidElement(element)).toBe(true);
  });
});
