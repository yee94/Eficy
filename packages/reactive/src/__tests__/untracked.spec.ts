import { vi } from 'vitest'
import { untracked, observable, autorun } from '../'

test('basic untracked', () => {
  const obs = observable<any>({})
  const fn = vi.fn()
  autorun(() => {
    untracked(() => {
      fn(obs.value)
    })
  })

  expect(fn).toHaveBeenCalledTimes(1)
  obs.value = 123
  expect(fn).toHaveBeenCalledTimes(1)
})

test('no params untracked', () => {
  untracked()
})
