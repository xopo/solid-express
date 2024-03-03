/// <reference types="vitest" />
import { defineConfig } from 'vite';
import config from './vite.config.mts';

export default defineConfig({
  ...config,
  test: {
    environment: 'jsdom',
    globals: true,
  },
})