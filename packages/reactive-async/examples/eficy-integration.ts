/**
 * @eficy/reactive-async 与 @eficy/core 集成示例
 * 
 * 这个示例展示了如何在外层定义异步状态，
 * 然后在 Eficy 的 JSON 配置中使用 asyncState 标记来实现响应式联动
 */

import { useRequest, asyncState } from '@eficy/reactive-async';
import Eficy from '@eficy/core';

// ===== 1. 定义异步服务函数 =====

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
}

// 模拟 API 服务
const userService = async (userId: string): Promise<User> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: parseInt(userId),
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  };
};

const postsService = async (userId: string): Promise<Post[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    { id: 1, title: 'First Post', content: 'This is my first post...', authorId: parseInt(userId) },
    { id: 2, title: 'Second Post', content: 'Another interesting post...', authorId: parseInt(userId) },
  ];
};

// ===== 2. 创建全局异步状态 =====

export const createAppState = () => {
  // 用户数据异步状态
  const userRequest = useRequest(userService, {
    manual: true,
    cacheKey: 'user-profile',
    cacheTime: 5 * 60 * 1000, // 缓存5分钟
  });

  // 用户文章异步状态
  const postsRequest = useRequest(postsService, {
    manual: true,
    cacheKey: 'user-posts',
    cacheTime: 2 * 60 * 1000, // 缓存2分钟
  });

  // 创建 AsyncState 标记 - 这些可以直接在 Eficy Schema 中使用
  const asyncStates = {
    // 用户显示名称
    userDisplayName: asyncState(userRequest, state => 
      state.data ? state.data.name : 'Unknown User'
    ),

    // 用户加载状态文本
    userStatusText: asyncState(userRequest, state => {
      if (state.loading) return 'Loading user...';
      if (state.error) return `Error: ${state.error.message}`;
      if (state.data) return 'User loaded';
      return 'No user data';
    }),

    // 文章计数
    postsCount: asyncState(postsRequest, state => 
      state.data ? state.data.length : 0
    ),

    // 是否显示文章区域
    shouldShowPosts: asyncState(userRequest, userState => {
      const postsState = postsRequest;
      return !!userState.data && (postsState.loading || (postsState.data && postsState.data.length > 0));
    }),

    // 综合加载状态
    isAnyLoading: asyncState(userRequest, () => 
      userRequest.loading || postsRequest.loading
    )
  };

  return {
    // 原始请求对象
    user: userRequest,
    posts: postsRequest,
    
    // AsyncState 标记
    ...asyncStates,
    
    // 业务操作方法
    async loadUser(userId: string) {
      try {
        await userRequest.run(userId);
        // 用户加载成功后自动加载文章
        await postsRequest.run(userId);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    },

    async refreshUserData() {
      await Promise.all([
        userRequest.refresh(),
        postsRequest.refresh()
      ]);
    },

    clearUserData() {
      userRequest.mutate(undefined);
      postsRequest.mutate(undefined);
    }
  };
};

// ===== 3. Eficy 组件注册 =====

export const setupEficyComponents = (eficy: Eficy) => {
  eficy.config({
    componentMap: {
      // 用户卡片组件
      UserCard: ({ name, email, avatar, loading, error }: any) => {
        if (loading) {
          return {
            '#view': 'div',
            className: 'user-card loading',
            '#children': 'Loading user...'
          };
        }

        if (error) {
          return {
            '#view': 'div',
            className: 'user-card error',
            '#children': `Error: ${error.message}`
          };
        }

        if (!name) {
          return {
            '#view': 'div',
            className: 'user-card empty',
            '#children': 'No user data'
          };
        }

        return {
          '#view': 'div',
          className: 'user-card',
          '#children': [
            avatar && {
              '#view': 'img',
              src: avatar,
              alt: 'User avatar',
              className: 'user-avatar'
            },
            {
              '#view': 'div',
              className: 'user-info',
              '#children': [
                {
                  '#view': 'h3',
                  className: 'user-name',
                  '#children': name
                },
                {
                  '#view': 'p',
                  className: 'user-email',
                  '#children': email
                }
              ]
            }
          ].filter(Boolean)
        };
      },

      // 文章列表组件
      PostsList: ({ posts, loading, count }: any) => {
        if (loading) {
          return {
            '#view': 'div',
            className: 'posts-list loading',
            '#children': 'Loading posts...'
          };
        }

        if (!posts || posts.length === 0) {
          return {
            '#view': 'div',
            className: 'posts-list empty',
            '#children': 'No posts found'
          };
        }

        return {
          '#view': 'div',
          className: 'posts-list',
          '#children': [
            {
              '#view': 'h4',
              className: 'posts-header',
              '#children': `Posts (${count})`
            },
            ...posts.map((post: Post) => ({
              '#view': 'article',
              key: post.id,
              className: 'post-item',
              '#children': [
                {
                  '#view': 'h5',
                  className: 'post-title',
                  '#children': post.title
                },
                {
                  '#view': 'p',
                  className: 'post-content',
                  '#children': post.content
                }
              ]
            }))
          ]
        };
      },

      // 加载按钮组件
      LoadButton: ({ onClick, disabled, children, loading }: any) => ({
        '#view': 'button',
        className: `load-button ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`,
        onClick: disabled ? undefined : onClick,
        disabled,
        '#children': children
      }),

      // 状态指示器
      StatusIndicator: ({ status, type = 'info' }: any) => ({
        '#view': 'div',
        className: `status-indicator ${type}`,
        '#children': status
      }),

      // 条件渲染容器
      ConditionalWrapper: ({ show, children }: any) => {
        return show ? {
          '#view': 'div',
          className: 'conditional-wrapper',
          '#children': Array.isArray(children) ? children : [children]
        } : null;
      }
    }
  });
};

// ===== 4. 应用 Schema 定义 =====

export const createAppSchema = (appState: ReturnType<typeof createAppState>) => {
  return {
    views: [
      {
        '#': 'app-container',
        '#view': 'div',
        className: 'app-container',
        '#children': [
          // 头部区域
          {
            '#': 'app-header',
            '#view': 'header',
            className: 'app-header',
            '#children': [
              {
                '#view': 'h1',
                '#children': 'User Profile App'
              },
              {
                '#view': 'StatusIndicator',
                status: appState.userStatusText,
                type: asyncState(appState.user, state => {
                  if (state.error) return 'error';
                  if (state.loading) return 'loading';
                  return 'success';
                })
              }
            ]
          },

          // 控制区域
          {
            '#': 'app-controls',
            '#view': 'div',
            className: 'app-controls',
            '#children': [
              {
                '#view': 'LoadButton',
                onClick: () => appState.loadUser('1'),
                disabled: appState.isAnyLoading,
                loading: appState.isAnyLoading,
                '#children': asyncState(appState.user, () => 
                  appState.isAnyLoading ? 'Loading...' : 'Load User Profile'
                )
              },
              {
                '#view': 'LoadButton',
                onClick: () => appState.refreshUserData(),
                disabled: asyncState(appState.user, state => 
                  appState.isAnyLoading || !state.data
                ),
                '#children': 'Refresh Data'
              },
              {
                '#view': 'LoadButton',
                onClick: () => appState.clearUserData(),
                disabled: asyncState(appState.user, state => 
                  appState.isAnyLoading || !state.data
                ),
                '#children': 'Clear Data'
              }
            ]
          },

          // 用户信息区域
          {
            '#': 'user-section',
            '#view': 'section',
            className: 'user-section',
            '#children': [
              {
                '#view': 'UserCard',
                name: asyncState(appState.user, state => state.data?.name),
                email: asyncState(appState.user, state => state.data?.email),
                avatar: asyncState(appState.user, state => state.data?.avatar),
                loading: asyncState(appState.user, state => state.loading),
                error: asyncState(appState.user, state => state.error)
              }
            ]
          },

          // 文章区域 - 条件显示
          {
            '#': 'posts-section',
            '#view': 'ConditionalWrapper',
            show: appState.shouldShowPosts,
            '#children': [
              {
                '#view': 'section',
                className: 'posts-section',
                '#children': [
                  {
                    '#view': 'PostsList',
                    posts: asyncState(appState.posts, state => state.data),
                    loading: asyncState(appState.posts, state => state.loading),
                    count: appState.postsCount
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
};

// ===== 5. 完整使用示例 =====

export const createApp = async () => {
  // 创建 Eficy 实例
  const eficy = new Eficy();
  
  // 注册组件
  setupEficyComponents(eficy);
  
  // 创建应用状态
  const appState = createAppState();
  
  // 创建 Schema
  const schema = createAppSchema(appState);
  
  // 创建 React 元素
  const element = await eficy.createElement(schema);
  
  return {
    element,
    appState,
    eficy
  };
};

// ===== 6. 使用示例代码 =====

/*
// 在 React 应用中使用
import { createApp } from './eficy-integration';

function App() {
  const [appElement, setAppElement] = useState(null);
  const appStateRef = useRef(null);

  useEffect(() => {
    createApp().then(({ element, appState }) => {
      setAppElement(element);
      appStateRef.current = appState;
    });
  }, []);

  if (!appElement) {
    return <div>Initializing app...</div>;
  }

  return (
    <div className="app-wrapper">
      {appElement}
    </div>
  );
}

// 或者直接渲染到 DOM
createApp().then(({ element }) => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(element);
});
*/

export default createApp;