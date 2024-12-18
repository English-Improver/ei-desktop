<!-- WordTagList.vue -->
<template>
    <div class="word-list">
        <!-- 新增保存所有按钮区域 -->
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
            <!-- 标签本身 -->
            <div
                class="tag"
                :class="{ active: expandedWords[index] }"
                @click="toggleExpand(index)"
            >
                {{ word.word }}
                <span class="arrow" :class="{ rotated: expandedWords[index] }"
                    >▼</span
                >
                <!-- 新增保存按钮 -->
                <button
                    class="save-btn"
                    @click.stop="saveWord(word)"
                    title="保存单词"
                >
                    <span class="save-icon">💾</span>
                </button>
            </div>

            <!-- 展开的详细信息 -->
            <transition name="expand">
                <div v-if="expandedWords[index]" class="details">
                    <!-- 音标部分 -->
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

                    <!-- 句中含义 -->
                    <div class="sentence-meaning">
                        {{ word.meaningInSentence }}
                    </div>

                    <!-- 词性和词义部分 -->
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

<script setup>
import { ref, watchEffect, watch } from "vue";

const props = defineProps({
    words: {
        type: Array,
        required: true,
        validator: (value) => {
            return value.every(
                (word) =>
                    word.hasOwnProperty("word") &&
                    word.hasOwnProperty("pronunciation") &&
                    word.hasOwnProperty("meaningInSentence") &&
                    word.hasOwnProperty("meanings") &&
                    Array.isArray(word.meanings) &&
                    word.meanings.every(
                        (item) =>
                            item.hasOwnProperty("property") &&
                            item.hasOwnProperty("meaning"),
                    ),
            );
        },
    },
});

const expandedWords = ref({});
const audio = ref(null);
const previousLength = ref(0);

// 使用 watch 监听数组的变化
watch(
    () => props.words,
    (newWords) => {
        if (newWords?.length > 0) {
            // 如果数组长度增加了，说明添加了新单词
            if (newWords.length > previousLength.value) {
                // 设置新添加的单词为展开状态
                expandedWords.value[newWords.length - 1] = true;
            }
            // 更新前一次的长度
            previousLength.value = newWords.length;
        }
    },
    {
        deep: true, // 深度监听数组变化
        immediate: true, // 立即执行
    },
);

// 管理音频资源
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

// 新增保存单词方法
const saveWord = (word) => {};

// 新增保存所有单词的方法
const saveAllWords = () => {
    // emit("saveAllWords", props.words);
};
</script>

<style scoped>
.word-list {
    display: flex;
    flex-direction: column;
    /* flex-wrap: wrap; */
    gap: 4px;
    padding: 4px;
    height: 370px;
    overflow-y: auto;
}

.word-tag-container {
    display: flex;
    flex-direction: column;
    /* position: relative; */
    display: inline-block;
    margin: 4px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
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
/* 单词保存按钮样式 */
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

/** 新增保存所有按钮样式 */
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
    /* width: 190px; */
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

/* 展开/收起动画 */
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
