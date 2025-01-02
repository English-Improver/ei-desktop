
<template>
    <div class="page-container">
        <Notification ref="notificationRef" />
        <div class="main-content">
            <div class="content-wrapper">
                <!-- 输入区域 -->
                <SentenceInput
                    v-model="sentence"
                    :rows="7"
                    placeholder="请输入或粘贴文本..."
                    @translate="handleTranslateByButton"
                    @explain="handleExplainComman"
                    @clear="handleClear"
                    @save="saveSentence"
                    :isExplain="isExplain"
                    :isTranslating="isTranslating"
                    :isSaving="isSaving"
                    :isSaved="isSentenceSaved()"
                    v-model:selectedText="selectedText"
                />

                <!-- 解释内容区域 -->
                <div class="analysis-container">
                    <div class="analysis-area">
                        <!-- 句子解释面板 (70%) -->
                        <div class="sentence-explanation">
                            <div class="content-panel">
                                <div class="panel-content">
                                    <template v-if="explanation">
                                        <MarkdownViewer
                                            :content="explanation"
                                            :showToolbar="false"
                                            @word-dbclick="handleSelectWord"
                                            @word-select="handleSelectWord"
                                        />
                                    </template>
                                    <div v-else class="empty-state">
                                        暂无解释
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 单词解释面板 (30%) -->
                        <div class="word-explanation">
                            <div class="content-panel">
                                <div class="panel-content">
                                    <template v-if="words.length > 0">
                                        <WordTag
                                            @saveWordInSentence="saveWordInSentence"
                                            :words="words"
                                        />
                                    </template>
                                    <div v-else class="empty-state">暂无词汇内容</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 历史记录按钮 -->
            <button 
                class="history-toggle" 
                :class="{ active: showHistory }"
                @click="toggleHistory"
                :title="showHistory ? '隐藏历史记录' : '显示历史记录'"
            >
                {{ showHistory ? '隐藏历史' : '显示历史' }}
            </button>

            <!-- 历史记录面板 -->
            <div 
                class="history-panel"
                :class="{ 'history-panel--visible': showHistory }"
            >
                <HistoryTabs
                    :sentences="sentenceHistory"
                    :words="savedWords"
                    @reloadSentence="reloadHistorySentence"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import WordTag from "../components/WordTag.vue";
import MarkdownViewer from "../components/MarkDownViewer.vue";
import SentenceInput from "../components/SentenceInput.vue";
import Notification from "../components/Notification.vue";
import HistoryTabs from "../components/HistoryTabs.vue";
import { localStorageService } from "../service/localStorageService";
import router from "../router/router";
import { SaveSentenceDTO, ResultWithData, WordVO } from "@/types/api.ts";
import { sentenceService } from "../service/sentence";

const notificationRef = ref();
const sentence = ref("");
const explanation = ref("");
const words = ref<WordVO[]>([]);
const selectedText = ref("");
const isExplain = ref(false);
const isTranslating = ref(false);
const isSaving = ref(false);
const showHistory = ref(false);
const sentenceHistory = ref<SaveSentenceDTO[]>([]);
const savedWords = ref<WordVO[]>([]);

// 加载历史数据
const loadHistory = async () => {
    try {
        sentenceHistory.value = localStorageService.getSentences();
        savedWords.value = localStorageService.getWords();
    } catch (error) {
        console.error('Load history failed:', error);
        notificationRef.value?.show('加载历史记录失败', 'error');
    }
};

// 切换历史面板
function toggleHistory() {
    showHistory.value = !showHistory.value;
    if (showHistory.value) {
        loadHistory();
    }
}

// 重新加载历史句子
async function reloadHistorySentence(historySentence: SaveSentenceDTO) {
    sentence.value = historySentence.sentence;
    explanation.value = historySentence.explanation;
    words.value = historySentence.words || [];
    showHistory.value = false;
    notificationRef.value?.show('已加载历史句子', 'success');
}

// 保存句子
async function saveSentence() {
    if (!sentence.value || !explanation.value || isSaving.value) return;

    isSaving.value = true;
    try {
        const savedSentence = localStorageService.saveSentence({
            sentence: sentence.value,
            explanation: explanation.value,
        });
        notificationRef.value?.show('保存成功', 'success');
        // Reload history if panel is visible
        if (showHistory.value) {
            loadHistory();
        }
    } catch (error) {
        console.error('Save sentence failed:', error);
        notificationRef.value?.show('保存失败', 'error');
    } finally {
        isSaving.value = false;
    }
}

// 保存单词
async function saveWordInSentence(word: WordVO, contextType: string) {
    try {
        const currentSentence = localStorageService.getSentences().find(s => s.sentence === sentence.value);
        if (!currentSentence) {
            notificationRef.value?.show('请先保存句子', 'error');
            return;
        }
        
        localStorageService.saveWord(word, currentSentence.sentenceId);
        notificationRef.value?.show('单词保存成功', 'success');
        
        // 更新历史记录中的单词列表
        if (showHistory.value) {
            savedWords.value = localStorageService.getWords();
        }
    } catch (error) {
        console.error('Save word failed:', error);
        notificationRef.value?.show('保存失败', 'error');
    }
}

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
        const res = await window.electronAPI.explainWordInSentence(
            sentence.value,
            word,
        );
        words.value = [...words.value, res];
    } finally {
        isTranslating.value = false;
    }
};

// 解释句子
const handleExplain = async () => {
    if (!sentence.value) return;
    isExplain.value = true;
    try {
        const res = await window.electronAPI.explain(sentence.value);
        explanation.value = res;
    } catch (e) {
        console.error(e);
    } finally {
        isExplain.value = false;
    }
};

const handleExplainComman = async () => {
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

// 检查句子是否已保存
const isSentenceSaved = () => {
    if (!sentence.value || !explanation.value) return false;
    
    return sentenceHistory.value.some(
        (item) => 
            item.sentence === sentence.value && 
            item.explanation === explanation.value
    );
};

onMounted(() => {
    window.electronAPI.onTriggerFunction((params) => {
        console.log("Received params:", params);
        sentence.value = params.sentence;
        handleExplain();
    });
});
</script>

<style scoped>
.page-container {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-primary);
}

.main-content {
    flex: 1;
    padding: 0;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-primary);
}

.content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.analysis-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.analysis-area {
    width: 98%;
    height: 80%;
    padding: 0 12px;
    margin-right: 8px;
    display: flex;
    flex-direction: row;
    gap: var(--space-4);
    background-color: var(--color-bg-primary);
    overflow: hidden;
}

/* 句子解释面板 (70%) */
.sentence-explanation {
    flex: 7;
    height: 100%;
    overflow: hidden;
}

/* 单词解释面板 (30%) */
.word-explanation {
    flex: 3;
    height: 100%;
    overflow: hidden;
}

.content-panel {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-lg);
    background-color: var(--color-bg-panel);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel-content {
    flex: 1;
    padding: var(--space-2);
    overflow-y: hidden;
}

/* 为句子解释面板的内容添加滚动 */
.sentence-explanation .panel-content {
    overflow-y: hidden;
}

/* 为词汇解释面板的内容添加滚动 */
.word-explanation .panel-content {
    overflow-y: auto;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text-light);
}

:deep(.sentence-input-container) {
    margin-bottom: var(--space-4);
}

/* 历史记录按钮 */
.history-toggle {
    position: fixed;
    right: v-bind(showHistory ? '300px' : '0');
    top: 50%;
    transform: translateY(-50%);
    writing-mode: vertical-rl;
    padding: 12px 6px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px 0 0 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 101;
}

.history-toggle:hover {
    background: var(--primary-color-dark);
}

.history-toggle.active {
    background: var(--text-secondary);
}

/* 历史记录面板 */
.history-panel {
    position: fixed;
    top: var(--header-height);
    right: 0;
    width: 300px;
    height: calc(100vh - var(--header-height));
    background: var(--color-bg-secondary);
    border-left: 1px solid var(--color-border);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 100;
    overflow: hidden;
}

.history-panel--visible {
    transform: translateX(0);
}

/* 响应式设计 */
@media screen and (max-width: 800px) {
    .main-content {
        padding-right: 20px;
    }

    .history-panel {
        width: 100%;
    }

    .history-toggle {
        right: v-bind(showHistory ? '100%' : '0');
    }

    .analysis-area {
        flex-direction: column;
    }

    .sentence-explanation,
    .word-explanation {
        flex: none;
        width: 100%;
    }
}

@media screen and (max-width: 500px) {
    .analysis-area {
        flex-direction: column;
    }

    .sentence-explanation,
    .word-explanation {
        flex: none;
        width: 100%;
    }
}
</style>