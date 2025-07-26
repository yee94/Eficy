# Reactive System Issues Documentation

## Overview

This document outlines the reactive system issues discovered when testing the integration between `@eficy/reactive` and React components through the `observer()` wrapper.

## Test Results Summary

**From core-v3 RenderNode.reactive.spec.tsx:**
- 11 out of 12 tests failed
- 1 test passed (Performance optimization test)
- Issues span across property updates, component type changes, children updates, conditional rendering, and error handling

## Key Problems Identified

### 1. ViewNode Property Updates Not Triggering Re-renders

**Problem:** When calling `viewNode.updateField()` with `@action` methods, the UI does not update reactively.

**Expected Behavior:**
```typescript
viewNode.updateField('className', 'updated-class')
viewNode.updateField('#content', 'Updated Content')
// Should trigger observer to re-render with new props
```

**Actual Behavior:** UI remains unchanged, showing original content.

**Root Cause Analysis:**
- `useObserver` hook may not be correctly collecting dependencies from `ObservableClass` instances
- `@action` decorators may not be properly triggering signals
- There might be a mismatch between the reactive system and React's rendering cycle

### 2. Component Type Changes Not Working

**Problem:** Changing the `#view` property (which determines the HTML tag/component) doesn't update the rendered element.

**Test Case:**
```typescript
viewNode.updateField('#view', 'span') // Change from 'div' to 'span'
// Should change from <div>Content</div> to <span>Content</span>
```

**Result:** Element remains as `<div>` instead of changing to `<span>`.

### 3. Infinite Rendering Loops

**Problem:** Some configurations cause "Too many re-renders" errors, indicating the observer is creating render loops.

**Error:**
```
Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

**Likely Causes:**
- Effect cleanup not working properly
- useObserver creating new effects on every render
- Circular dependencies in the reactive system

### 4. Children Updates Not Reflecting

**Problem:** Adding or removing child ViewNodes doesn't update the rendered children.

**Expected:**
```typescript
parentNode.addChild(newChildNode)
// Should render additional child component
```

**Actual:** Child components don't appear in the DOM.

### 5. Conditional Rendering Issues

**Problem:** Changes to `#if` conditions don't show/hide components as expected.

**Test Case:**
```typescript
viewNode.updateField('#if', false)
// Should hide the component
```

**Result:** Component remains visible.

## Technical Analysis

### useObserver Hook Issues

The current `useObserver` implementation has several potential problems:

1. **Effect Management:** Creating/disposing effects on every render cycle
2. **Dependency Collection:** May not be collecting dependencies from `ObservableClass` computed properties correctly
3. **Render Triggering:** Force update mechanism might conflict with React's batching

### ObservableClass Integration

1. **Action Execution:** `@action` methods may not be properly notifying the reactive system
2. **Computed Properties:** Computed getters might not be tracked correctly by the effect system
3. **Signal Propagation:** Changes to observable properties might not propagate to React components

## Recommended Investigation Areas

1. **Verify Signal Creation:** Ensure `@observable` properties create proper signals
2. **Check Effect Dependencies:** Confirm `useObserver` collects all necessary dependencies
3. **Action Batching:** Verify `@action` methods trigger proper notifications
4. **React Integration:** Ensure proper integration with React's concurrent features

## Test File Location

The failing tests have been moved to:
- `/packages/reactive-react/src/__tests__/reactive-render.test.tsx`

All failing tests are marked with `it.fails()` to document the issues without breaking the test suite.

## Next Steps

1. Debug the `useObserver` hook implementation
2. Verify `@eficy/reactive` core functionality works correctly
3. Check integration points between signals and React
4. Consider alternative approaches for React-reactive integration
5. Add comprehensive debugging/logging to understand the execution flow

## Impact

These issues prevent the core-v3 package from having functional reactive capabilities, which is a key feature for the Eficy framework. The RenderNode component cannot respond to ViewNode changes, making the system essentially static rather than reactive.