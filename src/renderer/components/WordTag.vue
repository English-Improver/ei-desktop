<template>
    <div class="word-list">
        <!-- Save All Button Container -->
        <div class="save-all-container">
            <button
                class="save-all-btn"
                @click="saveAllWords"
                title="保存所有单词"
                :disabled="allWordsSaved"
            >
                <span class="save-icon">{{ allWordsSaved ? '✓' : '💾' }}</span>
                {{ allWordsSaved ? '已保存全部' : '保存所有单词' }}
            </button>
        </div>
        <div
            v-for="(word, index) in words"
            :key="index"
            class="word-tag-container"
        >
            <!-- Tag -->
            <div
                class="tag"
                :class="{ active: expandedWords[index] }"
                @click="toggleExpand(index)"
            >
                <div class="tag-content">
                    <span class="word-text">{{ word.word }}</span>
                    <div class="tag-actions">
                        <!-- Context Dropdown -->
                        <select
                            v-model="word.contextType"
                            class="context-dropdown"
                            @click.stop
                            @change="handleContextChange(word, $event)"
                            :title="word.contextType === '1' ? '当前句子' : '无句子'"
                        >
                            <option value="1">句</option>
                            <option value="2">无</option>
                        </select>
                        <!-- Save Button -->
                        <button
                            class="save-btn"
                            @click.stop="saveWord(word)"
                            :title="word.saved ? '已保存' : '保存单词'"
                            :disabled="word.saving || word.saved"
                        >
                            <span class="save-icon">
                                <template v-if="word.saving">⏳</template>
                                <template v-else-if="word.saved">✓</template>
                                <template v-else>💾</template>
                            </span>
                        </button>
                        <span class="arrow" :class="{ rotated: expandedWords[index] }">▼</span>
                    </div>
                </div>
            </div>

            <!-- Expanded Details -->
            <transition name="expand">
                <div v-if="expandedWords[index]" class="details">
                    <!-- Phonetic Section -->
                    <div v-if="word.pronunciation" class="phonetic">
                        <span class="phonetic-text">{{ word.pronunciation }}</span>
                        <button
                            v-if="word.audioUrl"
                            class="play-btn"
                            @click="playPronunciation(word.audioUrl)"
                            title="播放发音"
                        >
                            🔊
                        </button>
                    </div>
                    
                    <!-- Sentence Meaning -->
                    <div v-if="word.meaningInSentence" class="sentence-meaning">
                        <div class="meaning-label">句中含义：</div>
                        <div class="meaning-content">{{ word.meaningInSentence }}</div>
                    </div>
                    
                    <!-- Word Meanings -->
                    <div v-if="word.meanings && word.meanings.length" class="meanings">
                        <div class="meaning-label">词典解释：</div>
                        <div
                            v-for="(meaning, mIndex) in word.meanings"
                            :key="mIndex"
                            class="meaning-item"
                        >
                            <span class="part-of-speech">{{ meaning.property }}</span>
                            <span class="definition">{{ meaning.meaning }}</span>
                        </div>
                    </div>

                    <!-- Word Type -->
                    <div class="word-type">
                        <span class="type-label">类型：</span>
                        <span class="type-value">{{ word.isWord === 1 ? '单词' : '词组' }}</span>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from "vue";
import { WordVO } from "@/types/api.ts";

const emit = defineEmits<{
    (e: "saveWordInSentence", word: WordVO, contextType: string): void;
}>();

const props = defineProps<{
    words: WordVO[];
}>();

// 跟踪每个单词的展开状态
const expandedWords = ref<{ [key: number]: boolean }>({});

// 切换展开状态
const toggleExpand = (index: number) => {
    expandedWords.value[index] = !expandedWords.value[index];
};

// 播放发音
const playPronunciation = async (url?: string) => {
    if (!url) return;
    try {
        const audio = new Audio(url);
        await audio.play();
    } catch (error) {
        console.error('Failed to play audio:', error);
    }
};

// 保存单词
const saveWord = (word: WordVO) => {
    if (!word || word.saving || word.saved) return;
    word.saving = true;
    emit('saveWordInSentence', word, word.contextType || '1');
};

// 处理上下文类型变化
const handleContextChange = (word: WordVO, event: Event) => {
    word.contextType = (event.target as HTMLSelectElement).value;
};

// 保存所有未保存的单词
const saveAllWords = () => {
    props.words
        .filter(word => !word.saved && !word.saving)
        .forEach(word => saveWord(word));
};

// 计算是否所有单词都已保存
const allWordsSaved = computed(() => {
    return props.words.every((word) => word.saved);
});
</script>

<style scoped>
.word-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
    overflow-y: auto;
    padding: 6px;
    background: var(--color-bg-panel);
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
}

.word-list::-webkit-scrollbar {
    width: 8px;
}

.word-list::-webkit-scrollbar-track {
    background: transparent;
}

.word-list::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 4px;
    border: 2px solid var(--color-bg-panel);
}

.word-tag-container {
    flex-shrink: 0;
}

.tag {
    display: flex;
    align-items: center;
    padding: 5px 8px;
    background-color: var(--color-bg-panel);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
    width: 100%;
    box-sizing: border-box;
}

.tag:hover {
    background-color: var(--color-bg-secondary);
}

.tag.active {
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.tag-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 24px;
}

.word-text {
    font-size: 13px;
    color: var(--color-text);
    padding: 0 2px;
}

.tag-actions {
    display: flex;
    align-items: center;
    gap: 2px;
}

.context-dropdown {
    padding: 1px 2px;
    font-size: 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background-color: var(--color-bg-panel);
    color: var(--color-text);
    cursor: pointer;
    outline: none;
    transition: all 0.15s ease;
    width: 28px;
    text-align: center;
}

.save-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text);
    opacity: 0.5;
    transition: all 0.15s ease;
}

.save-btn:hover:not(:disabled) {
    opacity: 0.8;
}

.save-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.save-icon {
    font-size: 12px;
}

.arrow {
    font-size: 8px;
    transition: transform 0.2s ease;
    color: var(--color-text);
    opacity: 0.3;
    padding: 4px;
}

.arrow.rotated {
    transform: rotate(180deg);
}

.details {
    margin-top: -1px;
    padding: 8px;
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-top: none;
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
}

.phonetic {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 6px;
    color: var(--color-text);
    opacity: 0.6;
}

.phonetic-text {
    font-size: 12px;
    font-family: monospace;
}

.play-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text);
    opacity: 0.5;
    transition: opacity 0.15s;
}

.play-btn:hover {
    opacity: 0.8;
}

.sentence-meaning {
    margin: 6px 0;
}

.meaning-label {
    font-size: 12px;
    color: var(--color-text);
    opacity: 0.5;
    margin-bottom: 3px;
}

.meaning-content {
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text);
}

.meanings {
    margin: 6px 0;
}

.meaning-item {
    display: flex;
    gap: 6px;
    margin-bottom: 3px;
    font-size: 12px;
    line-height: 1.5;
}

.meaning-item:last-child {
    margin-bottom: 0;
}

.part-of-speech {
    color: var(--color-text);
    opacity: 0.5;
    min-width: 28px;
}

.definition {
    color: var(--color-text);
    flex: 1;
}

.word-type {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid var(--color-border);
    font-size: 12px;
}

.type-label {
    color: var(--color-text);
    opacity: 0.5;
}

.type-value {
    color: var(--color-text);
}

.save-all-container {
    padding: 2px 0;
    margin-bottom: 6px;
    position: sticky;
    top: 0;
    background-color: var(--color-bg-panel);
    z-index: 1;
}

.save-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    padding: 4px 8px;
    background-color: var(--color-bg-panel);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 12px;
    min-height: 24px;
}

.save-all-btn:hover:not(:disabled) {
    background-color: var(--color-bg-secondary);
}

.save-all-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Expand animation */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.15s ease;
    max-height: 300px;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
}
</style>
