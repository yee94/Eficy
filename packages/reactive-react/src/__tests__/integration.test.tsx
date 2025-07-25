import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { signal, createAction, observable, action, makeObservable, ObservableClass } from '@eficy/reactive'
import { observer } from '../observer'

describe('Integration Tests', () => {
  it('should work with signals and multiple state updates', () => {
    const count = signal(0)
    const name = signal('Counter')
    
    const increment = createAction(() => {
      count(count() + 1)
    })
    
    const updateName = createAction((newName: string) => {
      name(newName)
    })
    
    const App = observer(() => (
      <div>
        <h1 data-testid="name">{name()}</h1>
        <span data-testid="count">Count: {count()}</span>
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
  
  it('should work with multiple observers sharing same signal', () => {
    const value = signal(10)
    
    const updateValue = createAction((newValue: number) => {
      value(newValue)
    })
    
    const Component1 = observer(() => (
      <div data-testid="comp1">Component 1: {value()}</div>
    ))
    
    const Component2 = observer(() => (
      <div data-testid="comp2">Component 2: {value() * 2}</div>
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
  
  it('should handle nested components with decorator pattern', () => {
    interface User {
      name: string
      age: number
    }
    
    class UserStore extends ObservableClass {
      @observable
      user: User = {
        name: 'John',
        age: 25
      }
      
      @action
      updateUser(updates: Partial<User>) {
        // 新范式：重新赋值整个对象
        this.user = { ...this.user, ...updates }
      }
      
      @action
      incrementAge() {
        this.user = { ...this.user, age: this.user.age + 1 }
      }
    }
    
    const store = new UserStore()
    
    const UserInfo = observer(() => (
      <div data-testid="user-info">
        {store.user.name} ({store.user.age} years old)
      </div>
    ))
    
    const UserControls = observer(() => (
      <div>
        <button data-testid="age-up" onClick={() => store.incrementAge()}>
          Age +1
        </button>
        <button data-testid="rename" onClick={() => store.updateUser({ name: 'Jane' })}>
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

  it('should work with complex state using signals and immutable updates', () => {
    interface Todo {
      id: number
      text: string
      completed: boolean
    }
    
    const todos = signal<Todo[]>([])
    const filter = signal<'all' | 'active' | 'completed'>('all')
    
    const addTodo = createAction((text: string) => {
      const newTodo: Todo = {
        id: Date.now(),
        text,
        completed: false
      }
      todos([...todos(), newTodo])
    })
    
    const toggleTodo = createAction((id: number) => {
      todos(todos().map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ))
    })
    
    const setFilter = createAction((newFilter: 'all' | 'active' | 'completed') => {
      filter(newFilter)
    })
    
    const TodoList = observer(() => {
      const allTodos = todos()
      const currentFilter = filter()
      
      const filteredTodos = allTodos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed
        if (currentFilter === 'completed') return todo.completed
        return true
      })
      
      return (
        <div>
          <div data-testid="stats">
            Total: {allTodos.length}, 
            Active: {allTodos.filter(t => !t.completed).length}, 
            Filter: {currentFilter}
          </div>
          <div data-testid="todos">
            {filteredTodos.map(todo => (
              <div key={todo.id} onClick={() => toggleTodo(todo.id)}>
                {todo.text} ({todo.completed ? 'done' : 'pending'})
              </div>
            ))}
          </div>
        </div>
      )
    })
    
    const App = () => (
      <div>
        <TodoList />
        <button data-testid="add-todo" onClick={() => addTodo('Test todo')}>
          Add Todo
        </button>
        <button data-testid="filter-active" onClick={() => setFilter('active')}>
          Show Active
        </button>
        <button data-testid="filter-completed" onClick={() => setFilter('completed')}>
          Show Completed
        </button>
        <button data-testid="filter-all" onClick={() => setFilter('all')}>
          Show All
        </button>
      </div>
    )
    
    render(<App />)
    
    expect(screen.getByTestId('stats')).toHaveTextContent('Total: 0, Active: 0, Filter: all')
    
    // Add a todo
    fireEvent.click(screen.getByTestId('add-todo'))
    expect(screen.getByTestId('stats')).toHaveTextContent('Total: 1, Active: 1, Filter: all')
    
    // Filter to active
    fireEvent.click(screen.getByTestId('filter-active'))
    expect(screen.getByTestId('stats')).toHaveTextContent('Total: 1, Active: 1, Filter: active')
    
    // Toggle the todo (complete it)
    const todoElement = screen.getByText('Test todo (pending)')
    fireEvent.click(todoElement)
    expect(screen.getByTestId('stats')).toHaveTextContent('Total: 1, Active: 0, Filter: active')
    
    // Filter to completed
    fireEvent.click(screen.getByTestId('filter-completed'))
    expect(screen.getByTestId('stats')).toHaveTextContent('Total: 1, Active: 0, Filter: completed')
  })
}) 