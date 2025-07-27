import { vi } from 'vitest'

export const createGenerator = vi.fn(() => ({
  generate: vi.fn(async (input: string) => ({
    css: `.mock-class { color: red; }\n.another-class { background: blue; }`,
    matched: new Set(['mock-class', 'another-class'])
  }))
}))