import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tsconfigPaths from 'vite-tsconfig-paths'

export const port = 3008;

export default defineConfig({
  plugins: [solid(), tsconfigPaths()],
  server: {
    port
  }
})
