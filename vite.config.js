import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/rss-reader/',  // 确保这里填写的是你的仓库名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // 添加 Tailwind 安全列表
    safelist: [
      // 背景色
      'bg-blue-500', 'bg-blue-600',
      'bg-green-500', 'bg-green-600',
      'bg-purple-500', 'bg-purple-600',
      'bg-red-500', 'bg-red-600',
      'bg-yellow-500', 'bg-yellow-600',
      'bg-indigo-500', 'bg-indigo-600',
      'bg-pink-500', 'bg-pink-600',
      // 悬停状态
      'hover:bg-blue-600',
      'hover:bg-green-600',
      'hover:bg-purple-600',
      'hover:bg-red-600',
      'hover:bg-yellow-600',
      'hover:bg-indigo-600',
      'hover:bg-pink-600',
    ]
  }
}) 