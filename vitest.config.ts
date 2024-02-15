import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
        include:['**/*.test.ts'],
        globals: true,
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        bail: 1, // stop after 2 failure 
  },
})