import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnocssPlugin } from '../src/UnocssPlugin';
import { Eficy } from '@eficy/core';
import type { EficyNode, IProcessPropsContext, IRenderContext } from '@eficy/core';

describe('UnocssPlugin', () => {
  let plugin: UnocssPlugin;
  let eficy: Eficy;
  let mockNode: EficyNode;
  let mockContext: IProcessPropsContext;
  let mockRenderContext: IRenderContext;

  beforeEach(() => {
    plugin = new UnocssPlugin();
    eficy = new Eficy();
    
    // Mock EficyNode
    mockNode = {
      id: 'test-node',
      '#': 'test',
      '#view': 'div',
      props: {
        className: 'text-red-500 p-4'
      }
    } as any;

    // Mock contexts
    mockContext = {
      eficy: eficy,
      componentMap: {},
      currentPath: []
    } as any;

    mockRenderContext = {
      eficy: eficy,
      componentMap: {},
      currentPath: [],
      isRoot: false
    } as any;

    // Mock DOM
    const mockStyle = {
      id: '',
      textContent: '',
      remove: vi.fn()
    };

    const mockDocument = {
      createElement: vi.fn(() => mockStyle),
      head: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      },
      getElementById: vi.fn(() => null)
    };

    global.document = mockDocument as any;
  });

  afterEach(() => {
    plugin.destroy();
    vi.clearAllMocks();
  });

  describe('Plugin Registration', () => {
    it('应该有正确的插件信息', () => {
      expect(plugin.name).toBe('unocss-plugin');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.enforce).toBe('pre');
    });

    it('应该能够正确安装插件', () => {
      expect(() => {
        eficy.registerPlugin(plugin);
  
      }).not.toThrow();
    });
  });

  describe('Initialization', () => {
    it('应该能够初始化 UnoCSS 生成器', async () => {
      const next = vi.fn().mockResolvedValue(undefined);
      
      await plugin.onInit({} as any, next);
      
      expect(next).toHaveBeenCalled();
      expect(plugin.getGenerator()).toBeTruthy();
    });
  });

  describe('Props Processing', () => {
    beforeEach(async () => {
      // Initialize plugin first
      const next = vi.fn().mockResolvedValue(undefined);
      await plugin.onInit({} as any, next);
    });

    it('应该收集 className 中的样式类', async () => {
      const props = {
        className: 'text-red-500 p-4 bg-blue-500',
        title: 'Test Title'
      };

      const next = vi.fn().mockResolvedValue(props);
      
      const result = await plugin.onProcessProps(props, mockNode, mockContext, next);
      
      expect(result).toEqual(props);
      expect(next).toHaveBeenCalled();
      
      // Verify classes were collected
      const collectedClasses = plugin['collectedClasses'];
      expect(collectedClasses.has('text-red-500')).toBe(true);
      expect(collectedClasses.has('p-4')).toBe(true);
      expect(collectedClasses.has('bg-blue-500')).toBe(true);
    });

    it('应该处理字符串形式的 className', async () => {
      const props = {
        className: 'text-red-500    p-4   bg-blue-500   ',
        id: 'test'
      };

      const next = vi.fn().mockResolvedValue(props);
      
      await plugin.onProcessProps(props, mockNode, mockContext, next);
      
      const collectedClasses = plugin['collectedClasses'];
      expect(collectedClasses.has('text-red-500')).toBe(true);
      expect(collectedClasses.has('p-4')).toBe(true);
      expect(collectedClasses.has('bg-blue-500')).toBe(true);
    });

    it('应该处理数组形式的 className', async () => {
      const props = {
        className: ['text-red-500', 'p-4', 'bg-blue-500'],
        id: 'test'
      };

      const next = vi.fn().mockResolvedValue(props);
      
      await plugin.onProcessProps(props, mockNode, mockContext, next);
      
      const collectedClasses = plugin['collectedClasses'];
      expect(collectedClasses.has('text-red-500')).toBe(true);
      expect(collectedClasses.has('p-4')).toBe(true);
      expect(collectedClasses.has('bg-blue-500')).toBe(true);
    });

    it('应该忽略空的或无效的 className', async () => {
      const props = {
        className: null,
        id: 'test'
      };

      const next = vi.fn().mockResolvedValue(props);
      
      await plugin.onProcessProps(props, mockNode, mockContext, next);
      
      const collectedClasses = plugin['collectedClasses'];
      expect(collectedClasses.size).toBe(0);
    });

    it('应该处理没有 className 的 props', async () => {
      const props = {
        id: 'test',
        title: 'Test'
      };

      const next = vi.fn().mockResolvedValue(props);
      
      const result = await plugin.onProcessProps(props, mockNode, mockContext, next);
      
      expect(result).toEqual(props);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Root Rendering', () => {
    beforeEach(async () => {
      // Initialize plugin and collect some classes
      const next = vi.fn().mockResolvedValue(undefined);
      await plugin.onInit({} as any, next);
      
      plugin['collectedClasses'].add('text-red-500');
      plugin['collectedClasses'].add('p-4');
      plugin['collectedClasses'].add('bg-blue-500');
    });

    it('应该在根节点渲染时注入样式', async () => {
      const mockElement = { type: 'div', props: {} };
      mockRenderContext.isRoot = true;
      
      const next = vi.fn().mockResolvedValue(mockElement);
      
      const result = await plugin.onRender(mockNode, mockRenderContext, next);
      
      expect(result).toBe(mockElement);
      expect(next).toHaveBeenCalled();
      
      // Verify CSS injection was attempted
      expect(document.createElement).toHaveBeenCalledWith('style');
    });

    it('应该在非根节点渲染时不注入样式', async () => {
      const mockElement = { type: 'div', props: {} };
      mockRenderContext.isRoot = false;
      
      const next = vi.fn().mockResolvedValue(mockElement);
      
      const result = await plugin.onRender(mockNode, mockRenderContext, next);
      
      expect(result).toBe(mockElement);
      expect(next).toHaveBeenCalled();
      
      // Verify CSS injection was not attempted
      expect(document.createElement).not.toHaveBeenCalled();
    });

    it('应该只注入一次样式', async () => {
      const mockElement = { type: 'div', props: {} };
      mockRenderContext.isRoot = true;
      
      const next = vi.fn().mockResolvedValue(mockElement);
      
      // First render
      await plugin.onRender(mockNode, mockRenderContext, next);
      
      // Second render
      await plugin.onRender(mockNode, mockRenderContext, next);
      
      // Should only create style element once
      expect(document.createElement).toHaveBeenCalledTimes(1);
    });

    it('应该处理样式生成错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock generator to throw error
      const mockGenerator = {
        generate: vi.fn().mockRejectedValue(new Error('Generation failed'))
      };
      plugin['generator'] = mockGenerator;
      
      const mockElement = { type: 'div', props: {} };
      mockRenderContext.isRoot = true;
      
      const next = vi.fn().mockResolvedValue(mockElement);
      
      const result = await plugin.onRender(mockNode, mockRenderContext, next);
      
      expect(result).toBe(mockElement);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[UnocssPlugin] Failed to generate styles:'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Destroy', () => {
    it('应该清理所有资源', () => {
      plugin['collectedClasses'].add('test-class');
      plugin['styleInjected'] = true;
      plugin['generator'] = {} as any;
      
      plugin.destroy();
      
      expect(plugin['collectedClasses'].size).toBe(0);
      expect(plugin['styleInjected']).toBe(false);
      expect(plugin['generator']).toBe(null);
    });

    it('应该移除注入的样式元素', () => {
      const mockStyle = {
        remove: vi.fn()
      };
      
      (document.getElementById as any).mockReturnValue(mockStyle);
      
      plugin.destroy();
      
      expect(document.getElementById).toHaveBeenCalledWith('unocss-runtime');
      expect(mockStyle.remove).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('应该处理未初始化的生成器', async () => {
      // Don't initialize the plugin
      const props = { className: 'text-red-500' };
      const next = vi.fn().mockResolvedValue(props);
      
      await plugin.onProcessProps(props, mockNode, mockContext, next);
      
      expect(plugin['collectedClasses'].size).toBe(0);
    });

    it('应该处理服务端渲染环境', () => {
      // Remove document
      delete (global as any).document;
      
      expect(() => {
        plugin['injectCSS']('test css');
      }).not.toThrow();
    });

    it('应该处理空的收集类名', async () => {
      // Initialize plugin but don't collect any classes
      const next = vi.fn().mockResolvedValue(undefined);
      await plugin.onInit({} as any, next);
      
      const mockElement = { type: 'div', props: {} };
      mockRenderContext.isRoot = true;
      
      const renderNext = vi.fn().mockResolvedValue(mockElement);
      
      await plugin.onRender(mockNode, mockRenderContext, renderNext);
      
      // Should not inject styles if no classes collected
      expect(document.createElement).not.toHaveBeenCalled();
    });
  });
});