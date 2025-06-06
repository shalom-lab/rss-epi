<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- 头部区域 -->
      <div class="mb-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-col gap-6">
          <!-- 标题和 GitHub 链接 -->
          <div class="flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-800">RSS阅读器</h2>
            <a href="https://github.com/shalom-lab/rss-epi/" target="_blank" rel="noopener noreferrer"
              class="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              title="View on GitHub">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
          </div>

          <!-- 分类按钮组 -->
          <div class="flex flex-wrap gap-2">
            <!-- 全部按钮 -->
            <button @click="selectedCategory = ''" :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              !selectedCategory
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
              全部
              <span class="ml-2 text-xs">
              </span>
            </button>
            <!-- 分类按钮 -->
            <button v-for="(category,index) in categories" :key="index" @click="selectedCategory = category" :class="[
              'category-btn',
              selectedCategory === category ?
                `bg-${getCategoryColor(category, allCategories)}-500 text-white`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
              {{ category }}
              <span class="ml-2 text-xs">
                ({{ getCategoryCount(category) }})
              </span>
            </button>

            <!-- 搜索和分类区域 -->
            <div class="space-y-4 gap-4">
              <!-- 搜索框 -->
              <div class="relative">
                <input type="text" v-model="searchQuery" placeholder="搜索文章..."
                  class="w-full px-4 py-2 pl-10 border rounded-lg hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article v-for="(article, index) in filteredArticles" :key="index"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group flex flex-col">
          <!-- 文章主体内容 -->
          <div class="p-6 flex-1 flex flex-col">
            <!-- 分类和日期 -->
            <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <span :class="[
                'category-tag'
              ]">
                {{ article.category }}
              </span>
              <span>{{ formatDate(article.pubDate) }}</span>
            </div>

            <!-- 标题 -->
            <h2 class="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
              <a :href="article.link" target="_blank" class="hover:text-blue-700">
                {{ article.title }}
              </a>
            </h2>

            <!-- 来源 -->
            <div class="text-gray-600 text-sm mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{{ article.author || article.source }}</span>
            </div>

            <!-- 描述 -->
            <p class="text-gray-600 line-clamp-3 mb-4 flex-1">
              {{ article.description }}
            </p>
          </div>

          <!-- 阅读全文按钮 -->
          <div class="px-6 py-4 bg-gray-50 border-t mt-auto">
            <a :href="article.link" target="_blank"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              阅读全文
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </article>
      </div>

      <!-- 无结果提示 -->
      <div v-if="filteredArticles.length === 0" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
        </svg>
        <p class="text-gray-500 text-lg">没有找到相关文章</p>
        <button @click="resetFilters" class="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
          清除筛选
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import articles from '../data/articles.json'

// 获取唯一的分类
const getCategories = (sources) => {
  const uniqueCategories = new Set(sources.map(source => source.category));
  return Array.from(uniqueCategories)
};

const articlesList = ref(articles)
const searchQuery = ref('')
const selectedCategory = ref('')

const categories = getCategories(articles)

const allCategories = categories

const getCategoryCount = (category) => {
  return articlesList.value.filter(article => article.category === category).length
}

const filteredArticles = computed(() => {
  return articlesList.value.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || article.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 为分类分配颜色
const getCategoryColor = (category, allCategories) => {
  // 定义8种基础颜色
  const colors = [
    'blue',    // 蓝色
    'green',   // 绿色
    'red',     // 红色
    'yellow',  // 黄色
    'purple',  // 紫色
    'orange',  // 橙色
    'teal',    // 青色
    'indigo'   // 靛蓝
  ];

  // 获取分类的索引
  const categoryIndex = allCategories.indexOf(category);

  // 使用模运算确保颜色循环使用
  const colorIndex = categoryIndex % colors.length;

  // 返回对应的颜色加上-500后缀（使用中等亮度的色调）
  return `${colors[colorIndex]}`;
};

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
}

</script>

<style>
:root {
  /* 基础颜色系统 */
  --color-blue-300: #93c5fd;
  --color-blue-400: #60a5fa;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;

  --color-green-300: #86efac;
  --color-green-400: #4ade80;
  --color-green-500: #22c55e;
  --color-green-600: #16a34a;


  --color-red-300: #fca5a5;
  --color-red-400: #f87171;
  --color-red-500: #ef4444;
  --color-red-600: #dc2626;


  --color-yellow-300: #fde047;
  --color-yellow-400: #facc15;
  --color-yellow-500: #eab308;
  --color-yellow-600: #ca8a04;


  --color-purple-300: #d8b4fe;
  --color-purple-400: #c084fc;
  --color-purple-500: #a855f7;
  --color-purple-600: #9333ea;

  --color-orange-300: #fdba74;
  --color-orange-400: #fb923c;
  --color-orange-500: #f97316;
  --color-orange-600: #ea580c;


  --color-teal-300: #5eead4;
  --color-teal-400: #2dd4bf;
  --color-teal-500: #14b8a6;
  --color-teal-600: #0d9488;

  --color-indigo-300: #a5b4fc;
  --color-indigo-400: #818cf8;
  --color-indigo-500: #6366f1;
  --color-indigo-600: #4f46e5;

  /* 中性色 */
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
}

.bg-indigo-500 {
  background-color: var(--color-indigo-500);
}

.bg-indigo-600 {
  background-color: var(--color-indigo-600);
}

.bg-blue-500 {
  background-color: var(--color-blue-500);
}

.bg-blue-600 {
  background-color: var(--color-blue-600);
}

.bg-green-500 {
  background-color: var(--color-green-500);
}

.bg-green-600 {
  background-color: var(--color-green-600);
}

.bg-red-500 {
  background-color: var(--color-red-500);
}

.bg-red-600 {
  background-color: var(--color-red-600);
}

.bg-yellow-500 {
  background-color: var(--color-yellow-500);
}

.bg-yellow-600 {
  background-color: var(--color-yellow-600);
}

.bg-purple-500 {
  background-color: var(--color-purple-500);
}

.bg-purple-600 {
  background-color: var(--color-purple-600);
}

.bg-orange-500 {
  background-color: var(--color-orange-500);
}

.bg-orange-600 {
  background-color: var(--color-orange-600);
}

.bg-teal-500 {
  background-color: var(--color-teal-500);
}

.bg-teal-600 {
  background-color: var(--color-teal-600);
}

/* 分类按钮基础样式 */
.category-btn {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}


/* 原有的过渡动画 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>