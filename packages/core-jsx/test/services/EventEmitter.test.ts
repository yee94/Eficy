/**
 * EventEmitter 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter } from '../../src/services/EventEmitter';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('事件监听', () => {
    it('应该能够监听事件', () => {
      const listener = vi.fn();

      emitter.on('test', listener);
      emitter.emit('test', 'data');

      expect(listener).toHaveBeenCalledWith('data');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('应该能够监听多个事件', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('event1', listener1);
      emitter.on('event2', listener2);

      emitter.emit('event1', 'data1');
      emitter.emit('event2', 'data2');

      expect(listener1).toHaveBeenCalledWith('data1');
      expect(listener2).toHaveBeenCalledWith('data2');
    });

    it('应该能够为同一事件添加多个监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      emitter.emit('test', 'data');

      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener2).toHaveBeenCalledWith('data');
    });

    it('应该返回取消监听的函数', () => {
      const listener = vi.fn();
      const unsubscribe = emitter.on('test', listener);

      emitter.emit('test', 'data1');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      emitter.emit('test', 'data2');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('一次性监听', () => {
    it('应该只触发一次', () => {
      const listener = vi.fn();

      emitter.once('test', listener);

      emitter.emit('test', 'data1');
      emitter.emit('test', 'data2');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('data1');
    });

    it('应该返回取消监听的函数', () => {
      const listener = vi.fn();
      const unsubscribe = emitter.once('test', listener);

      unsubscribe();
      emitter.emit('test', 'data');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('取消监听', () => {
    it('应该能够取消特定监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      emitter.off('test', listener1);
      emitter.emit('test', 'data');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith('data');
    });

    it('取消不存在的监听器应该不报错', () => {
      const listener = vi.fn();

      expect(() => {
        emitter.off('test', listener);
      }).not.toThrow();
    });
  });

  describe('事件发射', () => {
    it('应该能够发射不带数据的事件', () => {
      const listener = vi.fn();

      emitter.on('test', listener);
      emitter.emit('test');

      expect(listener).toHaveBeenCalledWith(undefined);
    });

    it('发射不存在监听器的事件应该不报错', () => {
      expect(() => {
        emitter.emit('nonexistent', 'data');
      }).not.toThrow();
    });

    it('应该处理监听器中的错误', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      emitter.on('test', errorListener);
      emitter.on('test', normalListener);

      emitter.emit('test', 'data');

      expect(consoleError).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalledWith('data');

      consoleError.mockRestore();
    });
  });

  describe('统计信息', () => {
    it('应该返回正确的监听器数量', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      expect(emitter.listenerCount('test')).toBe(0);

      emitter.on('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.on('test', listener2);
      expect(emitter.listenerCount('test')).toBe(2);

      emitter.off('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);
    });

    it('应该返回所有事件名称', () => {
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});

      const eventNames = emitter.eventNames();

      expect(eventNames).toContain('event1');
      expect(eventNames).toContain('event2');
      expect(eventNames).toHaveLength(2);
    });

    it('应该返回事件统计信息', () => {
      emitter.on('event1', () => {});
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});

      const stats = emitter.getStats();

      expect(stats).toEqual({
        event1: 2,
        event2: 1
      });
    });
  });

  describe('清理', () => {
    it('应该能够移除特定事件的所有监听器', () => {
      emitter.on('event1', () => {});
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});

      expect(emitter.listenerCount('event1')).toBe(2);
      expect(emitter.listenerCount('event2')).toBe(1);

      emitter.removeAllListeners('event1');

      expect(emitter.listenerCount('event1')).toBe(0);
      expect(emitter.listenerCount('event2')).toBe(1);
    });

    it('应该能够移除所有事件的监听器', () => {
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});

      expect(emitter.eventNames()).toHaveLength(2);

      emitter.removeAllListeners();

      expect(emitter.eventNames()).toHaveLength(0);
    });
  });
});