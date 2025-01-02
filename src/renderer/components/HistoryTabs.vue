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
    height: 100%;
    background: var(--bg-color-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.view-selector {
    display: flex;
    gap: 1px;
    background: var(--border-color);
    padding: 1px;
    margin: 12px;
    border-radius: 6px;
}

.view-btn {
    flex: 1;
    padding: 8px;
    border: none;
    background: var(--bg-color);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
}

.view-btn:first-child {
    border-radius: 6px 0 0 6px;
}

.view-btn:last-child {
    border-radius: 0 6px 6px 0;
}

.view-btn.active {
    background: var(--primary-color);
    color: white;
}

.history-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 12px 12px;
}

.search-box {
    margin-bottom: 12px;
}

.search-box input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-color);
    color: var(--text-primary);
    font-size: 13px;
}

.sentence-list,
.word-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.sentence-item {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.sentence-item:hover {
    border-color: var(--primary-color);
}

.sentence-item.active {
    border-color: var(--primary-color);
    background: var(--primary-color-10);
}

.sentence-preview {
    color: var(--text-primary);
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 8px;
}

.sentence-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-secondary);
}

.reload-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: var(--primary-color-10);
    color: var(--primary-color);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.reload-btn:hover {
    background: var(--primary-color-20);
}

.word-item {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 12px;
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
    color: var(--text-secondary);
    font-size: 13px;
}

.word-meaning {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--border-color);
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
    color: var(--text-secondary);
    flex: 1;
}

.sentence-context {
    background: var(--bg-color-secondary);
    padding: 8px;
    border-radius: 4px;
    font-size: 13px;
}

.context-label {
    color: var(--text-secondary);
    margin-bottom: 4px;
    font-size: 12px;
}

.context-text {
    color: var(--text-primary);
    line-height: 1.5;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: var(--text-secondary);
    font-size: 13px;
    background: var(--bg-color-secondary);
    border-radius: 6px;
    min-height: 120px;
}
</style>
