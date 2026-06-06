import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import hotReloadExtension from 'hot-reload-extension-vite'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    hotReloadExtension({
      log: true,
      backgroundPath: 'src/service-worker/background.ts'
    })
  ],
  build: {
    rollupOptions: {
      external: ['chrome'],
      input: {
        main: 'index.html',
        help: 'help.html',
        background: 'src/service-worker/background.ts'
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
  },
})
