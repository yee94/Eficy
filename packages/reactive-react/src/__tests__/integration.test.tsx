import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { observableObject, action } from '@eficy/reactive'
import { observer } from '../observer'

describe('Integration Tests', () => {
  it('should work with observable objects', () => {
    const store = observableObject({
      count: 0,
      name: 'Counter'
    })
    
    const increment = action(() => {
      store.set('count', store.get('count') + 1)
    })
    
    const updateName = action((newName: string) => {
      store.set('name', newName)
    })
    
    const App = observer(() => (
      <div>
        <h1 data-testid="name">{store.get('name')}</h1>
        <span data-testid="count">Count: {store.get('count')}</span>
        <button data-testid="increment" onClick={increment}>
          +1
        </button>
        <button data-testid="rename" onClick={() => updateName('Updated Counter')}>
          Rename
        </button>
      </div>
    ))
    
    render(<App />)
    
    expect(screen.getByTestId('name')).toHaveTextContent('Counter')
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 0')
    
    fireEvent.click(screen.getByTestId('increment'))
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 1')
    
    fireEvent.click(screen.getByTestId('rename'))
    expect(screen.getByTestId('name')).toHaveTextContent('Updated Counter')
  })
  
  it('should work with multiple observers', () => {
    const store = observableObject({
      value: 10
    })
    
    const updateValue = action((newValue: number) => {
      store.set('value', newValue)
    })
    
    const Component1 = observer(() => (
      <div data-testid="comp1">Component 1: {store.get('value')}</div>
    ))
    
    const Component2 = observer(() => (
      <div data-testid="comp2">Component 2: {store.get('value') * 2}</div>
    ))
    
    const App = () => (
      <div>
        <Component1 />
        <Component2 />
        <button data-testid="update" onClick={() => updateValue(20)}>
          Update
        </button>
      </div>
    )
    
    render(<App />)
    
    expect(screen.getByTestId('comp1')).toHaveTextContent('Component 1: 10')
    expect(screen.getByTestId('comp2')).toHaveTextContent('Component 2: 20')
    
    fireEvent.click(screen.getByTestId('update'))
    
    expect(screen.getByTestId('comp1')).toHaveTextContent('Component 1: 20')
    expect(screen.getByTestId('comp2')).toHaveTextContent('Component 2: 40')
  })
  
  it('should handle nested components correctly', () => {
    const store = observableObject({
      user: {
        name: 'John',
        age: 25
      }
    })
    
    const updateUser = action((updates: Partial<{ name: string; age: number }>) => {
      const currentUser = store.get('user')
      store.set('user', { ...currentUser, ...updates })
    })
    
    const UserInfo = observer(() => {
      const user = store.get('user')
      return (
        <div data-testid="user-info">
          {user.name} ({user.age} years old)
        </div>
      )
    })
    
    const UserControls = observer(() => (
      <div>
        <button data-testid="age-up" onClick={() => {
          const user = store.get('user')
          updateUser({ age: user.age + 1 })
        }}>
          Age +1
        </button>
        <button data-testid="rename" onClick={() => updateUser({ name: 'Jane' })}>
          Rename to Jane
        </button>
      </div>
    ))
    
    const App = () => (
      <div>
        <UserInfo />
        <UserControls />
      </div>
    )
    
    render(<App />)
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('John (25 years old)')
    
    fireEvent.click(screen.getByTestId('age-up'))
    expect(screen.getByTestId('user-info')).toHaveTextContent('John (26 years old)')
    
    fireEvent.click(screen.getByTestId('rename'))
    expect(screen.getByTestId('user-info')).toHaveTextContent('Jane (26 years old)')
  })
}) 