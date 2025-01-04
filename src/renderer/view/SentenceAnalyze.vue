
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
        // 先调用API保存句子
        const response = await sentenceService.saveSentence({
            sentence: sentence.value,
            explanation: explanation.value,
            words: words.value
        });

        if (response.success && response.data) {
            // API保存成功后，更新本地存储
            const savedSentence = localStorageService.saveSentence({
                ...response.data,
                sentenceId: response.data.sentenceId,
                timestamp: new Date().toISOString()
            });
            
            // 如果历史面板可见，重新加载历史记录
            if (showHistory.value) {
                loadHistory();
            }
            
            return savedSentence;
        }
    } catch (error) {
        console.error('Save sentence failed:', error);
        notificationRef.value?.show('保存句子失败', 'error');
    } finally {
        isSaving.value = false;
    }
}

// 保存单词
async function saveWordInSentence(word: WordVO, contextType: string) {
    console.log('Starting word save process:', { word, contextType });
    
    if (!sentence.value || !explanation.value) {
        console.log('No sentence or explanation found');
        notificationRef.value?.show('请先解释句子', 'warning');
        return;
    }

    try {
        // 获取当前句子ID
        let currentSentenceId = sentenceHistory.value[0]?.sentenceId;
        console.log('Current sentence ID:', currentSentenceId);
        
        if (!currentSentenceId) {
            console.warn('No sentence ID found');
            notificationRef.value?.show('请先保存句子', 'warning');
            return;
        }

        try {
            // 先进行本地保存
            console.log('Saving word to local storage...');
            const savedWord = localStorageService.saveWord(word, currentSentenceId);
            console.log('Word saved to local storage:', savedWord);
            
            // 更新当前单词列表
            console.log('Updating current word list...');
            if (!words.value) words.value = [];
            words.value.unshift(word);
            
            // 更新历史记录中的句子单词列表
            console.log('Updating sentence history...');
            const sentence = sentenceHistory.value.find(s => s.sentenceId === currentSentenceId);
            if (sentence) {
                if (!sentence.words) sentence.words = [];
                sentence.words.unshift(word);
                try {
                    localStorageService.saveSentence(sentence);
                    console.log('Sentence updated in local storage');
                } catch (storageError) {
                    console.error('Failed to update sentence in local storage:', storageError);
                }
            } else {
                console.warn('Sentence not found in history:', currentSentenceId);
            }

            // 调用API保存单词
            console.log('Calling API to save word...');
            sentenceService.saveWordInSentence(currentSentenceId, word)
                .then(response => {
                    console.log('API save word response:', response);
                })
                .catch(error => {
                    console.error('API save word failed:', error);
                    // API保存失败不影响本地保存
                });

            notificationRef.value?.show('单词保存成功', 'success');
            return savedWord;
        } catch (storageError) {
            console.error('Local storage operation failed:', storageError);
            throw storageError;
        }
    } catch (error) {
        console.error('Save word failed:', error);
        notificationRef.value?.show(error.message || '保存单词失败', 'error');
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
    console.log('Translating word:', word);
    isTranslating.value = true;
    try {
        const res = await sentenceService.explainWordInSentence(
            sentence.value,
            word,
        );
        console.log('Translation result:', res);
        // save local
        const savedWord = localStorageService.saveWord(res, sentenceHistory.value[0]?.sentenceId);
        console.log('Word saved to local storage:', savedWord);
        // notification
        notificationRef.value?.show('单词解释成功', 'success');
        words.value = [...words.value, res];
    }catch (error){
        console.error('Translation failed:', error);
        notificationRef.value?.show(error.message || '单词解释失败', 'error');
    } finally {
        isTranslating.value = false;
    }
};

// 解释句子
async function handleExplain() {
    if (!sentence.value) {
        console.log('No sentence to explain');
        return;
    }
    
    console.log('Starting sentence explanation:', sentence.value);
    isExplain.value = true;
    
    try {
        console.log('Calling explain API...');
        const result = await sentenceService.explain(sentence.value);
        console.log('API response:', result);
        
        if (result.success && result.data) {
            explanation.value = result.data;
            console.log('Explanation successful, saving to local storage...');
            
            try {
                // 解释成功后立即进行本地保存
                const savedSentence = localStorageService.saveSentence({
                    sentence: sentence.value,
                    explanation: explanation.value,
                    sentenceId: Date.now(),
                    timestamp: new Date().toISOString()
                });
                console.log('Sentence saved to local storage:', savedSentence);
                
                if (savedSentence) {
                    notificationRef.value?.show('句子解释成功并已保存', 'success');
                } else {
                    console.warn('Local storage save returned null/undefined');
                    notificationRef.value?.show('句子解释成功', 'success');
                }
            } catch (storageError) {
                console.error('Local storage save failed:', storageError);
                notificationRef.value?.show('句子解释成功，但本地保存失败', 'warning');
            }
        } else {
            console.error('API returned unsuccessful result:', result);
            notificationRef.value?.show(result.message || '解释失败', 'error');
        }
    } catch (error) {
        console.error('Explanation failed:', error);
        notificationRef.value?.show(error.message || '解释失败', 'error');
    } finally {
        isExplain.value = false;
        console.log('Explanation process completed');
    }
}

const handleExplainComman = async () => {
    if (!sentence.value) return;
    isExplain.value = true;
    console.log('Starting sentence explanation:', sentence.value);
    try {
        const res = await sentenceService.explain(sentence.value);
        explanation.value = res;
        console.log('Explanation successful, saving to local storage...');
        try {
            // 解释成功后立即进行本地保存
            const savedSentence = localStorageService.saveSentence({
                sentence: sentence.value,
                explanation: explanation.value,
                sentenceId: Date.now(),
                timestamp: new Date().toISOString()
            });
            console.log('Sentence saved to local storage:', savedSentence);
            if (savedSentence) {
                notificationRef.value?.show('句子解释成功并已保存', 'success');
            } else {
                console.warn('Local storage save returned null/undefined');
                notificationRef.value?.show('句子解释成功', 'success');
            }
        } catch (storageError) {
            console.error('Local storage save failed:', storageError);
            notificationRef.value?.show('句子解释成功，但本地保存失败', 'warning');
        }   
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
    overflow-y: auto; /* 添加垂直滚动条 */
    padding: 16px;
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
    overflow: hidden; /* 确保内容不会溢出面板 */
}

.history-panel--visible {
    right: 0;
}

/* 确保 HistoryTabs 组件可以滚动 */
:deep(.history-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 防止水平滚动 */
}

/* 确保标签内容区域可以滚动 */
:deep(.history-tabs .tab-content) {
    flex: 1;
    overflow-y: auto; /* 添加垂直滚动条 */
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