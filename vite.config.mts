import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export const port = 3888;

export default defineConfig({
    plugins: [solid(), tsconfigPaths()],
    base: process.env.NODE_ENV === "production" ? "/solid-mp3" : "/",
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
    server: {
        port,
        proxy: {
            "/solid-mp3/api": {
                target: "http://localhost:3888/",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^solid-mp3\/api/, "api"),
            },
        },
    },
    build: {
        rollupOptions: {
            external: ["sharp"],
        },
    },
});