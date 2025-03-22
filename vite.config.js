import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/rss-epi/',  // 确保这里填写的是你的仓库名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}) 