<template>
    <div class="history-tabs">
        <div class="view-selector">
            <button 
                class="view-btn"
                :class="{ active: currentView === 'sentences' }"
                @click="currentView = 'sentences'"
            >
                句子历史
            </button>
            <button 
                class="view-btn"
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
            </div>

            <div class="sentence-list">
                <div 
                    v-for="(sentence, index) in filteredSentences" 
                    :key="index"
                    class="sentence-item"
                    :class="{ active: selectedSentenceIndex === index }"
                    @click="selectSentence(index)"
                >
                    <div class="sentence-preview">{{ sentence.sentence }}</div>
                    <div class="sentence-meta">
                        <span class="word-count">{{ sentence.words?.length || 0 }} 个单词</span>
                        <button class="reload-btn" @click.stop="reloadSentence(sentence)">
                            重新加载
                        </button>
                    </div>
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
            </div>

            <div class="word-list">
                <div 
                    v-for="(word, index) in filteredWords" 
                    :key="index"
                    class="word-item"
                >
                    <div class="word-header">
                        <span class="word-text">{{ word.word }}</span>
                        <span class="pronunciation" v-if="word.pronunciation">
                            /{{ word.pronunciation }}/
                        </span>
                    </div>
                    <div class="word-meaning">{{ word.meaningInSentence }}</div>
                    <div class="meanings-list">
                        <div v-for="(meaning, mIndex) in word.meanings" :key="mIndex" class="meaning-item">
                            <span class="part-of-speech">{{ meaning.property }}</span>
                            <span class="definition">{{ meaning.meaning }}</span>
                        </div>
                    </div>
                    <div class="sentence-context" v-if="word.sentence">
                        <div class="context-label">例句：</div>
                        <div class="context-text">{{ word.sentence }}</div>
                    </div>
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
</script>

<style scoped>
.history-tabs {
    display: flex;
    flex-direction: column;
    height: calc(100vh - var(--nav-height));
    margin-top: var(--nav-height);
    background: var(--color-bg-panel);
}

.view-selector {
    padding: 12px;
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
}

.view-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: all 0.2s;
}

.view-btn:hover {
    background: var(--color-bg-hover);
}

.view-btn.active {
    background: var(--primary-color);
    color: white;
}

.history-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.search-box {
    padding: 12px;
    border-bottom: 1px solid var(--color-border);
}

.search-box input {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-input);
}

.sentence-list, .word-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.sentence-item, .word-item {
    padding: 12px;
    border-radius: 4px;
    background: var(--color-bg-secondary);
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.sentence-item:hover, .word-item:hover {
    background: var(--color-bg-hover);
}

.sentence-item.active, .word-item.active {
    background: var(--color-bg-active);
}

.sentence-preview {
    margin-bottom: 8px;
    line-height: 1.4;
    max-height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.sentence-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9em;
    color: var(--color-text-light);
}

.reload-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: var(--primary-color);
    color: white;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s;
}

.reload-btn:hover {
    background: var(--primary-color-dark);
}

/* 美化滚动条 */
.sentence-list::-webkit-scrollbar,
.word-list::-webkit-scrollbar {
    width: 6px;
}

.sentence-list::-webkit-scrollbar-track,
.word-list::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
    border-radius: 3px;
}

.sentence-list::-webkit-scrollbar-thumb,
.word-list::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 3px;
}

.sentence-list::-webkit-scrollbar-thumb:hover,
.word-list::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-hover);
}

.word-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.word-text {
    font-weight: 600;
    color: var(--primary-color);
    font-size: 14px;
}

.pronunciation {
    color: var(--color-text-light);
    font-size: 13px;
}

.word-meaning {
    color: var(--color-text-light);
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--color-border);
}

.meanings-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
}

.meaning-item {
    display: flex;
    gap: 8px;
    font-size: 13px;
    line-height: 1.5;
}

.part-of-speech {
    color: var(--primary-color);
    font-weight: 500;
    min-width: 32px;
    opacity: 0.8;
}

.definition {
    color: var(--color-text-light);
    flex: 1;
}

.sentence-context {
    background: var(--color-bg-secondary);
    padding: 8px;
    border-radius: 4px;
    font-size: 13px;
}

.context-label {
    color: var(--color-text-light);
    margin-bottom: 4px;
    font-size: 12px;
}

.context-text {
    color: var(--color-text);
    line-height: 1.5;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: var(--color-text-light);
    font-size: 13px;
    background: var(--color-bg-secondary);
    border-radius: 6px;
    min-height: 120px;
}
</style>
