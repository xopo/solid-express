import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export const port=3088;

export default defineConfig({
  plugins: [solid()],
  server: {
    port
  }
})
