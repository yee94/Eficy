import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { signal, createAction, observable, computed, action, makeObservable } from '@eficy/reactive'
import { observer } from '../observer'

describe('Simplified reactive patterns', () => {
  it('should work with signals and observer', async () => {
    const count = signal(0)
    const name = signal('test')
    
    const increment = createAction(() => {
      count(count() + 1)
    })
    
    const Component = observer(() => (
      <div>
        <span data-testid="count">Count: {count()}</span>
        <span data-testid="name">Name: {name()}</span>
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

  it('should work with arrays using immutable updates', async () => {
    const items = signal(['apple', 'banana'])
    
    const addItem = createAction((item: string) => {
      // 新范式：重新赋值整个数组
      items([...items(), item])
    })
    
    const Component = observer(() => (
      <div data-testid="items">
        Items: {items().join(', ')}
      </div>
    ))
    
    render(<Component />)
    expect(screen.getByTestId('items')).toHaveTextContent('Items: apple, banana')
    
    act(() => {
      addItem('cherry')
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('items')).toHaveTextContent('Items: apple, banana, cherry')
    })
  })
  
  it('should work with object properties using signals', async () => {
    const userSignal = signal({ name: 'John', age: 25 })
    
    const updateUser = createAction((updates: Partial<{ name: string; age: number }>) => {
      // 新范式：重新赋值整个对象
      userSignal({ ...userSignal(), ...updates })
    })
    
    const Component = observer(() => {
      const user = userSignal()
      return (
        <div>
          <span data-testid="name">Name: {user.name}</span>
          <span data-testid="age">Age: {user.age}</span>
          <button data-testid="update" onClick={() => updateUser({ name: 'Jane' })}>
            Update Name
          </button>
        </div>
      )
    })
    
    render(<Component />)
    
    expect(screen.getByTestId('name')).toHaveTextContent('Name: John')
    expect(screen.getByTestId('age')).toHaveTextContent('Age: 25')
    
    act(() => {
      screen.getByTestId('update').click()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('Name: Jane')
    })
  })

  it('should work with decorator pattern for classes', async () => {
    class CounterStore {
      @observable
      count = 0
      
      @observable
      name = 'Counter'
      
      @computed
      get displayText() {
        return `${this.name}: ${this.count}`
      }
      
      @action
      increment() {
        this.count++
      }
      
      @action
      setName(name: string) {
        this.name = name
      }
    }
    
    const store = new CounterStore()
    makeObservable(store)
    
    const Component = observer(() => (
      <div>
        <span data-testid="display">{store.displayText}</span>
        <button data-testid="increment" onClick={() => store.increment()}>
          Increment
        </button>
        <button data-testid="rename" onClick={() => store.setName('New Counter')}>
          Rename
        </button>
      </div>
    ))
    
    render(<Component />)
    
    expect(screen.getByTestId('display')).toHaveTextContent('Counter: 0')
    
    act(() => {
      screen.getByTestId('increment').click()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('Counter: 1')
    })
    
    act(() => {
      screen.getByTestId('rename').click()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('display')).toHaveTextContent('New Counter: 1')
    })
  })

  it('should work with complex state using immutable patterns', async () => {
    interface Todo {
      id: number
      text: string
      completed: boolean
    }
    
    const todos = signal<Todo[]>([])
    
    const addTodo = createAction((text: string) => {
      const newTodo: Todo = {
        id: Date.now(),
        text,
        completed: false
      }
      // 新范式：重新赋值整个数组
      todos([...todos(), newTodo])
    })
    
    const toggleTodo = createAction((id: number) => {
      // 新范式：重新赋值整个数组
      todos(todos().map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ))
    })
    
    const Component = observer(() => (
      <div>
        <span data-testid="count">Todo count: {todos().length}</span>
        <span data-testid="completed">
          Completed: {todos().filter(t => t.completed).length}
        </span>
        <button data-testid="add" onClick={() => addTodo('Test todo')}>
          Add Todo
        </button>
        {todos().length > 0 && (
          <button 
            data-testid="toggle-first" 
            onClick={() => toggleTodo(todos()[0].id)}
          >
            Toggle First
          </button>
        )}
      </div>
    ))
    
    render(<Component />)
    
    expect(screen.getByTestId('count')).toHaveTextContent('Todo count: 0')
    expect(screen.getByTestId('completed')).toHaveTextContent('Completed: 0')
    
    act(() => {
      screen.getByTestId('add').click()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('Todo count: 1')
    })
    
    act(() => {
      screen.getByTestId('toggle-first').click()
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('completed')).toHaveTextContent('Completed: 1')
    })
  })
}) 