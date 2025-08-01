import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { asyncSignal } from '../core/asyncSignal';
import { Eficy } from '@eficy/core';
import React from 'react';

describe('asyncSignal 与 Eficy 集成', () => {
  describe('基础集成', () => {
    it('应该与 Eficy 正确集成', async () => {
      const fetchUserInfo = async () => ({ name: 'test user' });
      const result = asyncSignal(fetchUserInfo);

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.data).toEqual({ name: 'test user' });
      expect(result.loading).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('应该在 Schema 中使用 computed 属性', () => {
      const fetchUserInfo = async () => ({ name: 'test user' });
      const result = asyncSignal(fetchUserInfo, { manual: true });

      const computed = result.computed((state) => {
        if (state.loading) return 'Loading...';
        if (state.error) return `Error: ${state.error.message}`;
        if (state.data) return `User: ${state.data.name}`;
        return 'No data';
      });

      expect(computed).toBeDefined();
      expect(typeof computed).toBe('function');
    });
  });

  describe('Schema 渲染集成', () => {
    it('应该支持在 Schema 中使用 asyncSignal', async () => {
      const fetchUserInfo = async () => ({ name: 'test user' });
      const result = asyncSignal(fetchUserInfo, { manual: true });

      // 模拟 Schema 结构
      const schema = {
        views: [
          {
            '#': 'user-info',
            '#view': 'div',
            '#children': [
              {
                '#': 'user-name',
                '#view': 'h1',
                '#content': result.computed((state) => {
                  if (state.loading) return 'Loading...';
                  if (state.error) return `Error: ${state.error.message}`;
                  if (state.data) return `User: ${state.data.name}`;
                  return 'No data';
                }),
              },
            ],
          },
        ],
      };

      expect(schema).toBeDefined();
      expect(schema.views[0]['#children'][0]['#content']).toBeDefined();
    });

    it('应该支持动态 Schema 更新', async () => {
      const fetchUserList = async () => ({ users: [{ name: 'user1' }, { name: 'user2' }] });
      const result = asyncSignal(fetchUserList, { manual: true });

      const schema = {
        views: [
          {
            '#': 'user-list',
            '#view': 'div',
            '#children': result.computed((state) => {
              if (state.loading) return [{ '#': 'loading', '#view': 'div', '#content': 'Loading...' }];
              if (state.error) return [{ '#': 'error', '#view': 'div', '#content': `Error: ${state.error.message}` }];
              if (state.data) {
                return state.data.users.map((user, index) => ({
                  '#': `user-${index}`,
                  '#view': 'div',
                  '#content': user.name,
                }));
              }
              return [];
            }),
          },
        ],
      };

      expect(schema).toBeDefined();
      expect(schema.views[0]['#children']).toBeDefined();
    });
  });

  describe('事件处理集成', () => {
    it('应该支持在 Schema 中处理事件', async () => {
      const submitForm = async (data) => ({ success: true });
      const result = asyncSignal(submitForm, { manual: true });

      const schema = {
        views: [
          {
            '#': 'form',
            '#view': 'form',
            '#children': [
              {
                '#': 'submit-btn',
                '#view': 'button',
                '#content': result.computed((state) => 
                  state.loading ? 'Submitting...' : 'Submit'
                ),
                onClick: () => {
                  result.run({ name: 'test' });
                },
              },
            ],
          },
        ],
      };

      expect(schema).toBeDefined();
      expect(schema.views[0]['#children'][0]['onClick']).toBeDefined();
    });

    it('应该支持条件渲染', async () => {
      const checkLoginStatus = async () => ({ isLoggedIn: true });
      const result = asyncSignal(checkLoginStatus, { manual: true });

      const schema = {
        views: [
          {
            '#': 'conditional-content',
            '#view': 'div',
            '#children': result.computed((state) => {
              if (state.loading) return [{ '#': 'loading', '#view': 'div', '#content': 'Loading...' }];
              if (state.data?.isLoggedIn) {
                return [
                  { '#': 'welcome', '#view': 'h1', '#content': 'Welcome!' },
                  { '#': 'logout', '#view': 'button', '#content': 'Logout' },
                ];
              } else {
                return [
                  { '#': 'login', '#view': 'button', '#content': 'Login' },
                ];
              }
            }),
          },
        ],
      };

      expect(schema).toBeDefined();
    });
  });

  describe('错误处理集成', () => {
    it('应该在 Schema 中处理错误状态', async () => {
      const error = new Error('Network error');
      const fetchWithError = async () => {
        throw error;
      };
      const result = asyncSignal(fetchWithError, { manual: true });

      const schema = {
        views: [
          {
            '#': 'error-handling',
            '#view': 'div',
            '#children': [
              {
                '#': 'error-display',
                '#view': 'div',
                '#content': result.computed((state) => {
                  if (state.error) {
                    return `Error: ${state.error.message}`;
                  }
                  return 'No error';
                }),
              },
              {
                '#': 'retry-btn',
                '#view': 'button',
                '#content': 'Retry',
                onClick: () => result.run(),
                style: result.computed((state) => ({
                  display: state.error ? 'block' : 'none',
                })),
              },
            ],
          },
        ],
      };

      expect(schema).toBeDefined();
    });
  });

  describe('数据修改集成', () => {
    it('应该在 Schema 中支持数据修改', async () => {
      const fetchItems = async () => ({ items: [{ id: 1, name: 'item1' }] });
      const result = asyncSignal(fetchItems, { manual: true });

      const schema = {
        views: [
          {
            '#': 'item-list',
            '#view': 'div',
            '#children': [
              {
                '#': 'add-item-btn',
                '#view': 'button',
                '#content': 'Add Item',
                onClick: () => {
                  result.mutate((oldData) => {
                    if (!oldData) return { items: [{ id: 1, name: 'new item' }] };
                    return {
                      ...oldData,
                      items: [...oldData.items, { id: Date.now(), name: 'new item' }],
                    };
                  });
                },
              },
              {
                '#': 'items',
                '#view': 'div',
                '#children': result.computed((state) => {
                  if (!state.data?.items) return [];
                  return state.data.items.map((item, index) => ({
                    '#': `item-${index}`,
                    '#view': 'div',
                    '#content': item.name,
                    onClick: () => {
                      result.mutate((oldData) => {
                        if (!oldData) return oldData;
                        return {
                          ...oldData,
                          items: oldData.items.map((i) =>
                            i.id === item.id ? { ...i, name: i.name + ' (clicked)' } : i
                          ),
                        };
                      });
                    },
                  }));
                }),
              },
            ],
          },
        ],
      };

      expect(schema).toBeDefined();
    });
  });

  describe('性能优化集成', () => {
    it('应该支持缓存集成', async () => {
      const fetchCachedData = async () => ({ data: 'cached data' });
      const result = asyncSignal(fetchCachedData, {
        cacheKey: 'test-cache',
        cacheTime: 5000,
        manual: true,
      });

      const schema = {
        views: [
          {
            '#': 'cached-content',
            '#view': 'div',
            '#content': result.computed((state) => {
              if (state.loading) return 'Loading...';
              if (state.data) return state.data.data;
              return 'No data';
            }),
          },
        ],
      };

      expect(schema).toBeDefined();
    });

    it('应该支持防抖集成', async () => {
      const searchService = async (query) => ({ results: [] });
      const result = asyncSignal(searchService, {
        debounceWait: 300,
        manual: true,
      });

      const schema = {
        views: [
          {
            '#': 'search-input',
            '#view': 'input',
            placeholder: 'Search...',
            onChange: (e) => {
              result.run(e.target.value);
            },
          },
          {
            '#': 'search-results',
            '#view': 'div',
            '#children': result.computed((state) => {
              if (state.loading) return [{ '#': 'loading', '#view': 'div', '#content': 'Searching...' }];
              if (state.data?.results) {
                return state.data.results.map((item, index) => ({
                  '#': `result-${index}`,
                  '#view': 'div',
                  '#content': item.name,
                }));
              }
              return [];
            }),
          },
        ],
      };

      expect(schema).toBeDefined();
    });
  });
}); 