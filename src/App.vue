<template>
    <div id="app" class="app-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <!-- 可选添加一个简化的toggle区域，类似一条细线 -->
            <div class="sidebar-toggle"></div>
            <el-menu class="nav-menu" :collapse="false">
                <div class="menu-header">
                    <h3>Menu</h3>
                </div>
                <el-menu-item index="1" @click="goToHome">
                    <el-icon><Document /></el-icon>
                    <span>Text Analysis</span>
                </el-menu-item>
                <el-menu-item index="2" @click="goToBook">
                    <el-icon><IconMenu /></el-icon>
                    <span>Books</span>
                </el-menu-item>
                <el-menu-item index="3">
                    <el-icon><Setting /></el-icon>
                    <span>Settings</span>
                </el-menu-item>
            </el-menu>
        </div>

        <!-- Main Content -->
        <div class="main-view">
            <RouterView />
        </div>
    </div>
</template>

<script setup>
import { onMounted } from "vue";
import { Document, Menu as IconMenu, Setting } from "@element-plus/icons-vue";
import router from "./router/router.js";

onMounted(() => {
    console.log("App component mounted");
});

const goToHome = () => {
    console.log("Navigating to home");
    router.push("/");
};

const goToBook = () => {
    console.log("Navigating to book");
    router.push("/book");
};
</script>

<style scoped>
.app-container {
    --menu-width: 180px; /* 菜单展开时的宽度 */
    --trigger-width: 4px; /* 折叠时的触发区域非常窄，让用户靠近左侧才触发 */
    --primary-color: #409eff;
    --border-color: #e4e7ed;
    --bg-color: #f5f7fa;
    --text-primary: #303133;
    --text-secondary: #606266;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --transition-speed: 0.25s;

    width: 100%;
    height: 100vh;
    background-color: var(--bg-color);
    position: relative;
    margin: 0;
}

/* Sidebar */
.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 2000;
    width: var(--trigger-width); /* 初始仅为4px的细条 */
    background-color: rgba(255, 255, 255, 0.5);
    display: flex;
    flex-direction: row;
    align-items: stretch;
    transition: width var(--transition-speed) ease;
    /* 可选添加毛玻璃效果，让主内容在菜单显示时依然微透可见 */
    backdrop-filter: blur(8px);
}

/* 鼠标接近左侧4px时才展开菜单 */
.sidebar:hover {
    width: var(--menu-width);
}

.sidebar-toggle {
    width: var(--trigger-width);
    height: 100%;
    position: relative;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.03);
    transition: background-color var(--transition-speed) ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sidebar-toggle::after {
    content: "";
    width: 2px;
    height: 24px;
    background-color: var(--primary-color);
    border-radius: 1px;
    opacity: 0.5;
    transition: opacity var(--transition-speed) ease;
}

.sidebar-toggle:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-toggle:hover::after {
    opacity: 1;
}

.nav-menu {
    height: 100%;
    border: none;
    background: #fff;
    box-shadow: var(--shadow-sm);
    transform: translateX(
        calc(-1 * (var(--menu-width) - var(--trigger-width)))
    );
    transition: transform var(--transition-speed) ease;
}

.sidebar:hover .nav-menu {
    transform: translateX(0);
}

.menu-header {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--border-color);
}

.menu-header h3 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary);
    font-weight: 500;
}

/* Menu Items */
.nav-menu >>> .el-menu-item {
    height: 40px;
    line-height: 40px;
    padding: 0 16px !important;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    transition:
        background-color var(--transition-speed) ease,
        color var(--transition-speed) ease;
}

.nav-menu >>> .el-menu-item.is-active {
    background-color: var(--primary-color);
    color: #fff;
}

.nav-menu >>> .el-menu-item:not(.is-active):hover {
    background-color: var(--bg-color);
    color: var(--text-primary);
}

/* 主内容区：占满剩余空间 */
.main-view {
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .app-container {
        --menu-width: 160px;
        --trigger-width: 4px; /* 在小屏幕下仍保持很窄的触发区域 */
    }

    .menu-header {
        height: 40px;
        padding: 0 12px;
    }

    .menu-header h3 {
        font-size: 14px;
    }

    .nav-menu >>> .el-menu-item {
        height: 36px;
        line-height: 36px;
        padding: 0 12px !important;
        font-size: 13px;
    }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
    .app-container {
        --bg-color: #141414;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
        --border-color: #333333;
    }

    .nav-menu {
        background: #1f1f1f;
    }

    .sidebar-toggle {
        background-color: rgba(255, 255, 255, 0.03);
    }

    .sidebar-toggle:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .nav-menu >>> .el-menu-item:not(.is-active):hover {
        background-color: #2a2a2a;
    }
}
</style>
