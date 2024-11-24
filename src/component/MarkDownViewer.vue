<!-- LargeMarkdownViewer.vue -->
<template>
    <div class="markdown-viewer-container" :style="containerStyle">
        <!-- 工具栏 -->
        <div class="toolbar" v-if="showToolbar">
            <button class="toolbar-btn" title="复制内容" @click="copyContent">
                <span v-if="copied">✓ 已复制</span>
                <span v-else>📋 复制</span>
            </button>
            <button
                class="toolbar-btn"
                title="切换显示模式"
                @click="toggleDarkMode"
            >
                {{ isDarkMode ? "🌞" : "🌙" }}
            </button>
        </div>

        <!-- 内容区域 -->
        <div
            class="markdown-content-wrapper"
            :class="{ 'dark-mode': isDarkMode }"
        >
            <template v-for="(block, index) in contentBlocks" :key="index">
                <!-- sentence analysis 块 -->
                <div
                    v-if="block.type === 'sentence-analysis'"
                    class="sentence-analysis"
                    :class="{ 'dark-mode': isDarkMode }"
                >
                    <div class="analysis-section">
                        <h3 class="analysis-title">English</h3>
                        <p
                            class="english-text"
                            @mouseup="handleSelection"
                            @dblclick="handleDoubleClick"
                        >
                            {{ block.english }}
                        </p>
                    </div>
                    <div class="analysis-section">
                        <h3 class="analysis-title">Chinese</h3>
                        <p
                            class="chinese-text"
                            @mouseup="handleSelection"
                            @dblclick="handleDoubleClick"
                        >
                            {{ block.chinese }}
                        </p>
                    </div>
                    <div class="analysis-section">
                        <h3 class="analysis-title">Grammar Analysis</h3>
                        <div
                            class="grammar-text"
                            @mouseup="handleSelection"
                            @dblclick="handleDoubleClick"
                            v-html="block.grammar"
                        ></div>
                    </div>
                    <div class="analysis-section">
                        <h3 class="analysis-title">Notes</h3>
                        <p
                            class="notes-text"
                            @mouseup="handleSelection"
                            @dblclick="handleDoubleClick"
                            v-html="block.notes"
                        ></p>
                    </div>
                </div>
                <!-- markdown 块 -->
                <div
                    v-else
                    class="markdown-content"
                    v-html="block.content"
                ></div>
            </template>
        </div>
    </div>
</template>

<script>
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

export default {
    name: "LargeMarkdownViewer",
    props: {
        content: {
            type: String,
            required: true,
        },
        showToolbar: {
            type: Boolean,
            default: true,
        },
        autoDetectLanguage: {
            type: Boolean,
            default: true,
        },
        width: {
            type: [String, Number],
            default: "100%",
        },
        height: {
            type: [String, Number],
            default: "350px",
        },
    },

    emits: ["word-select", "word-dbclick"],

    data() {
        return {
            isDarkMode: false,
            copied: false,
        };
    },

    computed: {
        containerStyle() {
            return {
                width:
                    typeof this.width === "number"
                        ? `${this.width}px`
                        : this.width,
                height:
                    typeof this.height === "number"
                        ? `${this.height}px`
                        : this.height,
            };
        },

        contentBlocks() {
            const blocks = [];
            let lastIndex = 0;
            const regex = /<sentence_analysis>([\s\S]*?)<\/sentence_analysis>/g;
            let match;

            marked.setOptions({
                highlight: (code, lang) => {
                    if (this.autoDetectLanguage) {
                        if (lang && hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(code, { language: lang })
                                    .value;
                            } catch (err) {}
                        }
                        return hljs.highlightAuto(code).value;
                    }
                    return code;
                },
                breaks: true,
                gfm: true,
                headerIds: true,
                mangle: false,
                smartLists: true,
                smartypants: true,
            });

            while ((match = regex.exec(this.content)) !== null) {
                // 添加前面的 Markdown 内容
                if (match.index > lastIndex) {
                    const markdownContent = this.content.slice(
                        lastIndex,
                        match.index,
                    );
                    if (markdownContent.trim()) {
                        blocks.push({
                            type: "markdown",
                            content: DOMPurify.sanitize(
                                marked(markdownContent),
                            ),
                        });
                    }
                }

                // 处理 sentence_analysis 内容
                const analysisContent = match[1];
                blocks.push({
                    type: "sentence-analysis",
                    english: this.extractTagContent(analysisContent, "english"),
                    chinese: this.extractTagContent(analysisContent, "chinese"),
                    grammar: marked(
                        this.extractTagContent(analysisContent, "grammar"),
                    ),
                    notes: marked(
                        this.extractTagContent(analysisContent, "notes"),
                    ),
                });

                lastIndex = regex.lastIndex;
            }

            // 添加剩余的 Markdown 内容
            if (lastIndex < this.content.length) {
                const markdownContent = this.content.slice(lastIndex);
                if (markdownContent.trim()) {
                    blocks.push({
                        type: "markdown",
                        content: DOMPurify.sanitize(marked(markdownContent)),
                    });
                }
            }

            return blocks;
        },
    },

    methods: {
        extractTagContent(content, tagName) {
            const startTag = `<${tagName}>`;
            const endTag = `</${tagName}>`;
            const startIndex = content.indexOf(startTag);
            const endIndex = content.indexOf(endTag);

            if (startIndex === -1 || endIndex === -1) {
                return "";
            }

            return content
                .substring(startIndex + startTag.length, endIndex)
                .trim();
        },

        handleSelection(event) {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (selectedText) {
                this.$emit("word-select", selectedText);
            }
        },

        handleDoubleClick(event) {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (selectedText) {
                this.$emit("word-dbclick", selectedText);
            }
        },

        async copyContent() {
            try {
                await navigator.clipboard.writeText(this.content);
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        },

        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
        },
    },
};
</script>

<style scoped>
.markdown-viewer-container {
    display: flex;
    flex-direction: column;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    overflow: hidden;
    background-color: white;
    font-size: 16px;
}

.toolbar {
    display: flex;
    gap: 8px;
    padding: 12px;
    background-color: #f6f8fa;
    border-bottom: 1px solid #e1e4e8;
    flex-shrink: 0;
}

.toolbar-btn {
    padding: 6px 16px;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
}

.toolbar-btn:hover {
    background-color: #f1f1f1;
    border-color: #d1d5da;
}

.markdown-content-wrapper {
    flex: 1;
    overflow-y: auto;
    background-color: white;
    padding: 24px;
}

.markdown-content-wrapper.dark-mode {
    background-color: #0d1117;
    color: #c9d1d9;
}

.sentence-analysis {
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    margin: 0.75rem 0;
    padding: 1rem;
    background-color: #f8f9fa;
}

.sentence-analysis.dark-mode {
    background-color: #1f2937;
    border-color: #374151;
}

.analysis-section {
    margin-bottom: 0.75rem;
}

.analysis-section:last-child {
    margin-bottom: 0;
}

.analysis-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: #374151;
}

.dark-mode .analysis-title {
    color: #e5e7eb;
}

.english-text {
    color: #2563eb;
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
    margin: 0;
    user-select: text;
    cursor: text;
}

.dark-mode .english-text {
    color: #93c5fd;
}

.chinese-text {
    color: #059669;
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
    margin: 0;
    user-select: text;
    cursor: text;
}

.dark-mode .chinese-text {
    color: #86efac;
}

.grammar-text {
    color: #4b5563;
    white-space: pre-wrap;
    line-height: 1.5;
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin: 0;
}

.dark-mode .grammar-text {
    color: #d1d5db;
}

.notes-text {
    color: #92400e;
    font-style: italic;
    line-height: 1.5;
    font-size: 0.9rem;
    white-space: pre-wrap;
    margin: 0;
}

.dark-mode .notes-text {
    color: #fde68a;
}

/* 滚动条样式 */
.markdown-content-wrapper::-webkit-scrollbar {
    width: 10px;
}

.markdown-content-wrapper::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.markdown-content-wrapper::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 5px;
}

.markdown-content-wrapper::-webkit-scrollbar-thumb:hover {
    background: #999;
}
</style>
