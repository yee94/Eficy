import { vi } from 'vitest'
import { observable, autorun, raw } from '..'

describe('WeakMap', () => {
  test('should be a proper JS WeakMap', () => {
    const weakMap = observable(new WeakMap())
    expect(weakMap).toBeInstanceOf(WeakMap)
    expect(raw(weakMap)).toBeInstanceOf(WeakMap)
  })

  test('should autorun mutations', () => {
    const handler = vi.fn()
    const key = {}
    const weakMap = observable(new WeakMap())
    autorun(() => handler(weakMap.get(key)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    weakMap.set(key, 'value')
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith('value')
    weakMap.set(key, 'value2')
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith('value2')
    weakMap.delete(key)
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(undefined)
  })

  test('should not autorun custom property mutations', () => {
    const handler = vi.fn()
    const weakMap = observable(new WeakMap())
    autorun(() => handler(weakMap['customProp']))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    weakMap['customProp'] = 'Hello World'
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not autorun non value changing mutations', () => {
    const handler = vi.fn()
    const key = {}
    const weakMap = observable(new WeakMap())
    autorun(() => handler(weakMap.get(key)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    weakMap.set(key, 'value')
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith('value')
    weakMap.set(key, 'value')
    expect(handler).toHaveBeenCalledTimes(2)
    weakMap.delete(key)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    weakMap.delete(key)
    expect(handler).toHaveBeenCalledTimes(3)
  })

  test('should not autorun raw data', () => {
    const handler = vi.fn()
    const key = {}
    const weakMap = observable(new WeakMap())
    autorun(() => handler(raw(weakMap).get(key)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    weakMap.set(key, 'Hello')
    expect(handler).toHaveBeenCalledTimes(1)
    weakMap.delete(key)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not be triggered by raw mutations', () => {
    const handler = vi.fn()
    const key = {}
    const weakMap = observable(new WeakMap())
    autorun(() => handler(weakMap.get(key)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    raw(weakMap).set(key, 'Hello')
    expect(handler).toHaveBeenCalledTimes(1)
    raw(weakMap).delete(key)
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
