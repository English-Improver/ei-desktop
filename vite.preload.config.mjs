import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    ssr: true,
    outDir: ".vite/build/preload", // 预加载脚本文件的输出目录
    rollupOptions: {
      input: path.resolve(__dirname, "src/preload.js"), // 预加载脚本入口
      external: ["electron", "express"], // 避免将 Electron 模块打包进预加载脚本
    },
  },
});
