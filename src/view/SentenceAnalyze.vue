<script setup lang="ts">
import { ref, onMounted } from "vue";
import WordTag from "../component/WordTag.vue";
import MarkdownViewer from "../component/MarkDownViewer.vue";
import SentenceInput from "../component/SentenceInput.vue";
import { sentenceService } from "../service/sentence.js";
import router from "../router/router.js";
import { SaveSentenceDTO, ResultWithData, WordVO } from "@/types/api.ts";
const isHovered = ref(false);
const sentence = ref<string>("");
const currentSentence = ref<SaveSentenceDTO>();
const sentenceHistory = ref<SaveSentenceDTO[]>([]);
const selectedText = ref<string>("");
const explanation = ref<string>("");
const words = ref<WordVO[]>([]);
const isTranslating = ref(false);
const isExplain = ref(false);

const handleMouseEnter = () => {
    isHovered.value = true;
};

const handleMouseLeave = () => {
    isHovered.value = false;
};
// for API call by http requet
const handleTranslate = async (word: string) => {
    if (!word || isTranslating.value) return;

    isTranslating.value = true;
    try {
        const res = await window.electronAPI.explainWordInSentence(
            sentence.value,
            word,
        );
        words.value = [...words.value, res];
    } finally {
        isTranslating.value = false;
    }
};

// 解释单词
const handleTranslateByButton = async (word: string) => {
    if (!word || isTranslating.value) return;

    isTranslating.value = true;
    try {
        const res = await sentenceService.explainWordInSentence(
            sentence.value,
            word,
        );
        console.log("res:", res);
        words.value = [...words.value, res];
        console.log("words:", words.value);
    } finally {
        isTranslating.value = false;
    }
};
// 解释句子
const handleExplain = async () => {
    if (!sentence.value) return;
    isExplain.value = true;
    try {
        const res = await sentenceService.explain(sentence.value);
        explanation.value = res;
    } catch (e) {
        console.error(e);
    } finally {
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

const goToHome = () => {
    console.log("trigger");
    router.push("/");
};
const goToBook = () => {
    router.push("/book");
};

// 保存句子
const saveSentence = async () => {
    const saveSentenceDto: SaveSentenceDTO = {
        sentence: sentence.value,
        explanation: explanation.value,
    };
    const resultData: ResultWithData<SaveSentenceDTO> =
        await sentenceService.saveSentence(saveSentenceDto);
    console.log("resultData:", resultData);
    const result = resultData.content;
    const jsonReuslt: SaveSentenceDTO = JSON.parse(result);
    console.log("jsonReuslt:", jsonReuslt);
    currentSentence.value = jsonReuslt;
    sentenceHistory.value = [...sentenceHistory.value, currentSentence.value];
    console.log("saveSentence:", sentence);
};

// 保存单词中的句子
const saveWordInSentence = async (word: WordVO, contextType: string) => {
    let sentenceId: number;
    console.log(contextType);
    console.log(currentSentence.value);
    if (
        contextType == "1" &&
        currentSentence.value &&
        currentSentence.value.sentenceId
    ) {
        sentenceId = currentSentence.value.sentenceId;
    }
    sentenceService.saveWordInSentence(sentenceId, word);
    console.log("saveWordInSentence:", word);
};

onMounted(() => {
    window.electronAPI.onTriggerFunction((params) => {
        console.log("Received params:", params);
        sentence.value = params.sentence;
        handleExplain();
    });
});
</script>

<template>
    <div class="page-container">
        <div class="main-content">
            <!-- 输入区域 -->
            <SentenceInput
                v-model="sentence"
                :rows="3"
                placeholder="请输入或粘贴文本..."
                @translate="handleTranslateByButton"
                @explain="handleExplain"
                @clear="handleClear"
                @save="saveSentence"
                :isExplain="isExplain"
                :isTranslating="isTranslating"
                v-model:selectedText="selectedText"
            />

            <!-- 解释内容区域 -->
            <div class="analysis-container">
                <div class="analysis-area">
                    <div class="content-section left-section">
                        <template v-if="explanation">
                            <div class="content-panel explanation-section">
                                <MarkdownViewer
                                    :content="explanation"
                                    :showToolbar="false"
                                    @word-dbclick="handleSelectWord"
                                    @word-select="handleSelectWord"
                                />
                            </div>
                        </template>
                        <div v-if="!explanation" class="empty-state">
                            暂无解释
                        </div>
                    </div>

                    <div class="content-section right-section">
                        <template v-if="words.length > 0">
                            <div class="content-panel words-section">
                                <WordTag
                                    @saveWordInSentence="saveWordInSentence"
                                    :words="words"
                                />
                            </div>
                        </template>
                        <div v-else class="empty-state">暂无词汇内容</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-container {
    --primary-color: #409eff;
    --bg-color: #fafafa;
    --panel-bg: #ffffff;
    --border-color: #e4e7ed;
    --text-primary: #303133;
    --text-secondary: #606266;
    --text-tertiary: #909399;
    --empty-bg: #f8f9fa;
    --spacing-base: 12px;
    --border-radius: 8px;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 2px 6px rgba(0, 0, 0, 0.08);
    --transition-base: all 0.3s ease;

    /* 移除max-width、max-height和overflow限制，让布局更灵活 */
    /* height: 100vh; */
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-background);
    box-sizing: border-box;
    /* 允许页面必要时滚动显示完整内容 */
    overflow: auto;
}

.main-content {
    display: flex;
    flex-direction: column;
    flex: 1; /* 主内容区可弹性伸展 */
    /* padding: var(--spacing-base); */
    box-sizing: border-box;
    overflow: hidden;
    padding: 0px;
}

:deep(.sentence-input-container) {
    /* 保持输入区域紧凑，但不要固定死最大高度，让其根据内容或行数变化 */
    min-height: 120px;
    max-height: 180px;
    overflow: auto;
}

.analysis-container {
    flex: 1;
    display: flex;
    flex-direction: row;
    /* 使用flex:1并保持min-height:0以确保在小窗口时可正确滚动 */
    min-height: 0;
}

.analysis-area {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-base);
    flex: 1;
    min-height: 0;
    /* 允许在内容过多时水平或垂直滚动 */
    overflow: auto;
    box-sizing: border-box;
}

.content-section {
    display: flex;

    flex-direction: column;
    transition: var(--transition-base);
    flex: 1;
    min-width: 0;

    /* 使用min-width:0确保flex子项在有滚动需求时正确缩小 */
}

.left-section {
    flex: 2;
    min-width: 0;
    background-color: var(--color-background);
}

.right-section {
    /* width: 260px; */
    flex-shrink: 0;
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    background-color: var(--color-background);
}

.content-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: calc(var(--spacing-base) * 0.75);
    overflow: auto; /* 若内容过多则滚动 */
    background: var(--panel-bg);
    box-sizing: border-box;
}

.explanation-section,
.words-section {
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1.5;
    /* 滚动条优化可保留，也可进一步定制 */
    scrollbar-width: thin;
    scrollbar-color: var(--text-tertiary) transparent;
    /* 在需要时可增加padding */
    padding-bottom: var(--spacing-base);
    margin: calc(var(--spacing-base) / 2);
    border: 1px dashed var(--border-color);
    border-radius: calc(var(--border-radius) - 2px);
}

.empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    font-size: 13px;
    border: 1px dashed var(--border-color);
    background-color: var(--color-background);
    border-radius: calc(var(--border-radius) - 2px);
    margin: calc(var(--spacing-base) / 2);
    padding: calc(var(--spacing-base) * 0.75);
}

@media screen and (max-width: 800px) {
    .main-content {
    }

    .analysis-area {
        flex-direction: row;
    }

    .right-section {
        width: 100%;
        /* height: 200px; */
    }
}

@media (prefers-color-scheme: dark) {
    .page-container {
        --bg-color: #141414;
        --panel-bg: #1f1f1f;
        --border-color: #333333;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
        --text-tertiary: #999999;
        --empty-bg: #1a1a1a;
    }
}
</style>
