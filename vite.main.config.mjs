import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    ssr: true, // 必须启用 SSR
    outDir: ".vite/build/main", // 主进程文件的输出目录
    rollupOptions: {
      input: path.resolve(__dirname, "src/main.js"), // 主进程入口
      external: ["electron", "express", "body-parser"], // 避免将 Electron 模块打包进主进程
    },
    optimizeDeps: {
      exclude: ["express", "body-parser"], // 防止被预编译
    },
  },
});
