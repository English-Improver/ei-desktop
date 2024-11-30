<template>
    <div class="app-container">
        <!-- 菜单部分 -->
        <div
            class="menu-area"
            :class="{ 'menu-visible': isHovered }"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
        >
            <div class="menu-trigger"></div>
            <el-menu class="nav-menu" :collapse="false">
                <el-menu-item index="1">
                    <el-icon><document /></el-icon>
                    <span>文本分析</span>
                </el-menu-item>
                <el-menu-item index="2">
                    <el-icon><icon-menu /></el-icon>
                    <span>词汇本</span>
                </el-menu-item>
                <el-menu-item index="3">
                    <el-icon><setting /></el-icon>
                    <span>设置</span>
                </el-menu-item>
            </el-menu>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 输入区域 -->
            <SentenceInput
                v-model="sentence"
                :rows="3"
                placeholder="请输入或粘贴文本..."
                @translate="handleTranslate"
                @explain="handleExplain"
                @clear="handleClear"
                :isExplain="isExplain"
                :isTranslating="isTranslating"
                v-model:selectedText="selectedText"
            />

            <!-- 解释内容区域 -->
            <div class="analysis-container">
                <div
                    class="analysis-area"
                    v-if="explanation || words.length > 0"
                >
                    <div class="left-section">
                        <template v-if="explanation">
                            <div class="explanation-section">
                                <MarkdownViewer
                                    :content="explanation"
                                    :showToolbar="false"
                                    @word-dbclick="handleSelectWord"
                                    @word-select="handleSelectWord"
                                />
                            </div>
                        </template>
                        <div v-else class="empty-section">暂无解释内容</div>
                    </div>

                    <div class="right-section">
                        <template v-if="words.length > 0">
                            <div class="words-section">
                                <WordTag :words="words" />
                            </div>
                        </template>
                        <div v-else class="empty-section">暂无词汇内容</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Document, Menu as IconMenu, Setting } from "@element-plus/icons-vue";
import WordTag from "./component/WordTag.vue";
import MarkdownViewer from "./component/MarkDownViewer.vue";
import SentenceInput from "./component/SentenceInput.vue";
import { sentenceService } from "./service/sentence.js";
import { ipcRenderer } from "electron";

const isHovered = ref(false);
const sentence = ref("");
const selectedText = ref("");
const explanation = ref("");
const words = ref([]);
const isTranslating = ref(false);
const isExplain = ref(false);

const handleMouseEnter = () => {
    isHovered.value = true;
};

const handleMouseLeave = () => {
    isHovered.value = false;
};

const handleTranslate = async (word: string) => {
    if (!word || isTranslating.value) return;

    isTranslating.value = true;
    try {
        const res = await sentenceService.explainWordInSentence(
            sentence.value,
            word,
        );
        words.value = [...words.value, res];
    } finally {
        isTranslating.value = false;
    }
};

const handleExplain = async () => {
    if (!sentence.value) return;
    isExplain.value = true;
    try {
        const res = await sentenceService.explain(sentence.value);
        explanation.value = res;
        isExplain.value = false;
    } catch (e) {
        console.error(e);
        isExplain.value = false;
    }
};

const handleClear = () => {
    sentence.value = "";
    explanation.value = "";
    words.value = [];
};

const handleSelectWord = (word: string) => {
    selectedText.value = word;
};

// 钩子函数
onMounted(() => {
    // 使用 electronAPI 而不是直接使用 ipcRenderer
    window.electronAPI.onTriggerFunction((params) => {
        console.log("Received params:", params);
        // 调用子组件的update:modelValue

        sentence.value = params.sentence;
        handleExplain();
    });
});
</script>

<style scoped>
.app-container {
    height: 100%;
    display: flex;
    background-color: #fafafa;
    padding: 8px;
    box-sizing: border-box;
    overflow: hidden;
}

.main-content {
    flex: 1;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 4px;
}

/* 菜单样式 */
.menu-area {
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 1000;
    display: flex;
}

.menu-trigger {
    width: 20px;
    height: 100%;
    position: relative;
    cursor: pointer;
}

.menu-trigger::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; /* 充满容器 */
    background-color: rgba(0, 0, 0, 0.05);
    transition: background-color 0.3s ease;
}

.menu-trigger:hover::after {
    background-color: rgba(0, 0, 0, 0.1);
}

.nav-menu {
    width: 200px;
    height: 100%;
    border: none;
    background: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transform: translateX(-200px);
    transition: transform 0.3s ease;
    position: fixed;
    left: 0;
    top: 0;
}

.menu-visible .nav-menu {
    transform: translateX(0);
}

/* 分析容器 */
.analysis-container {
    flex: 1;
    min-height: 0;
    height: 400px;
    /* margin-top: 12px; */
    overflow: hidden;
}

.analysis-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 500px;
    gap: 8px; /* 减小顶部间距 */
    margin-top: 8px; /* 减小与输入框的间距 */
}

/* 分析结果区域 */
.analysis-area {
    display: flex;
    flex-direction: row;
    gap: 12px; /* 减小左右区域的间距 */
    height: 350px; /* 微调整体高度 */
    min-height: 0;
    overflow: hidden;
}

.left-section {
    flex: 1;
    /* min-width: 0; */
    display: flex;
    height: 350px;
    flex-direction: column;
    /* background: white; */
    /* border-radius: 6px; */
    /* box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); */
}

.right-section {
    width: 283px; /* 略微减小右侧宽度 */
    height: 350px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.explanation-section,
.words-section {
    flex: 1;
    display: flex;
    /* align-items: center; */
    /* justify-content: center; */
    color: #909399;
    font-size: 14px;
    background-color: #f8f9fa;
    border: 1px dashed #e4e7ed;
    border-radius: 6px;
    margin: 8px; /* 添加外边距使空状态更美观 */
    padding: 12px 16px; /* 统一内边距 */

    overflow-y: auto;
    overflow-x: hidden;
}

.empty-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;
    background-color: #f8f9fa;
    border: 1px dashed #e4e7ed;
    border-radius: 6px;
    margin: 8px; /* 添加外边距使空状态更美观 */
}

/* 移动端响应式布局 */
@media screen and (max-width: 768px) {
    .app-container {
        padding: 6px;
    }

    .main-content {
        margin-left: 16px;
        padding: 2px;
    }

    .analysis-container {
        gap: 6px;
        margin-top: 6px;
    }

    .analysis-area {
        flex-direction: column;
        gap: 8px;
        height: calc(100vh - 120px);
    }

    .right-section {
        width: 100%;
        height: 200px;
    }

    .explanation-section,
    .words-section {
        padding: 8px 12px;
    }

    .empty-section {
        margin: 6px;
    }
}
</style>
