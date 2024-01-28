import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export const port=3008;

export default defineConfig({
  plugins: [solid()],
  server: {
    port
  }
})
