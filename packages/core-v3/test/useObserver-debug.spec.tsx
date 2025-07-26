import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { useObserver } from '@eficy/reactive-react'
import { ObservableClass, observable } from '@eficy/reactive'

class TestObservableClass extends ObservableClass {
  @observable
  value = 'initial'
}

const TestComponent: React.FC<{ observableInstance: TestObservableClass }> = ({ observableInstance }) => {
  console.log('🔵 TestComponent: About to call useObserver')
  
  const result = useObserver(() => {
    console.log('🟢 Inside TestComponent useObserver view function')
    console.log('📊 Current observable value:', observableInstance.value)
    return <div data-testid="test-component">{observableInstance.value}</div>
  })
  
  console.log('🔴 TestComponent: useObserver returned:', result)
  return result
}

describe('useObserver 调试测试', () => {
  let observableInstance: TestObservableClass
  
  beforeEach(() => {
    console.log('🧪 Test starting...')
    observableInstance = new TestObservableClass()
  })
  
  afterEach(() => {
    console.log('🧹 Test cleanup...')
    cleanup()
  })

  it('should show useObserver debug logs', () => {
    console.log('🚀 Testing useObserver debug logs...')
    
    render(<TestComponent observableInstance={observableInstance} />)
    
    expect(screen.getByTestId('test-component')).toHaveTextContent('initial')
    console.log('✅ Initial render verified')
    
    console.log('🔄 Updating observable value...')
    act(() => {
      observableInstance.value = 'updated'
    })
    
    console.log('📋 DOM after update:', document.body.innerHTML)
    console.log('✅ Test completed')
  })
}) 