<!-- WordTagList.vue -->
<template>
    <div class="word-list">
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

<script>
import { ref, watch } from "vue";

export default {
    name: "WordTagList",
    props: {
        words: {
            type: Array,
            required: true,
            validator: function (value) {
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
    },
    data() {
        return {
            audio: null,
        };
    },
    setup(props) {
        const expandedWords = ref({});

        // 监听 words 属性的变化
        watch(
            () => props.words,
            (newWords) => {
                if (newWords && newWords.length > 0) {
                    // 当数据更新时，设置所有标签为展开状态
                    newWords.forEach((_, index) => {
                        expandedWords.value[index] = true;
                    });
                }
            },
            { immediate: true }, // 立即执行一次
        );

        return {
            expandedWords,
        };
    },
    methods: {
        toggleExpand(index) {
            this.expandedWords[index] = !this.expandedWords[index];
        },
        playPronunciation(url) {
            if (!url) return;

            if (!this.audio) {
                this.audio = new Audio(url);
            } else {
                this.audio.src = url;
            }
            this.audio.play();
        },
    },
};
</script>

<style scoped>
.word-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
}

.word-tag-container {
    position: relative;
    display: inline-block;
    margin: 4px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.tag {
    display: inline-flex;
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
    width: 200px;
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
