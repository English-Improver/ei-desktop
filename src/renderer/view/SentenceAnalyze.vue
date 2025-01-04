
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
                                            :words="words"
                                            @saveWordInSentence="saveWordInSentence"
                                        />
                                    </template>
                                    <div v-else class="empty-state">暂无解释的单词</div>
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
const isLoading = ref(false);

// 初始化页面数据
const initializeData = async () => {
    try {
        // 更新历史记录
        updateHistory();
        
        // 如果有历史记录，加载最新的一条
        if (sentenceHistory.value.length > 0) {
            const latestSentence = sentenceHistory.value[0];
            await reloadHistorySentence(latestSentence);
        }

        // 加载单词历史
        const words = localStorageService.getWords();
        savedWords.value = [...words];
    } catch (error) {
        console.error('Initialize data failed:', error);
        notificationRef.value?.show('初始化数据失败', 'error');
    }
};

// 更新历史记录
const updateHistory = (newWord?: WordVO) => {
    try {
        // 更新句子历史
        const sentences = localStorageService.getSentences();
        sentenceHistory.value = [...sentences];

        // 总是更新单词历史
        const words = localStorageService.getWords();
        savedWords.value = [...words];
    } catch (error) {
        console.error('Update history failed:', error);
        notificationRef.value?.show('更新历史记录失败', 'error');
    }
};

// 更新本地存储中的句子和单词
const updateLocalStorage = async (newWord?: WordVO) => {
    try {
        // 构建当前句子对象
        const currentSentence: SaveSentenceDTO = {
            sentence: sentence.value,
            explanation: explanation.value,
            words: words.value,
            timestamp: new Date().toISOString()
        };

        // 输出更新前的单词列表
        console.log('Words before storage update:', words.value.map(w => w.word));

        // 保存到本地存储
        const savedSentence = localStorageService.saveSentence(currentSentence);
        
        // 更新历史记录
        updateHistory(newWord);

        // 输出更新后的单词列表
        console.log('Words after storage update:', words.value.map(w => w.word));

        return savedSentence;
    } catch (error) {
        console.error('Update local storage failed:', error);
        throw error;
    }
};

// 加载历史数据
const loadHistory = async () => {
    try {
        updateHistory();
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

// 保存句子
async function saveSentence() {
    if (!sentence.value || !explanation.value || isSaving.value) return;

    isSaving.value = true;
    try {
        // 先调用API保存句子
        const response = await sentenceService.saveSentence({
            sentence: sentence.value,
            explanation: explanation.value,
            words: words.value
        });

        if (response.success && response.data) {
            // 更新本地存储
            await updateLocalStorage();
            return response.data;
        }
    } catch (error) {
        console.error('Save sentence failed:', error);
        notificationRef.value?.show('保存句子失败', 'error');
    } finally {
        isSaving.value = false;
    }
}

// 解释单词
async function handleTranslateByButton(word: string) {
    if (!word) {
        notificationRef.value?.show('请选择要解释的单词', 'warning');
        return;
    }

    let translatedWord = null;

    try {
        isTranslating.value = true;
        console.log('Translating word:', word);
        console.log('Current words before translation:', words.value);

        // 1. 调用API解释单词
        try {
            const response = await sentenceService.explainWordInSentence(
                sentence.value,
                word
            );
            console.log('Translation response:', response);

            // 检查响应是否包含必要的字段
            if (response && response.word && response.meaningInSentence) {
                translatedWord = {
                    ...response,
                    saved: false,
                    saving: false,
                    contextType: '1'
                };
            } else {
                console.error('Invalid translation response:', response);
                notificationRef.value?.show('翻译响应格式错误', 'error');
                return;
            }
        } catch (apiError) {
            console.error('API call failed:', apiError);
            notificationRef.value?.show('API调用失败：' + (apiError.message || '未知错误'), 'error');
            return;
        }

        // 2. 更新单词列表
        try {
            // 检查是否已存在相同的单词
            const existingIndex = words.value.findIndex(w => w.word === translatedWord.word);
            
            if (existingIndex !== -1) {
                // 如果存在，更新现有单词
                const updatedWords = [...words.value];
                updatedWords[existingIndex] = translatedWord;
                words.value = updatedWords;
                console.log('Updated existing word:', translatedWord);
            } else {
                // 如果不存在，添加到列表开头
                words.value = [translatedWord, ...words.value];
                console.log('Added new word:', translatedWord);
            }
            
            console.log('Current words after update:', words.value);
        } catch (updateError) {
            console.error('Failed to update words list:', updateError);
            notificationRef.value?.show('更新单词列表失败', 'error');
            return;
        }

        // 3. 更新本地存储和历史记录
        try {
            await updateLocalStorage(translatedWord);
            // updateHistory 会同时更新 sentenceHistory 和 savedWords
            updateHistory(translatedWord);
            notificationRef.value?.show('单词解释成功', 'success');
        } catch (storageError) {
            console.error('Failed to update local storage:', storageError);
            notificationRef.value?.show('保存到本地存储失败', 'error');
            // 不需要return，因为单词列表已经更新了
        }
    } catch (error) {
        console.error('Unexpected error in handleTranslateByButton:', error);
        notificationRef.value?.show('处理单词时发生未知错误', 'error');
    } finally {
        isTranslating.value = false;
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

// 解释句子
async function handleExplain() {
    try {
        if (!sentence.value) {
            notificationRef.value?.show('请输入句子', 'warning');
            return;
        }

        isLoading.value = true;
        isExplain.value = true;
        console.log('Starting sentence explanation:', sentence.value);

        const response = await sentenceService.explain(sentence.value);
        console.log('Sentence explanation response:', response);

        // API直接返回解释内容
        explanation.value = response;
        words.value = [];

        // 保存到本地存储
        try {
            await updateLocalStorage();
            notificationRef.value?.show('句子解释成功并已保存', 'success');
        } catch (storageError) {
            console.error('Local storage save failed:', storageError);
            notificationRef.value?.show('句子解释成功，但本地保存失败', 'warning');
        }
    } catch (error) {
        console.error('Failed to explain sentence:', error);
        notificationRef.value?.show('解释失败', 'error');
    } finally {
        isLoading.value = false;
        isExplain.value = false;
    }
}

// 点击按钮解释句子
const handleExplainComman = () => {
    handleExplain();
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

// 重新加载历史句子
async function reloadHistorySentence(historySentence: SaveSentenceDTO) {
    sentence.value = historySentence.sentence;
    explanation.value = historySentence.explanation;
    words.value = (historySentence.words || []).map(word => ({
        ...word,
        saved: word.saved || false,
        saving: false
    }));
    showHistory.value = false;
    notificationRef.value?.show('已加载历史句子', 'success');
}

// 保存单词
const saveWordInSentence = async (word: WordVO, contextType: string) => {
    if (!word) return;

    try {
        // 调用API保存
        const res = await sentenceService.saveWordInSentence(word, contextType);
        console.log('Word saved to API:', res);

        if (res.success) {
            // 找到并更新单词的状态
            const wordIndex = words.value.findIndex(w => w.word === word.word);
            if (wordIndex !== -1) {
                const updatedWords = [...words.value];
                updatedWords[wordIndex] = {
                    ...updatedWords[wordIndex],
                    saved: true,
                    saving: false
                };
                words.value = updatedWords;
            }

            // 更新本地存储
            await updateLocalStorage();

            // 通知用户
            notificationRef.value?.show('单词保存成功', 'success');
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        console.error('Failed to save word:', error);
        // 找到并重置单词的状态
        const wordIndex = words.value.findIndex(w => w.word === word.word);
        if (wordIndex !== -1) {
            const updatedWords = [...words.value];
            updatedWords[wordIndex] = {
                ...updatedWords[wordIndex],
                saving: false,
                saved: false
            };
            words.value = updatedWords;
        }
        notificationRef.value?.show(error.message || '单词保存失败', 'error');
    }
};

onMounted(() => {
    // 初始化页面数据
    initializeData();
    
    window.electronAPI.onTriggerFunction((params) => {
        console.log("Received params:", params);
        if (params.function === 'translate') {
            handleTranslateByButton(params.text);
        } else if (params.function === 'explain') {
            // 设置句子并解释
            sentence.value = params.text;
            handleExplainComman();
        }
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
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: calc(100vh - var(--nav-height)); /* 设置主内容区域的高度 */
}

.content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 16px; /* 添加内边距 */
    max-height: 100%; /* 限制最大高度 */
}

.analysis-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    max-height: calc(100% - 50px); /* 减去其他元素的高度 */
}

.analysis-area {
    flex: 1;
    width: 98%;
    padding: 0 12px;
    margin-right: 8px;
    display: flex;
    flex-direction: row;
    gap: var(--space-4);
    background-color: var(--color-bg-primary);
    overflow: hidden;
    min-height: 0;
    max-height: 90%; /* 限制最大高度 */
}

/* 句子解释面板 (70%) */
.sentence-explanation {
    flex: 7;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    max-height: 100%; /* 限制最大高度 */
}

/* 单词解释面板 (30%) */
.word-explanation {
    flex: 3;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    max-height: 100%; /* 限制最大高度 */
    padding: 0;
}

.content-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-panel);
    border-radius: var(--radius-lg);
    overflow: hidden;
    min-height: 0;
    max-height: 100%; /* 限制最大高度 */
}

.panel-content {
    flex: 1;
    /* padding: var(--space-2); */
    overflow-y: auto;
    min-height: 0;
    max-height: 30%; /* 限制最大高度 */
}

/* 为句子解释面板的内容添加滚动 */
.sentence-explanation .panel-content {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    max-height: 100%; /* 限制最大高度 */
}

:deep(.sentence-explanation .markdown-viewer-container) {
    flex: 1;
    min-height: 0;
    max-height: 100%; /* 限制最大高度 */
}

/* 为词汇解释面板的内容添加滚动 */
.word-explanation .panel-content {
    overflow-y: auto;
    padding: 6px;
    max-height: 100%; /* 限制最大高度 */
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
    top: 0;
    right: -300px;
    width: 300px;
    height: 100vh;
    background: var(--color-bg-panel);
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.history-panel--visible {
    right: 0;
}

/* 确保 HistoryTabs 组件可以滚动 */
:deep(.history-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 确保标签内容区域可以滚动 */
:deep(.history-tabs .tab-content) {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
}

/* 美化滚动条 */
:deep(.history-tabs .tab-content::-webkit-scrollbar) {
    width: 6px;
}

:deep(.history-tabs .tab-content::-webkit-scrollbar-track) {
    background: var(--color-bg-secondary);
    border-radius: 3px;
}

:deep(.history-tabs .tab-content::-webkit-scrollbar-thumb) {
    background: var(--color-border);
    border-radius: 3px;
}

:deep(.history-tabs .tab-content::-webkit-scrollbar-thumb:hover) {
    background: var(--color-border-hover);
}

/* 响应式设计 */
@media screen and (max-width: 700px) {
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