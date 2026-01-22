import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 👈 关键配置：使用相对路径
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: ['chrome'], // 👈 告诉 Rollup chrome是外部依赖，不要打包 chrome
    },
  },
})
