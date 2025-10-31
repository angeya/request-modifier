import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import {resolve} from "node:url";

// https://vite.dev/config/
export default defineConfig({
  base: './', // 👈 关键配置：使用相对路径
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: ['chrome'], // 👈 告诉 Rollup chrome是外部依赖，不要打包 chrome
      // input: {
        // popup 入口
        // popup: resolve(__dirname, './request-modifier/index.html'),
        // background 入口 ← 必须有！
        // background: resolve(__dirname, './request-modifier/src/service-worker/background.ts'),
        // content script（如果有的话）
        // content: resolve(__dirname, 'src/content.ts'),
      // },
    },
  },
})
