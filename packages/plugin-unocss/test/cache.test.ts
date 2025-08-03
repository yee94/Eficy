import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnocssPlugin } from '../src/UnocssPlugin';
import { Eficy } from '@eficy/core-jsx';

describe('UnocssPlugin Cache Functionality', () => {
  let plugin: UnocssPlugin;

  beforeEach(async() => {
    const eficy = new Eficy();
    plugin = await eficy.pluginManager.register(UnocssPlugin);
    // 等待插件初始化完成
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  afterEach(() => {
    plugin.destroy();
    vi.clearAllMocks();
  });

  describe('CSS Cache', () => {
    it('应该缓存相同的类名组合', async () => {
      // 模拟 UnoCSS 生成器
      const mockGenerator = {
        generate: vi.fn().mockResolvedValue({ css: '.text-red-500 { color: red; }' }),
      };
      plugin['generator'] = mockGenerator as any;

      // 添加相同的类名
      plugin['collectedClasses'].add('text-red-500');
      plugin['collectedClasses'].add('p-4');

      // 第一次调用 - 应该实际生成
      const result1 = await plugin['generateCSS']();
      expect(mockGenerator.generate).toHaveBeenCalledTimes(1);
      expect(result1).toBe('.text-red-500 { color: red; }');

      // 第二次调用相同类名 - 应该使用缓存
      const result2 = await plugin['generateCSS']();
      expect(mockGenerator.generate).toHaveBeenCalledTimes(1); // 不应该再次调用
      expect(result2).toBe('.text-red-500 { color: red; }');
    });

    it('应该在类名变化时重新生成', async () => {
      const mockGenerator = {
        generate: vi.fn()
          .mockResolvedValueOnce({ css: '.text-red-500 { color: red; }' })
          .mockResolvedValueOnce({ css: '.text-blue-500 { color: blue; }' }),
      };
      plugin['generator'] = mockGenerator as any;

      // 第一次类名组合
      plugin['collectedClasses'].add('text-red-500');
      const result1 = await plugin['generateCSS']();
      expect(result1).toBe('.text-red-500 { color: red; }');

      // 改变类名
      plugin['collectedClasses'].clear();
      plugin['collectedClasses'].add('text-blue-500');
      
      // 应该重新生成
      const result2 = await plugin['generateCSS']();
      expect(mockGenerator.generate).toHaveBeenCalledTimes(2);
      expect(result2).toBe('.text-blue-500 { color: blue; }');
    });

    it('应该正确排序类名以保证缓存键一致性', async () => {
      const mockGenerator = {
        generate: vi.fn().mockResolvedValue({ css: '.combined { color: red; }' }),
      };
      plugin['generator'] = mockGenerator as any;

      // 以不同顺序添加相同的类名
      plugin['collectedClasses'].add('text-red-500');
      plugin['collectedClasses'].add('p-4');
      plugin['collectedClasses'].add('bg-blue-500');

      const result1 = await plugin['generateCSS']();
      expect(mockGenerator.generate).toHaveBeenCalledTimes(1);

      // 清空并重新添加相同类名但不同顺序
      plugin['collectedClasses'].clear();
      plugin['collectedClasses'].add('bg-blue-500');
      plugin['collectedClasses'].add('text-red-500');
      plugin['collectedClasses'].add('p-4');

      const result2 = await plugin['generateCSS']();
      // 应该使用缓存，不重新调用生成器
      expect(mockGenerator.generate).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });

    it('应该在类名为空时返回null', async () => {
      const mockGenerator = {
        generate: vi.fn(),
      };
      plugin['generator'] = mockGenerator as any;

      const result = await plugin['generateCSS']();
      expect(result).toBeNull();
      expect(mockGenerator.generate).not.toHaveBeenCalled();
    });

    it('应该在生成器未初始化时返回null', async () => {
      plugin['generator'] = null;
      plugin['collectedClasses'].add('text-red-500');

      const result = await plugin['generateCSS']();
      expect(result).toBeNull();
    });

    it('应该处理生成错误并返回null', async () => {
      const mockGenerator = {
        generate: vi.fn().mockRejectedValue(new Error('Generation failed')),
      };
      plugin['generator'] = mockGenerator as any;
      plugin['collectedClasses'].add('text-red-500');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await plugin['generateCSS']();
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('[UnocssPlugin] Failed to generate styles:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Cache Management', () => {
    it('应该在destroy时清理缓存', () => {
      plugin['cssCache'].set('test-key', 'test-css');
      plugin['lastClassHash'] = 'test-hash';
      plugin['collectedClasses'].add('test-class');

      expect(plugin['cssCache'].size).toBeGreaterThan(0);
      expect(plugin['lastClassHash']).toBe('test-hash');
      expect(plugin['collectedClasses'].size).toBeGreaterThan(0);

      plugin.destroy();

      expect(plugin['cssCache'].size).toBe(0);
      expect(plugin['lastClassHash']).toBe('');
      expect(plugin['collectedClasses'].size).toBe(0);
    });

    it('应该正确处理增量类名收集', () => {
      // 初始状态
      expect(plugin['collectedClasses'].size).toBe(0);

      // 第一次收集
      plugin['collectClassNames']('text-red-500');
      expect(plugin['collectedClasses'].size).toBe(1);
      expect(plugin['collectedClasses'].has('text-red-500')).toBe(true);

      // 增量收集
      plugin['collectClassNames']('p-4');
      expect(plugin['collectedClasses'].size).toBe(2);
      expect(plugin['collectedClasses'].has('p-4')).toBe(true);

      // 重复收集应该被忽略
      plugin['collectClassNames']('text-red-500');
      expect(plugin['collectedClasses'].size).toBe(2);

      // 数组形式收集
      plugin['collectClassNames'](['bg-blue-500', 'm-2']);
      expect(plugin['collectedClasses'].size).toBe(4);
    });

    it('应该忽略无效的类名值', () => {
      plugin['collectClassNames'](null);
      plugin['collectClassNames'](undefined);
      plugin['collectClassNames']('');
      plugin['collectClassNames']([]);

      expect(plugin['collectedClasses'].size).toBe(0);
    });

    it('应该分割多个类名', () => {
      plugin['collectClassNames']('text-red-500 p-4 bg-blue-500');
      
      expect(plugin['collectedClasses'].size).toBe(3);
      expect(plugin['collectedClasses'].has('text-red-500')).toBe(true);
      expect(plugin['collectedClasses'].has('p-4')).toBe(true);
      expect(plugin['collectedClasses'].has('bg-blue-500')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('应该在大数据量下保持缓存效率', async () => {
      const mockGenerator = {
        generate: vi.fn().mockResolvedValue({ css: '.large { color: red; }' }),
      };
      plugin['generator'] = mockGenerator as any;

      const largeClassSet = new Array(1000).fill(0).map((_, i) => `class-${i}`);
      largeClassSet.forEach(cls => plugin['collectedClasses'].add(cls));

      const result1 = await plugin['generateCSS']();
      expect(result1).toBe('.large { color: red; }');
      expect(mockGenerator.generate).toHaveBeenCalledTimes(1);

      // 第二次调用应该使用缓存，不重新调用生成器
      const result2 = await plugin['generateCSS']();
      expect(result2).toBe('.large { color: red; }');
      expect(mockGenerator.generate).toHaveBeenCalledTimes(1); // 仍然只调用一次，证明使用了缓存
    });
  });

  describe('Public API', () => {
    it('应该提供获取收集类名的方法', () => {
      plugin['collectedClasses'].add('text-red-500');
      plugin['collectedClasses'].add('p-4');

      const collectedClasses = plugin.getCollectedClasses();
      expect(collectedClasses).toBeInstanceOf(Set);
      expect(collectedClasses.size).toBe(2);
      expect(collectedClasses.has('text-red-500')).toBe(true);
      expect(collectedClasses.has('p-4')).toBe(true);
    });

    it('应该提供获取生成器的方法', async () => {
      // 确保生成器已初始化
      await new Promise(resolve => setTimeout(resolve, 10));
      const generator = plugin.getGenerator();
      expect(generator).toBeDefined();
    });
  });
});