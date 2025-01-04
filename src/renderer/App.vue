<template>
  <div id="app" class="app-container">
      <!-- Top Navigation Bar -->
      <nav class="top-nav">
          <div class="nav-content">
              <!-- Logo/Brand Area -->
              <div class="brand">
                  <span class="logo">📚</span>
                  <span class="brand-name">Reader</span>
              </div>

              <!-- Menu Items -->
              <div class="nav-menu">
                  <div
                      class="nav-item"
                      :class="{ active: currentRoute === '/' }"
                      @click="goToHome"
                  >
                      <span class="icon">📄</span>
                      <span>Text Analysis</span>
                  </div>
                  <div
                      class="nav-item"
                      :class="{ active: currentRoute === '/book' }"
                      @click="goToBook"
                  >
                      <span class="icon">📚</span>
                      <span>Books</span>
                  </div>
                  <div
                      class="nav-item"
                      :class="{ active: currentRoute === '/setting' }"
                      @click="goToSetting"
                  >
                      <span class="icon">⚙️</span>
                      <span>Settings</span>
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

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import router from "./router/router";

const route = useRoute();
const currentRoute = ref(route.path);

// Watch for route changes
watch(
  () => route.path,
  (newPath) => {
      currentRoute.value = newPath;
  },
);

const goToHome = () => {
  router.push("/");
};

const goToBook = () => {
  router.push("/book");
};

const goToSetting = () => {
  router.push('/setting');
};
</script>

<style scoped>
.app-container {
  --primary-color: #4a9eff;
  --border-color: #e4e7ed;
  --bg-color: #f5f7fa;
  --text-primary: #303133;
  --text-secondary: #606266;
  --nav-height: 40px;

  width: 100%;
  height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
}

/* Top Navigation Bar */
.top-nav {
  height: var(--nav-height);
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 32px;
}

/* Brand/Logo Area */
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--primary-color);
  padding-right: 32px;
  border-right: 1px solid var(--border-color);
}

.logo {
  font-size: 1.4rem;
}

/* Menu Items */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.nav-item {
  height: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.nav-item:hover {
  color: var(--primary-color);
  background-color: #eee9e1;
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-item.active::after {
  transform: scaleX(1);
}

.nav-item .icon {
  font-size: 16px;
}

/* Main Content Area */
.main-content {
  margin-top: var(--nav-height);
  margin-right: 8px;
  height: calc(100vh - var(--nav-height));
  overflow: hidden;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-content {
      padding: 0 8px;
      gap: 16px;
  }

  .brand {
      padding-right: 16px;
  }

  .brand-name {
      display: none; /* Hide brand name on mobile */
  }

  .nav-item {
      padding: 0 12px;
  }

  .nav-item .icon {
      font-size: 14px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .top-nav {
      background-color: #1f1f1f;
  }

  .nav-item:hover {
      background-color: rgba(74, 158, 255, 0.1);
  }

  .app-container {
      --bg-color: #141414;
      --text-primary: #ffffff;
      --text-secondary: #cccccc;
      --border-color: #333333;
  }
}
</style>
