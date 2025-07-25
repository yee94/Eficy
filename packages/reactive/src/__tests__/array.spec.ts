import { vi } from 'vitest'
import { toArray, ArraySet } from '../array'

test('toArray', () => {
  expect(toArray([])).toEqual([])
  expect(toArray(null)).toEqual([])
  expect(toArray(undefined)).toEqual([])
  expect(toArray(0)).toEqual([0])
})

test('ArraySet', () => {
  const set = new ArraySet()
  set.add(11)
  set.add(11)
  set.add(22)
  expect(set.value).toEqual([11, 22])

  const handler = vi.fn()
  set.forEach(handler)
  expect(handler).toHaveBeenCalledTimes(2)
  expect(handler).toHaveBeenNthCalledWith(1, 11)
  expect(handler).toHaveBeenNthCalledWith(2, 22)
  expect(set.value).toEqual([11, 22])

  expect(set.has(11)).toBe(true)
  set.delete(11)
  expect(set.has(11)).toBe(false)
  expect(set.value).toEqual([22])

  set.clear()
  expect(set.value).toEqual([])

  const handler1 = vi.fn()
  set.add(11)
  set.add(22)
  set.batchDelete(handler1)
  expect(handler1).toHaveBeenCalledTimes(2)
  expect(handler1).toHaveBeenNthCalledWith(1, 11)
  expect(handler1).toHaveBeenNthCalledWith(2, 22)
  expect(set.value).toEqual([])
})
