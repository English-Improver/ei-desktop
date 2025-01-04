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
                    <div class="phonetic">
                        <span class="phonetic-text">{{ word.phonetic }}</span>
                        <button
                            v-if="word.audioUrl"
                            class="play-btn"
                            @click="playPronunciation(word.audioUrl)"
                            title="播放发音"
                        >
                            🔊
                        </button>
                    </div>
                    
                    <!-- Translation -->
                    <div class="translation">{{ word.translation }}</div>
                    
                    <!-- Sentence Meaning -->
                    <div v-if="word.meaningInSentence" class="sentence-meaning">
                        {{ word.meaningInSentence }}
                    </div>
                    
                    <!-- Word Meanings -->
                    <div v-if="word.meanings" class="meanings">
                        <div
                            v-for="(meaning, mIndex) in word.meanings"
                            :key="mIndex"
                            class="meaning-item"
                        >
                            <span class="part-of-speech">{{ meaning.property }}</span>
                            <span class="definition">{{ meaning.meaning }}</span>
                        </div>
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
    gap: 8px;
    height: 100%;
    overflow-y: auto;
    padding-right: 8px;
}

.tag {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    background-color: #e6f4ff;
    color: #1677ff;
    border: 1px solid #91caff;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    user-select: none;
}

.tag:hover {
    background-color: #bae0ff;
    border-color: #69b1ff;
}

.tag.active {
    background-color: #bae0ff;
    border-color: #69b1ff;
    border-radius: 16px 16px 0 0;
}

.tag-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
}

.word-text {
    font-weight: 500;
}

.tag-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

.context-dropdown {
    padding: 2px 4px;
    font-size: 12px;
    border: 1px solid #91caff;
    border-radius: 8px;
    background-color: white;
    color: #1677ff;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
    width: 40px;
}

.context-dropdown:hover {
    border-color: #69b1ff;
    background-color: #f5f5f5;
}

.context-dropdown:focus {
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.save-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    opacity: 0.6;
    transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
    opacity: 1;
}

.save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.save-icon {
    font-size: 14px;
}

.arrow {
    font-size: 10px;
    transition: transform 0.3s ease;
}

.arrow.rotated {
    transform: rotate(180deg);
}

.details {
    margin-top: -1px;
    padding: 12px;
    background-color: white;
    border: 1px solid #69b1ff;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.phonetic {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    color: #666;
}

.phonetic-text {
    font-size: 13px;
}

.play-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    font-size: 14px;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.play-btn:hover {
    opacity: 1;
}

.translation {
    margin-bottom: 8px;
    color: #333;
    font-size: 0.95em;
    line-height: 1.4;
}

.sentence-meaning {
    margin-bottom: 8px;
    color: #666;
    font-size: 0.9em;
    line-height: 1.4;
    padding-left: 8px;
    border-left: 2px solid #e8e8e8;
}

.meanings {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.meaning-item {
    display: flex;
    gap: 8px;
    align-items: baseline;
}

.part-of-speech {
    color: #666;
    font-style: italic;
    font-size: 0.9em;
    min-width: 60px;
}

.definition {
    color: #333;
    line-height: 1.4;
}

.save-all-container {
    padding: 4px;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 8px;
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
}

.save-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    padding: 6px 12px;
    background-color: #e6f4ff;
    color: #1677ff;
    border: 1px solid #91caff;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 13px;
}

.save-all-btn:hover:not(:disabled) {
    background-color: #bae0ff;
    border-color: #69b1ff;
}

.save-all-btn:disabled {
    background-color: #f0f0f0;
    border-color: #d9d9d9;
    color: #bfbfbf;
    cursor: not-allowed;
}

/* Expand animation */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
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
