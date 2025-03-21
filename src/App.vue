<template>
  <div class="bg-gray-50">
    <ArticleList />

    <!-- 固定在右下角的悬浮菜单 -->
    <div class="float-menu">
      <!-- 编辑按钮 -->
      <a href="https://github.com/shalom-lab/rss-epi/edit/main/src/data/rss.json" target="_blank" class="menu-item">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </a>

      <!-- 微信公众号按钮 -->
      <div class="menu-item wechat">
        <svg class="h-5 w-5 text-green-500" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path d="M512 0a512 512 0 1 0 0 1024A512 512 0 0 0 512 0z" fill="currentColor" />
          <path
            d="M334.464 544.64s-62.336-70.208-59.776-142.208A237.632 237.632 0 0 1 507.52 192.256c38.592 0 115.84 0 211.648 113.088 5.12 6.208-308.928-78.72-384.704 239.488V544.64z"
            fill="#FFFFFF" />
          <path
            d="M533.44 355.52a271.936 271.936 0 0 1 148.992-3.648a224.192 224.192 0 0 1 139.52 270.08c-10.88 37.056-32.96 110.976-168.64 170.56-7.296 3.2 217.472-273.6-119.872-436.992z"
            fill="#FFFFFF" />
          <path
            d="M416.768 663.552a94.08 94.08 0 0 1-76.8 35.712l11.84-65.408C244.48 563.328 221.248 422.144 219.52 426.752c-50.112 139.712-18.816 233.088 0.512 266.432 67.968 117.504 245.568 150.656 358.272 79.872 60.8-38.4 92.864-144.64 92.864-144.64-108.544 47.872-191.552 52.608-254.464 35.072l0.064 0.064z"
            fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import ArticleList from './components/ArticleList.vue'
</script>

<style>
.float-menu {
  position: fixed;
  bottom: 160px;
  right: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.menu-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item+.menu-item {
  border-top: 1px solid #eee;
}

.wechat {
  position: relative;
}

.wechat::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  top: 50%;
  right: 48px;
  transform: translateY(-50%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  background: white url('https://cdn.jsdelivr.net/gh/shalom-lab/wechat/images/images.png') center/calc(100% - 16px) no-repeat;
  padding: 8px;
}

.wechat::after {
  content: '欢迎关注公众号';
  position: absolute;
  width: 200px;
  height: 20px;
  background: #fff;
  ;
  margin-bottom: 20px;
  text-align: center;
  top: calc(50% + 100px);
  /* 二维码高度的一半 */
  right: 48px;
  transform: translateY(-50%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  color: #333;
  font-size: 14px;
}

.wechat:hover::before,
.wechat:hover::after {
  opacity: 1;
  visibility: visible;
}

svg:hover {
  color: #3b82f6;
}
</style>