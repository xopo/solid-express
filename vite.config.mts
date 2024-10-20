import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export const port = 3888;

export default defineConfig({
    plugins: [solid(), tsconfigPaths()],
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
    server: {
        port,
    },
    build: {
        rollupOptions: {
            external: ["sharp"],
        },
    },
});
