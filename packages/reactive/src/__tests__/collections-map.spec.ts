import { vi } from 'vitest'
import { observable, autorun, raw } from '..'

describe('Map', () => {
  test('should be a proper JS Map', () => {
    const map = observable(new Map())
    expect(map).toBeInstanceOf(Map)
    expect(raw(map)).toBeInstanceOf(Map)
  })

  test('should autorun mutations', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(map.get('key')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    map.set('key', 'value')
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith('value')
    map.set('key', 'value2')
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith('value2')
    map.delete('key')
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(undefined)
  })

  test('should autorun size mutations', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(map.size))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    map.set('key1', 'value')
    map.set('key2', 'value2')
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(2)
    map.delete('key1')
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(1)
    map.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun for of iteration', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => {
      let sum = 0
      // eslint-disable-next-line no-unused-vars
      for (let [, num] of map) {
        sum += num
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    map.set('key0', 3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    map.set('key1', 2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    map.delete('key0')
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    map.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun forEach iteration', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => {
      let sum = 0
      map.forEach((num) => (sum += num))
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    map.set('key0', 3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    map.set('key1', 2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    map.delete('key0')
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    map.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun keys iteration', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => {
      let sum = 0
      for (let key of map.keys()) {
        sum += key
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    map.set(3, 3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    map.set(2, 2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    map.delete(3)
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    map.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun values iteration', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => {
      let sum = 0
      for (let num of map.values()) {
        sum += num
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    map.set('key0', 3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    map.set('key1', 2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    map.delete('key0')
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    map.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should autorun entries iteration', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => {
      let sum = 0
      // eslint-disable-next-line no-unused-vars
      for (let [, num] of map.entries()) {
        sum += num
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    map.set('key0', 3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    map.set('key1', 2)
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(5)
    map.delete('key0')
    expect(handler).toHaveBeenCalledTimes(4)
    expect(handler).toHaveBeenLastCalledWith(2)
    map.clear()
    expect(handler).toHaveBeenCalledTimes(5)
    expect(handler).toHaveBeenLastCalledWith(0)
  })

  test('should be triggered by clearing', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(map.get('key')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    map.set('key', 3)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(3)
    map.clear()
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(undefined)
  })

  test('should not autorun custom property mutations', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(map['customProp']))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    map['customProp'] = 'Hello World'
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not autorun non value changing mutations', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(map.get('key')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    map.set('key', 'value')
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith('value')
    map.set('key', 'value')
    expect(handler).toHaveBeenCalledTimes(2)
    map.delete('key')
    expect(handler).toHaveBeenCalledTimes(3)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    map.delete('key')
    expect(handler).toHaveBeenCalledTimes(3)
    map.clear()
    expect(handler).toHaveBeenCalledTimes(3)
  })

  test('should not autorun raw data', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(raw(map).get('key')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    map.set('key', 'Hello')
    expect(handler).toHaveBeenCalledTimes(1)
    map.delete('key')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not autorun raw iterations', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => {
      let sum = 0
      // eslint-disable-next-line no-unused-vars
      for (let [, num] of raw(map).entries()) {
        sum += num
      }
      for (let key of raw(map).keys()) {
        sum += raw(map).get(key)
      }
      for (let num of raw(map).values()) {
        sum += num
      }
      raw(map).forEach((num) => {
        sum += num
      })
      // eslint-disable-next-line no-unused-vars
      for (let [, num] of raw(map)) {
        sum += num
      }
      handler(sum)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    map.set('key1', 2)
    map.set('key2', 3)
    expect(handler).toHaveBeenCalledTimes(1)
    map.delete('key1')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not be triggered by raw mutations', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(map.get('key')))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)
    raw(map).set('key', 'Hello')
    expect(handler).toHaveBeenCalledTimes(1)
    raw(map).delete('key')
    expect(handler).toHaveBeenCalledTimes(1)
    raw(map).clear()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not autorun raw size mutations', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(raw(map).size))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    map.set('key', 'value')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should not be triggered by raw size mutations', () => {
    const handler = vi.fn()
    const map = observable(new Map())
    autorun(() => handler(map.size))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(0)
    raw(map).set('key', 'value')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('should support objects as key', () => {
    const handler = vi.fn()
    const key = {}
    const map = observable(new Map())
    autorun(() => handler(map.get(key)))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenLastCalledWith(undefined)

    map.set(key, 1)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(1)

    map.set({}, 2)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenLastCalledWith(1)
  })

  test('observer object', () => {
    const handler = vi.fn()
    const map = observable(new Map<string, Record<string, any>>([]))
    map.set('key', {})
    map.set('key2', observable({}))
    autorun(() => {
      const [obs1, obs2] = [...map.values()]

      handler(obs1.aa, obs2.aa)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    const obs1 = map.get('key')
    const obs2 = map.get('key2')
    obs1.aa = '123'
    obs2.aa = '234'
    expect(handler).toHaveBeenCalledTimes(3)
  })

  test('shallow', () => {
    const handler = vi.fn()
    const map = observable.shallow(new Map<string, Record<string, any>>([]))
    map.set('key', {})
    autorun(() => {
      const [obs] = [...map.values()]

      handler(obs.aa)
    })

    expect(handler).toHaveBeenCalledTimes(1)
    const obs = map.get('key')
    obs.aa = '123'
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
