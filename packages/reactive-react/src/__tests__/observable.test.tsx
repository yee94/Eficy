import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { observable, action } from '@eficy/reactive'
import { observer } from '../observer'

describe('observable method', () => {
  it('should create observable objects like MobX', async () => {
    // 这是您期望的用法
    const store = observable({
      count: 0,
      name: 'test'
    })
    
    const increment = action(() => {
      store.set('count', store.get('count') + 1)
    })
    
    const Component = observer(() => (
      <div>
        <span data-testid="count">Count: {store.get('count')}</span>
        <span data-testid="name">Name: {store.get('name')}</span>
        <button data-testid="increment" onClick={increment}>Increment</button>
      </div>
    ))
    
    render(<Component />)
    
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 0')
    expect(screen.getByTestId('name')).toHaveTextContent('Name: test')
    
    act(() => {
      increment()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 1')
    })
  })
  
  it('should create observable arrays', async () => {
    const items = observable(['apple', 'banana'])
    
    const Component = observer(() => (
      <div data-testid="items">
        Items: {items.toArray().join(', ')}
      </div>
    ))
    
    render(<Component />)
    expect(screen.getByTestId('items')).toHaveTextContent('Items: apple, banana')
    
    act(() => {
      items.push('orange')
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('items')).toHaveTextContent('Items: apple, banana, orange')
    })
  })
  
  it('should create observable primitives with observable.box', async () => {
    const count = observable.box(0)
    
    const Component = observer(() => (
      <div data-testid="count">Count: {count()}</div>
    ))
    
    render(<Component />)
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 0')
    
    act(() => {
      count(5)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('Count: 5')
    })
  })
  
  it('should create observable maps', async () => {
    const userMap = observable.map<string, string>()
    
    const Component = observer(() => {
      // 访问 size 来建立依赖关系，然后获取 keys
      const mapSize = userMap.size
      const keys = Array.from(userMap.keys())
      return (
        <div data-testid="users">
          Users ({mapSize}): {keys.join(', ')}
        </div>
      )
    })
    
    render(<Component />)
    expect(screen.getByTestId('users')).toHaveTextContent('Users (0):')
    
    act(() => {
      userMap.set('1', 'Alice')
      userMap.set('2', 'Bob')
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('users')).toHaveTextContent('Users (2): 1, 2')
    })
  })
  
  it('should auto-detect types and create appropriate observables', async () => {
    // 测试自动类型检测
    const objStore = observable({ value: 10 })
    const arrStore = observable([1, 2, 3])
    const mapStore = observable(new Map([['key', 'value']]))
    const setStore = observable(new Set([1, 2, 3]))
    const primitiveStore = observable(42)
    
    const Component = observer(() => (
      <div>
        <span data-testid="obj">Obj: {objStore.get('value')}</span>
        <span data-testid="arr">Arr: {arrStore.length}</span>
        <span data-testid="map">Map: {mapStore.size}</span>
        <span data-testid="set">Set: {setStore.size}</span>
        <span data-testid="primitive">Primitive: {primitiveStore()}</span>
      </div>
    ))
    
    render(<Component />)
    
    expect(screen.getByTestId('obj')).toHaveTextContent('Obj: 10')
    expect(screen.getByTestId('arr')).toHaveTextContent('Arr: 3')
    expect(screen.getByTestId('map')).toHaveTextContent('Map: 1')
    expect(screen.getByTestId('set')).toHaveTextContent('Set: 3')
    expect(screen.getByTestId('primitive')).toHaveTextContent('Primitive: 42')
    
    // 测试更新
    act(() => {
      objStore.set('value', 20)
      arrStore.push(4)
      mapStore.set('key2', 'value2')
      setStore.add(4)
      primitiveStore(100)
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('obj')).toHaveTextContent('Obj: 20')
      expect(screen.getByTestId('arr')).toHaveTextContent('Arr: 4')
      expect(screen.getByTestId('map')).toHaveTextContent('Map: 2')
      expect(screen.getByTestId('set')).toHaveTextContent('Set: 4')
      expect(screen.getByTestId('primitive')).toHaveTextContent('Primitive: 100')
    })
  })
}) 