import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnocssPlugin } from '../src/UnocssPlugin';

describe('Simple UnoCSS Plugin Integration', () => {
  let plugin: UnocssPlugin;

  beforeEach(async () => {
    plugin = new UnocssPlugin();
    
    // Initialize plugin
    const next = vi.fn().mockResolvedValue(undefined);
    await plugin.onInit({} as any, next);
  });

  afterEach(() => {
    plugin.destroy();
  });

  it('应该完成完整的插件工作流程', async () => {
    // 1. 模拟 ProcessProps 阶段 - 收集 className
    const props1 = { className: 'text-red-500 p-4' };
    const props2 = { className: 'bg-blue-500' };
    const props3 = { className: ['flex', 'items-center'] };
    
    const mockNext = vi.fn().mockImplementation((props) => Promise.resolve(props));
    const mockContext = {} as any;
    
    // 收集多个组件的 className
    await plugin.onProcessProps(props1, { id: 'node1' } as any, mockContext, mockNext);
    await plugin.onProcessProps(props2, { id: 'node2' } as any, mockContext, mockNext);
    await plugin.onProcessProps(props3, { id: 'node3' } as any, mockContext, mockNext);
    
    // 验证所有类名都被收集
    const collectedClasses = plugin['collectedClasses'];
    expect(collectedClasses.has('text-red-500')).toBe(true);
    expect(collectedClasses.has('p-4')).toBe(true);
    expect(collectedClasses.has('bg-blue-500')).toBe(true);
    expect(collectedClasses.has('flex')).toBe(true);
    expect(collectedClasses.has('items-center')).toBe(true);
    
    console.log('Collected classes:', Array.from(collectedClasses));

    // 2. 模拟 Render 阶段 - 根节点渲染
    const mockElement = {
      type: 'div',
      props: { className: 'text-red-500 p-4' },
      key: '__eficy_root'
    };
    
    const mockRootNode = { 
      id: '__eficy_root',
      '#': 'root'
    } as any;
    
    const mockRenderContext = {} as any;
    const mockRenderNext = vi.fn().mockResolvedValue(mockElement);
    
    const result = await plugin.onRender(mockRootNode, mockRenderContext, mockRenderNext);
    
    // 3. 验证结果
    console.log('Render result type:', result.type.toString());
    console.log('Is Fragment?', result.type.toString() === 'Symbol(react.fragment)');
    
    // 应该返回 Fragment 包装的结果
    expect(result.type.toString()).toBe('Symbol(react.fragment)');
    expect(result.props.children).toHaveLength(2);
    
    // 验证第一个子元素是 style 标签
    const styleElement = result.props.children[0];
    expect(styleElement.type).toBe('style');
    expect(styleElement.props.dangerouslySetInnerHTML.__html).toContain('text-red-500');
    expect(styleElement.props.dangerouslySetInnerHTML.__html).toContain('p-4');
    expect(styleElement.props.dangerouslySetInnerHTML.__html).toContain('bg-blue-500');
    expect(styleElement.props.dangerouslySetInnerHTML.__html).toContain('flex');
    expect(styleElement.props.dangerouslySetInnerHTML.__html).toContain('items-center');
    
    console.log('Generated CSS:', styleElement.props.dangerouslySetInnerHTML.__html);
    
    // 验证第二个子元素是原始元素
    const originalElement = result.props.children[1];
    expect(originalElement).toBe(mockElement);

    // 4. 验证只注入一次
    const result2 = await plugin.onRender(mockRootNode, mockRenderContext, mockRenderNext);
    expect(result2).toBe(mockElement); // 第二次应该返回原始元素
  });

  it('应该在非根节点渲染时不注入样式', async () => {
    // 先收集一些类名
    const props = { className: 'text-red-500' };
    const mockNext = vi.fn().mockResolvedValue(props);
    await plugin.onProcessProps(props, { id: 'test' } as any, {} as any, mockNext);

    // 非根节点渲染
    const mockElement = { type: 'div', props: {} };
    const mockNonRootNode = { id: 'regular-node' } as any;
    const mockRenderNext = vi.fn().mockResolvedValue(mockElement);

    const result = await plugin.onRender(mockNonRootNode, {} as any, mockRenderNext);

    // 应该返回原始元素，不包装
    expect(result).toBe(mockElement);
  });

  it('应该处理空的收集类名', async () => {
    // 没有收集任何类名，直接渲染根节点
    const mockElement = { type: 'div', props: {} };
    const mockRootNode = { id: '__eficy_root' } as any;
    const mockRenderNext = vi.fn().mockResolvedValue(mockElement);

    const result = await plugin.onRender(mockRootNode, {} as any, mockRenderNext);

    // 没有类名时应该返回原始元素
    expect(result).toBe(mockElement);
  });
});