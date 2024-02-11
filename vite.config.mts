import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export const port=3088;

export default defineConfig({
    plugins: [solid()],
    base: process.env.NODE_ENV === 'production' ? '/pingpong/': '/',
    server: {
        port,
        proxy: {
                '/pingpong/api/': {
                    target: `http://localhost:${port}`,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/video-strong\/api/, '/api/'),
                }
            }
      }
})
