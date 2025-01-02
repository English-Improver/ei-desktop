<template>
    <div class="word-list">
        <!-- Save All Button Container -->
        <div class="save-all-container">
            <button
                class="save-all-btn"
                @click="saveAllWords"
                title="保存所有单词"
            >
                <span class="save-icon">💾</span>
                保存所有单词
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
                {{ word.word }}
                <span class="arrow" :class="{ rotated: expandedWords[index] }"
                    >▼</span
                >

                <!-- Dropdown Menu -->
                <div class="dropdown-container" @click.stop>
                    <select
                        v-model="word.contextType"
                        class="context-dropdown"
                        @change="handleContextChange(word, $event)"
                    >
                        <option value="1">当前句子</option>
                        <option value="2">没有句子</option>
                    </select>
                </div>
            </div>

            <!-- Expanded Details -->
            <transition name="expand">
                <div v-if="expandedWords[index]" class="details">
                    <!-- Save Button -->
                    <button
                        class="save-btn"
                        @click.stop="saveWord(word)"
                        title="保存单词"
                    >
                        <span class="save-icon">💾</span>
                    </button>
                    <!-- Phonetic Section -->
                    <div class="phonetic">
                        <span class="label">音标:</span>
                        <span class="value">/{{ word.pronunciation }}/</span>
                        <button
                            v-if="word.audioUrl"
                            class="play-btn"
                            @click.stop="playPronunciation(word.audioUrl)"
                            title="播放发音"
                        >
                            🔊
                        </button>
                    </div>

                    <!-- Sentence Meaning -->
                    <div class="sentence-meaning">
                        {{ word.meaningInSentence }}
                    </div>

                    <!-- Word Meanings -->
                    <div class="meanings">
                        <div
                            v-for="(meaning, mIndex) in word.meanings"
                            :key="mIndex"
                            class="meaning-item"
                        >
                            <span class="part-of-speech">{{
                                meaning.property
                            }}</span>
                            <span class="definition">{{
                                meaning.meaning
                            }}</span>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, watch } from "vue";
import { WordVO } from "@/types/api.ts";

const emit = defineEmits<{
    (e: "saveWordInSentence", word: WordVO, contextType: string): void;
    (e: "contextChange", word: WordVO, contextType: string): void;
}>();

const props = defineProps<{
    words: {
        word: string;
        pronunciation: string;
        meaningInSentence: string;
        meanings: Array<{
            property: string;
            meaning: string;
        }>;
        audioUrl?: string;
        isWord: number;
        contextType?: string; // New prop for context type
    }[];
}>();

const expandedWords = ref({});
const audio = ref(null);
const previousLength = ref(0);

// Watch for array changes
watch(
    () => props.words,
    (newWords) => {
        if (newWords?.length > 0) {
            if (newWords.length > previousLength.value) {
                expandedWords.value[newWords.length - 1] = true;
                // Set default context type for new words
                if (!newWords[newWords.length - 1].contextType) {
                    newWords[newWords.length - 1].contextType = "1";
                }
            }
            previousLength.value = newWords.length;
        }
    },
    {
        deep: true,
        immediate: true,
    },
);

// Manage audio resources
watchEffect((onCleanup) => {
    if (audio.value) {
        onCleanup(() => {
            audio.value.pause();
            audio.value = null;
        });
    }
});

const toggleExpand = (index) => {
    expandedWords.value[index] = !expandedWords.value[index];
};

const playPronunciation = (url) => {
    if (!url) return;
    if (!audio.value) {
        audio.value = new Audio(url);
    } else {
        audio.value.src = url;
    }
    audio.value.play();
};

const saveWord = (word: WordVO) => {
    const contextType = word.contextType || "1"; // 如果没有设置，默认使用 '1'
    emit("saveWordInSentence", word, contextType);
};

const handleContextChange = (word: WordVO, event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit("contextChange", word, target.value);
};

const saveAllWords = () => {
    // emit("saveAllWords", props.words);
};
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

.word-tag-container {
    flex-shrink: 0;
}

.tag {
    display: flex;
    justify-content: flex-start;
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

/* 新增：下拉框容器样式 */
.dropdown-container {
    margin: 0 8px;
    position: relative;
}

/* 新增：下拉框基础样式 */
.context-dropdown {
    padding: 2px 8px;
    font-size: 12px;
    border: 1px solid #91caff;
    border-radius: 12px;
    background-color: white;
    color: #1677ff;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
}

/* 新增：下拉框悬停效果 */
.context-dropdown:hover {
    border-color: #69b1ff;
    background-color: #f5f5f5;
}

/* 新增：下拉框焦点效果 */
.context-dropdown:focus {
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

/* 新增：下拉框选项样式 */
.context-dropdown option {
    background-color: white;
    color: #333;
    padding: 8px;
}

.save-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    margin-left: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    opacity: 0.6;
    transition:
        opacity 0.2s,
        background-color 0.2s;
}

.save-btn:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.3);
}

.save-icon {
    font-size: 14px;
}

.save-all-container {
    padding: 8px 4px;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 8px;
}

.save-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 16px;
    background-color: #e6f4ff;
    color: #1677ff;
    border: 1px solid #91caff;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
}

.save-all-btn:hover {
    background-color: #bae0ff;
    border-color: #69b1ff;
}

.save-all-btn .save-icon {
    font-size: 16px;
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

.arrow {
    display: inline-block;
    margin-left: 4px;
    font-size: 0.75em;
    transition: transform 0.3s;
}

.arrow.rotated {
    transform: rotate(180deg);
}

.details {
    padding: 12px;
    margin-top: -1px;
    background-color: white;
    border: 1px solid #69b1ff;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.phonetic {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.sentence-meaning {
    margin-bottom: 8px;
    color: #333;
    font-size: 0.95em;
    line-height: 1.4;
}

.label {
    color: #666;
    font-size: 0.9em;
}

.play-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.play-btn:hover {
    background-color: #f0f0f0;
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
}

.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s;
    max-height: 300px;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
}
</style>
