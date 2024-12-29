import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./", // 确保生产模式使用相对路径
  build: {
    outDir: ".vite/build/renderer", // 渲染进程输出目录
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, "/index.html"), // 渲染进程入口
    },
  },
});
