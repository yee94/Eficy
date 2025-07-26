import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import RenderNode from '../src/components/RenderNode'
import ViewNode from '../src/models/ViewNode'
import type { IViewData } from '../src/interfaces'

describe('Debug - 日志验证', () => {
  const mockComponentMap = {
    div: 'div',
    span: 'span'
  }
  
  beforeEach(() => {
    console.log('🧪 Test starting...')
  })
  
  afterEach(() => {
    console.log('🧹 Test cleanup...')
    cleanup()
  })

  it('should show debug logs when rendering ViewNode', () => {
    console.log('🚀 Creating ViewNode...')
    
    const viewData: IViewData = {
      '#': 'test-node',
      '#view': 'div',
      '#content': 'Test Content'
    }
    
    const viewNode = new ViewNode(viewData)
    console.log('✅ ViewNode created, now rendering...')
    
    render(
      <RenderNode 
        viewNode={viewNode} 
        componentMap={mockComponentMap}
      />
    )
    
    console.log('📋 DOM content:', document.body.innerHTML)
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    console.log('✅ Test assertion passed')
  })

  it('should show debug logs when updating ViewNode', () => {
    console.log('🚀 Creating ViewNode for update test...')
    
    const viewData: IViewData = {
      '#': 'update-node',
      '#view': 'div',
      '#content': 'Initial Content'
    }
    
    const viewNode = new ViewNode(viewData)
    
    render(
      <RenderNode 
        viewNode={viewNode} 
        componentMap={mockComponentMap}
      />
    )
    
    expect(screen.getByText('Initial Content')).toBeInTheDocument()
    console.log('✅ Initial render verified')
    
    console.log('🔄 Updating ViewNode content...')
    viewNode.updateField('#content', 'Updated Content')
    console.log('✅ ViewNode update completed')
    
    // 检查DOM是否有更新
    console.log('📋 DOM after update:', document.body.innerHTML)
  })
}) 