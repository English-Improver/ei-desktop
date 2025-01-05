<template>
    <div class="history-tabs">
        <div class="tabs">
            <button 
                class="tab-btn"
                :class="{ active: currentView === 'sentences' }"
                @click="currentView = 'sentences'"
            >
                句子历史
            </button>
            <button 
                class="tab-btn"
                :class="{ active: currentView === 'words' }"
                @click="currentView = 'words'"
            >
                单词历史
            </button>
        </div>

        <!-- 句子历史视图 -->
        <div v-if="currentView === 'sentences'" class="history-view">
            <div class="search-box">
                <input 
                    type="text" 
                    v-model="sentenceSearchQuery" 
                    placeholder="搜索句子..."
                    @input="handleSentenceSearch"
                >
                <i class="icon-search"></i>
            </div>

            <div class="history-list">
                <div 
                    v-for="(sentence, index) in filteredSentences" 
                    :key="index"
                    class="history-item"
                    :class="{ active: selectedSentenceIndex === index }"
                    @click="selectSentence(index)"
                >
                    <div class="item-content">
                        <p class="item-text">{{ sentence.sentence }}</p>
                    </div>
                </div>
                <div v-if="filteredSentences.length === 0" class="empty-state">
                    <i class="icon-empty"></i>
                    <p>暂无历史记录</p>
                </div>
            </div>
        </div>

        <!-- 单词历史视图 -->
        <div v-if="currentView === 'words'" class="history-view">
            <div class="search-box">
                <input 
                    type="text" 
                    v-model="wordSearchQuery" 
                    placeholder="搜索单词..."
                    @input="handleWordSearch"
                >
                <i class="icon-search"></i>
            </div>

            <div class="history-list">
                <div 
                    v-for="(word, index) in filteredWords" 
                    :key="index"
                    class="history-item word-item"
                >
                    <div class="item-content">
                        <div class="word-header">
                            <p class="item-title">{{ word.word }}</p>
                            <span v-if="word.pronunciation" class="pronunciation">[{{ word.pronunciation }}]</span>
                        </div>
                        <p class="item-subtitle">{{ word.meaningInSentence }}</p>
                        <div class="meanings-list">
                            <div v-for="(meaning, idx) in word.meanings" :key="idx" class="meaning-item">
                                <span class="property">{{ meaning.property }}</span>
                                <span class="meaning">{{ meaning.meaning }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button 
                            class="action-btn"
                            @click.stop="copyWord(word)"
                            title="复制"
                        >
                            <i class="icon-copy"></i>
                        </button>
                    </div>
                </div>
                <div v-if="filteredWords.length === 0" class="empty-state">
                    <i class="icon-empty"></i>
                    <p>暂无历史记录</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SaveSentenceDTO, WordVO } from '@/types/api.ts';

const props = defineProps<{
    sentences: SaveSentenceDTO[];
    words: WordVO[];
}>();

const emit = defineEmits<{
    (e: 'reloadSentence', sentence: SaveSentenceDTO): void;
}>();

const currentView = ref('sentences');
const sentenceSearchQuery = ref('');
const wordSearchQuery = ref('');
const selectedSentenceIndex = ref(-1);

const filteredSentences = computed(() => {
    if (!sentenceSearchQuery.value) return props.sentences;
    const query = sentenceSearchQuery.value.toLowerCase();
    return props.sentences.filter(s => 
        s.sentence.toLowerCase().includes(query) || 
        s.explanation.toLowerCase().includes(query)
    );
});

const filteredWords = computed(() => {
    if (!wordSearchQuery.value) return props.words;
    const query = wordSearchQuery.value.toLowerCase();
    return props.words.filter(w => 
        w.word.toLowerCase().includes(query) || 
        w.meaningInSentence.toLowerCase().includes(query) ||
        w.meanings.some(m => m.meaning.toLowerCase().includes(query))
    );
});

const selectedSentence = computed(() => {
    if (selectedSentenceIndex.value === -1) return null;
    return filteredSentences.value[selectedSentenceIndex.value];
});

function selectSentence(index: number) {
    selectedSentenceIndex.value = index;
    const sentence = filteredSentences.value[index];
    if (sentence) {
        reloadSentence(sentence);
    }
}

function handleSentenceSearch() {
    selectedSentenceIndex.value = -1;
}

function handleWordSearch() {
    // 可以添加额外的处理逻辑
}

function reloadSentence(sentence: SaveSentenceDTO) {
    emit('reloadSentence', sentence);
}

function copyWord(word: WordVO) {
    // 复制单词逻辑
}
</script>

<style scoped>
.history-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-bg-panel);
    border-radius: var(--radius);
    overflow: hidden;
}

.tabs {
    display: flex;
    padding: 16px 20px;
    gap: 12px;
    background: var(--color-bg-panel);
    border-bottom: 1px solid var(--color-border);
}

.tab-btn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: var(--color-text);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: var(--radius-sm);
    opacity: 0.7;
}

.tab-btn:hover {
    opacity: 0.9;
    background: var(--color-bg-secondary);
}

.tab-btn.active {
    color: var(--color-primary);
    background: var(--color-primary-light);
    opacity: 1;
}

.history-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.search-box {
    position: relative;
    padding: 12px 20px;
}

.search-box input {
    width: 100%;
    height: 36px;
    padding: 0 36px 0 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-bg-secondary);
    color: var(--color-text);
    font-size: 14px;
    transition: all 0.2s ease;
}

.search-box input:focus {
    outline: none;
    border-color: var(--color-primary);
    background: var(--color-bg-panel);
}

.search-box .icon-search {
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-light);
    font-size: 16px;
}

.history-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px 20px;
}

.history-item {
    display: flex;
    align-items: center;
    padding: 16px;
    margin-bottom: 8px;
    background: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    cursor: pointer;
    border: 1px solid transparent;
}

.history-item:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-border);
}

.history-item.active {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
}

.item-content {
    flex: 1;
    min-width: 0;
    margin-right: 16px;
}

.item-text {
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.item-title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.4;
}

.item-subtitle {
    margin: 6px 0 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-text);
    opacity: 0.8;
}

.item-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--color-text-light);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background: var(--color-bg-panel);
    color: var(--color-primary);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
    color: var(--color-text-light);
}

.empty-state i {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
}

.word-item {
    padding: 16px;
}

.word-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.pronunciation {
    font-size: 14px;
    color: var(--color-text);
    opacity: 0.7;
    font-style: italic;
}

.meanings-list {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.meaning-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 13px;
    line-height: 1.5;
}

.property {
    color: var(--color-primary);
    font-weight: 500;
    opacity: 0.8;
}

.meaning {
    color: var(--color-text);
    opacity: 0.9;
}

/* 自定义滚动条 */
.history-list::-webkit-scrollbar {
    width: 8px;
}

.history-list::-webkit-scrollbar-track {
    background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-light);
}
</style>
