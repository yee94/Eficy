import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@unocss/core': path.resolve(__dirname, './test/__mocks__/@unocss/core.ts'),
      '@unocss/preset-uno': path.resolve(__dirname, './test/__mocks__/@unocss/preset-uno.ts')
    }
  }
})