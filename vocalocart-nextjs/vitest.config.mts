import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // NextAuth imports Next's extensionless entry points, resolved by Next's
    // bundler in production. Let Vitest resolve them the same way in tests.
    server: { deps: { inline: ['next-auth'] } },
  },
})
