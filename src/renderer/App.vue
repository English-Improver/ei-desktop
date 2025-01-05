<template>
  <div id="app" class="app-container">
      <div class="drag-region"></div>
      <!-- Top Navigation Bar -->
      <nav class="top-nav">
          <div class="nav-content">
              <!-- Logo/Brand Area -->
              <div class="brand">
                  <span class="logo">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                  </span>
                  <span class="brand-name">Reader</span>
              </div>

              <!-- Menu Items -->
              <div class="nav-menu">
                  <div
                      class="nav-item"
                      :class="{ active: currentRoute === '/' }"
                      @click="goToHome"
                  >
                      <span class="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <line x1="10" y1="9" x2="8" y2="9"></line>
                          </svg>
                      </span>
                      <span class="nav-text">分析</span>
                  </div>
                  <div
                      class="nav-item"
                      :class="{ active: currentRoute === '/book' }"
                      @click="goToBook"
                  >
                      <span class="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                          </svg>
                      </span>
                      <span class="nav-text">词库</span>
                  </div>
                  <div
                      class="nav-item"
                      :class="{ active: currentRoute === '/setting' }"
                      @click="goToSetting"
                  >
                      <span class="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="12" r="3"></circle>
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                          </svg>
                      </span>
                      <span class="nav-text">设置</span>
                  </div>
              </div>
          </div>
      </nav>

      <!-- Main Content -->
      <div class="main-content">
          <RouterView />
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const currentRoute = ref(route.path);

// Watch for route changes
watch(
    () => route.path,
    (newPath) => {
        currentRoute.value = newPath;
    }
);

const goToHome = () => {
    router.push("/");
};

const goToBook = () => {
    router.push("/book");
};

const goToSetting = () => {
    router.push("/setting");
};
</script>

<style scoped>
.app-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-content);
    color: var(--text-primary);
    padding-top: 20px; /* 与标题栏高度一致 */
}

.top-nav {
    flex-shrink: 0;
    background: var(--color-bg-panel);
    border-bottom: 1px solid var(--border-color);
    padding: 0;
    height: 48px;
    display: flex;
    align-items: center;
}

.nav-content {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 16px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    margin-right: 32px;
    opacity: 0.9;
}

.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
}

.brand-name {
    letter-spacing: 0.5px;
}

.nav-menu {
    display: flex;
    height: 48px;
    gap: 4px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    margin: 6px 0;
    height: calc(100% - 12px);
    color: var(--color-text);
    opacity: 0.7;
    transition: all 0.2s ease;
    position: relative;
    cursor: pointer;
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-size: 14px;
}

.nav-item:hover {
    opacity: 0.9;
    background: var(--color-bg-secondary);
}

.nav-item.active {
    opacity: 1;
    background: var(--color-bg-secondary);
    color: var(--color-primary);
}

.nav-item.active .icon {
    color: var(--color-primary);
}

.icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    transition: all 0.2s ease;
}

.nav-text {
    font-size: 14px;
    font-weight: 500;
}

.main-content {
    flex: 1;
    overflow: hidden;
    background: var(--bg-content);
}

.drag-region {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 28px;
    -webkit-app-region: drag;
    z-index: 1000;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
