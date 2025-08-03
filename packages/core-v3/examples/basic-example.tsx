/**
 * Eficy Core V3 基础示例
 * 
 * 演示如何使用新的架构进行响应式开发
 */

/** @jsxImportSource eficy */

import React from 'react';
import { signal } from '@eficy/reactive';
import { EficyCore, EficyProvider } from '@eficy/core-v3';

// 创建 signals
const count = signal(0);
const name = signal('World');
const items = signal(['Apple', 'Banana', 'Orange']);

// 自定义组件
function CustomButton({ children, variant = 'primary', onClick, ...props }: any) {
  const baseStyles = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };
  
  const variantStyles = {
    primary: { backgroundColor: '#007bff', color: 'white' },
    secondary: { backgroundColor: '#6c757d', color: 'white' },
    danger: { backgroundColor: '#dc3545', color: 'white' }
  };
  
  return (
    <button 
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function CustomCard({ title, children, ...props }: any) {
  return (
    <div 
      style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '16px', 
        margin: '8px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      {...props}
    >
      {title && <h3 style={{ margin: '0 0 12px 0' }}>{title}</h3>}
      {children}
    </div>
  );
}

// 计数器组件
function Counter() {
  return (
    <CustomCard title="计数器示例">
      <div style={{ textAlign: 'center' }}>
        {/* 包含 signals 的 JSX 会自动使用 EficyNode */}
        <p style={{ fontSize: '24px', margin: '16px 0' }}>
          当前计数: {count}
        </p>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <CustomButton onClick={() => count.set(count() - 1)}>
            -1
          </CustomButton>
          
          <CustomButton onClick={() => count.set(0)} variant="secondary">
            重置
          </CustomButton>
          
          <CustomButton onClick={() => count.set(count() + 1)}>
            +1
          </CustomButton>
        </div>
        
        {/* 条件渲染 */}
        {count() > 10 && (
          <p style={{ color: 'red', marginTop: '12px' }}>
            计数器值很高了！
          </p>
        )}
      </div>
    </CustomCard>
  );
}

// 名称组件
function NameChanger() {
  return (
    <CustomCard title="名称更改示例">
      <div>
        <p>Hello, <strong>{name}</strong>!</p>
        
        <div style={{ marginTop: '12px' }}>
          <input 
            type="text"
            value={name()}
            onChange={(e) => name.set(e.target.value)}
            style={{ 
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginRight: '8px'
            }}
          />
          
          <CustomButton onClick={() => name.set('Eficy V3')}>
            设置为 Eficy V3
          </CustomButton>
        </div>
      </div>
    </CustomCard>
  );
}

// 列表组件
function TodoList() {
  const [newItem, setNewItem] = React.useState('');
  
  const addItem = () => {
    if (newItem.trim()) {
      items.set([...items(), newItem.trim()]);
      setNewItem('');
    }
  };
  
  const removeItem = (index: number) => {
    const currentItems = items();
    items.set(currentItems.filter((_, i) => i !== index));
  };
  
  return (
    <CustomCard title="动态列表示例">
      <div>
        {/* 添加项目 */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <input 
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="输入新项目..."
            style={{ 
              flex: 1,
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          
          <CustomButton onClick={addItem}>
            添加
          </CustomButton>
        </div>
        
        {/* 项目列表 */}
        <div>
          <p>项目数量: {items().length}</p>
          
          {items().length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              暂无项目
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {items().map((item, index) => (
                <li 
                  key={index}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <span>{item}</span>
                  <CustomButton 
                    variant="danger" 
                    onClick={() => removeItem(index)}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    删除
                  </CustomButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </CustomCard>
  );
}

// 组合组件展示响应式联动
function ReactiveDemo() {
  const totalScore = signal(0);
  
  // 计算派生值
  React.useEffect(() => {
    const updateTotal = () => {
      totalScore.set(count() * items().length);
    };
    
    // 简单的依赖追踪（实际应该用更好的方式）
    const interval = setInterval(updateTotal, 100);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <CustomCard title="响应式联动示例">
      <div>
        <p>
          计数器值: <strong>{count}</strong>
        </p>
        <p>
          列表项数量: <strong>{items().length}</strong>
        </p>
        <p style={{ fontSize: '18px', color: '#007bff' }}>
          总分 (计数器 × 列表项数): <strong>{totalScore}</strong>
        </p>
        
        <div style={{ marginTop: '12px' }}>
          <CustomButton onClick={() => {
            count.set(Math.floor(Math.random() * 10) + 1);
            items.set(Array.from({ length: Math.floor(Math.random() * 5) + 1 }, 
              (_, i) => `随机项目 ${i + 1}`));
          }}>
            随机生成数据
          </CustomButton>
        </div>
      </div>
    </CustomCard>
  );
}

// 主应用
function App() {
  // 创建 Eficy 核心实例
  const core = React.useMemo(() => {
    const instance = new EficyCore();
    
    // 注册自定义组件
    instance.registerComponents({
      CustomButton,
      CustomCard
    });
    
    return instance;
  }, []);
  
  return (
    <EficyProvider core={core}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#333' }}>Eficy Core V3 示例</h1>
          <p style={{ color: '#666' }}>
            基于 React + Signals 的现代化响应式组件系统
          </p>
        </header>
        
        <main>
          <Counter />
          <NameChanger />
          <TodoList />
          <ReactiveDemo />
        </main>
        
        <footer style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          padding: '16px',
          borderTop: '1px solid #eee',
          color: '#666'
        }}>
          <p>
            这个示例展示了 Eficy Core V3 的核心特性：
          </p>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <li>✅ Signals 响应式</li>
            <li>✅ 组件注册</li>
            <li>✅ 自动检测优化</li>
            <li>✅ TypeScript 支持</li>
          </ul>
        </footer>
      </div>
    </EficyProvider>
  );
}

export default App;