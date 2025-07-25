import { vi } from 'vitest'
import { observable, autorun, raw } from '..'

describe('WeakSet', () => {
  test('should be a proper JS WeakSet', () => {
    const weakSet = observable(new WeakSet())
    expect(weakSet).toBeInstanceOf(WeakSet)
    expect(raw(weakSet)).toBeInstanceOf(WeakSet)
  })

  test('should autorun mutations', () => {
    const handler = vi.fn()
    const value = {}
    const weakSet = observable(new WeakSet())
    autorun(() => handler(weakSet.has(value)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(false)
    weakSet.add(value)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(true)
    weakSet.delete(value)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(false)
  })

  test('should not autorun custom property mutations', () => {
    const handler = vi.fn()
    const weakSet = observable(new WeakSet())
    autorun(() => handler(weakSet['customProp']))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    weakSet['customProp'] = 'Hello World'
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not autorun non value changing mutations', () => {
    const handler = vi.fn()
    const value = {}
    const weakSet = observable(new WeakSet())
    autorun(() => handler(weakSet.has(value)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(false)
    weakSet.add(value)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(true)
    weakSet.add(value)
    expect(handler).toHaveBeenCalledTimes(2)
    weakSet.delete(value)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(false)
    weakSet.delete(value)
    expect(handler).toHaveBeenCalledTimes(3)
  })

  test('should not autorun raw data', () => {
    const handler = vi.fn()
    const value = {}
    const weakSet = observable(new WeakSet())
    autorun(() => handler(raw(weakSet).has(value)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(false)
    weakSet.add(value)
    expect(handler).toHaveBeenCalledTimes(1)
    weakSet.delete(value)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not be triggered by raw mutations', () => {
    const handler = vi.fn()
    const value = {}
    const weakSet = observable(new WeakSet())
    autorun(() => handler(weakSet.has(value)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(false)
    raw(weakSet).add(value)
    expect(handler).toHaveBeenCalledTimes(1)
    raw(weakSet).delete(value)
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
