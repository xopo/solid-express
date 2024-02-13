// vite.config.mts
import { defineConfig } from "file:///Users/dratiu/test/pingpong/node_modules/.pnpm/vite@5.0.12_sass@1.70.0/node_modules/vite/dist/node/index.js";
import solid from "file:///Users/dratiu/test/pingpong/node_modules/.pnpm/vite-plugin-solid@2.9.1_solid-js@1.8.12_vite@5.0.12/node_modules/vite-plugin-solid/dist/esm/index.mjs";
var port = 3088;
var vite_config_default = defineConfig({
  plugins: [solid()],
  base: process.env.NODE_ENV === "production" ? "/pingpong/" : "/",
  server: {
    port,
    proxy: {
      "/pingpong/api/": {
        target: `http://localhost:${port}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/video-strong\/api/, "/api/")
      }
    }
  }
});
export {
  vite_config_default as default,
  port
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2RyYXRpdS90ZXN0L3Bpbmdwb25nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZHJhdGl1L3Rlc3QvcGluZ3Bvbmcvdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9kcmF0aXUvdGVzdC9waW5ncG9uZy92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHNvbGlkIGZyb20gJ3ZpdGUtcGx1Z2luLXNvbGlkJ1xuXG5leHBvcnQgY29uc3QgcG9ydD0zMDg4O1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtzb2xpZCgpXSxcbiAgICBiYXNlOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gJy9waW5ncG9uZy8nOiAnLycsXG4gICAgc2VydmVyOiB7XG4gICAgICAgIHBvcnQsXG4gICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAgICAgJy9waW5ncG9uZy9hcGkvJzoge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gLFxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC92aWRlby1zdHJvbmdcXC9hcGkvLCAnL2FwaS8nKSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxUSxTQUFTLG9CQUFvQjtBQUNsUyxPQUFPLFdBQVc7QUFFWCxJQUFNLE9BQUs7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLE1BQU0sUUFBUSxJQUFJLGFBQWEsZUFBZSxlQUFjO0FBQUEsRUFDNUQsUUFBUTtBQUFBLElBQ0o7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNDLGtCQUFrQjtBQUFBLFFBQ2QsUUFBUSxvQkFBb0IsSUFBSTtBQUFBLFFBQ2hDLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSx3QkFBd0IsT0FBTztBQUFBLE1BQ25FO0FBQUEsSUFDSjtBQUFBLEVBQ047QUFDTixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
