import { vi } from 'vitest'
import { observable, autorun, raw } from '..'

describe('Set', () => {
  test('should be a proper JS Set', () => {
    const set = observable(new Set())
    expect(set).toBeInstanceOf(Set)
    expect(raw(set)).toBeInstanceOf(Set)
  })

  test('should autorun mutations', () => {
    const handler = vi.fn()
    const set = observable(new Set())
    autorun(() => handler(set.has('value')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(false)
    set.add('value')
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(true)
    set.delete('value')
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(false)
  })

  test('should autorun size mutations', () => {
    const handler = vi.fn()
    const set = observable(new Set())
    autorun(() => handler(set.size))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    set.add('value')
    set.add('value2')
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(2)
    set.delete('value')
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(1)
    set.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun for of iteration', () => {
    const handler = vi.fn()
    const set = observable(new Set<number>())
    autorun(() => {
      let sum = 0
      // eslint-disable-next-line no-unused-vars
      for (let num of set) {
        sum += num
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    set.add(3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    set.add(2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    set.delete(3)
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    set.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun forEach iteration', () => {
    const handler = vi.fn()
    const set = observable(new Set<number>())
    autorun(() => {
      let sum = 0
      set.forEach((num) => (sum += num))
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    set.add(3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    set.add(2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    set.delete(3)
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    set.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun keys iteration', () => {
    const handler = vi.fn()
    const set = observable(new Set<number>())
    autorun(() => {
      let sum = 0
      for (let key of set.keys()) {
        sum += key
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    set.add(3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    set.add(2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    set.delete(3)
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    set.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun values iteration', () => {
    const handler = vi.fn()
    const set = observable(new Set<number>())
    autorun(() => {
      let sum = 0
      for (let num of set.values()) {
        sum += num
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    set.add(3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    set.add(2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    set.delete(3)
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    set.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun entries iteration', () => {
    const handler = vi.fn()
    const set = observable(new Set<number>())
    autorun(() => {
      let sum = 0
      // eslint-disable-next-line no-unused-vars
      for (let [, num] of set.entries()) {
        sum += num
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    set.add(3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    set.add(2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    set.delete(3)
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    set.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should not autorun custom property mutations', () => {
    const handler = vi.fn()
    const set = observable(new Set())
    autorun(() => handler(set['customProp']))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    set['customProp'] = 'Hello World'
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not autorun non value changing mutations', () => {
    const handler = vi.fn()
    const set = observable(new Set())
    autorun(() => handler(set.has('value')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(false)
    set.add('value')
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(true)
    set.add('value')
    expect(handler).toHaveBeenCalledTimes(2)
    set.delete('value')
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(false)
    set.delete('value')
    expect(handler).toHaveBeenCalledTimes(3)
    set.clear()
    expect(handler).toHaveBeenCalledTimes(3)
  })

  test('should not autorun raw data', () => {
    const handler = vi.fn()
    const set = observable(new Set())
    autorun(() => handler(raw(set).has('value')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(false)
    set.add('value')
    expect(handler).toHaveBeenCalledTimes(1)
    set.delete('value')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not autorun raw iterations', () => {
    const handler = vi.fn()
    const set = observable(new Set<number>())
    autorun(() => {
      let sum = 0
      // eslint-disable-next-line no-unused-vars
      for (let [, num] of raw(set).entries()) {
        sum += num
      }
      for (let key of raw(set).keys()) {
        sum += key
      }
      for (let num of raw(set).values()) {
        sum += num
      }
      raw(set).forEach((num) => {
        sum += num
      })
      // eslint-disable-next-line no-unused-vars
      for (let num of raw(set)) {
        sum += num
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    set.add(2)
    set.add(3)
    expect(handler).toHaveBeenCalledTimes(1)
    set.delete(2)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not be triggered by raw mutations', () => {
    const handler = vi.fn()
    const set = observable(new Set())
    autorun(() => handler(set.has('value')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(false)
    raw(set).add('value')
    expect(handler).toHaveBeenCalledTimes(1)
    raw(set).delete('value')
    expect(handler).toHaveBeenCalledTimes(1)
    raw(set).clear()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not autorun raw size mutations', () => {
    const handler = vi.fn()
    const set = observable(new Set())
    autorun(() => handler(raw(set).size))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    set.add('value')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not be triggered by raw size mutations', () => {
    const handler = vi.fn()
    const set = observable(new Set())
    autorun(() => handler(set.size))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    raw(set).add('value')
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
