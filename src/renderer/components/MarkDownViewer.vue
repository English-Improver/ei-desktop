<!-- LargeMarkdownViewer.vue -->
<template>
    <div class="markdown-viewer-container" :style="containerStyle">
        <!-- 工具栏 -->
        <div class="toolbar" v-if="showToolbar" :class="{ 'dark-mode': isDarkMode }">
            <button class="toolbar-btn" title="复制内容" @click="copyContent">
                <span v-if="copied" class="success">✓ 已复制</span>
                <span v-else>📋 复制</span>
            </button>
            <button class="toolbar-btn" title="切换显示模式" @click="toggleDarkMode">
                {{ isDarkMode ? "🌞" : "🌙" }}
            </button>
            <button class="toolbar-btn" title="放大字体" @click="increaseFontSize">
                A+
            </button>
            <button class="toolbar-btn" title="缩小字体" @click="decreaseFontSize">
                A-
            </button>
        </div>

        <!-- 内容区域 -->
        <div class="markdown-content-wrapper" 
             :class="{ 'dark-mode': isDarkMode }"
             @mouseup="handleSelection"
             @dblclick="handleDoubleClick"
             style="user-select: text;">
            <template v-for="(block, index) in contentBlocks" :key="index">
                <!-- sentence analysis 块 -->
                <div v-if="block.type === 'sentence-analysis'" 
                     class="sentence-analysis" 
                     :class="{ 'dark-mode': isDarkMode }"
                     :style="{ fontSize: fontSize + 'px' }">
                    <div class="analysis-section">
                        <h3 class="analysis-title">第{{ index + 1 }}个句子</h3>
                        <p class="english-text">{{ block.english }}</p>
                    </div>
                    <div class="analysis-section">
                        <span class="chinese-text">翻译：</span>
                        <p class="chinese-text">{{ block.chinese }}</p>
                    </div>
                    <div class="analysis-section">
                        <span class="grammar-text">语法：</span>
                        <div class="grammar-text" v-html="block.grammar"></div>
                    </div>
                    <div class="analysis-section">
                        <span class="notes-text">含义：</span>
                        <div class="notes-text" v-html="block.notes"></div>
                    </div>
                </div>
                <!-- markdown 块 -->
                <div v-else 
                     class="markdown-content" 
                     v-html="block.content"
                     :style="{ fontSize: fontSize + 'px' }">
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";

export default {
    name: "LargeMarkdownViewer",
    props: {
        content: { type: String, required: true },
        showToolbar: { type: Boolean, default: true },
        autoDetectLanguage: { type: Boolean, default: true },
        width: { type: [String, Number], default: "100%" },
        height: { type: [String, Number], default: "350px" },
        initialFontSize: { type: Number, default: 14 },
    },

    emits: ["word-select", "word-dbclick"],

    data() {
        return {
            isDarkMode: false,
            copied: false,
            fontSize: this.initialFontSize,
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

            // 配置 marked
            marked.setOptions({
                highlight: (code, lang) => {
                    if (this.autoDetectLanguage) {
                        if (lang && hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(code, { language: lang }).value;
                            } catch (err) {
                                console.error('Highlight error:', err);
                            }
                        }
                        return hljs.highlightAuto(code).value;
                    }
                    return code;
                },
                pedantic: false,
                gfm: true,
                breaks: true,
                sanitize: false,
                smartLists: true,
                smartypants: true,
                xhtml: false
            });

            // 自定义渲染器
            const renderer = new marked.Renderer();
            
            // 自定义链接渲染
            renderer.link = (href, title, text) => {
                return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
            };

            // 自定义图片渲染
            renderer.image = (href, title, text) => {
                return `<img src="${href}" alt="${text}" title="${title || ''}" style="max-width: 100%; height: auto;">`;
            };

            // 自定义代码块渲染
            renderer.code = (code, language) => {
                const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
                const highlighted = hljs.highlight(validLanguage, code).value;
                return `<pre><code class="hljs ${validLanguage}">${highlighted}</code></pre>`;
            };

            marked.use({ renderer });

            while ((match = regex.exec(this.content)) !== null) {
                if (match.index > lastIndex) {
                    const markdownContent = this.content.slice(lastIndex, match.index);
                    if (markdownContent.trim()) {
                        blocks.push({
                            type: 'markdown',
                            content: DOMPurify.sanitize(marked(markdownContent))
                        });
                    }
                }

                const analysisContent = match[1];
                blocks.push({
                    type: 'sentence-analysis',
                    english: this.extractTagContent(analysisContent, 'english'),
                    chinese: this.extractTagContent(analysisContent, 'chinese'),
                    grammar: DOMPurify.sanitize(marked(this.extractTagContent(analysisContent, 'grammar'))),
                    notes: DOMPurify.sanitize(marked(this.extractTagContent(analysisContent, 'notes')))
                });

                lastIndex = regex.lastIndex;
            }

            if (lastIndex < this.content.length) {
                const markdownContent = this.content.slice(lastIndex);
                if (markdownContent.trim()) {
                    blocks.push({
                        type: 'markdown',
                        content: DOMPurify.sanitize(marked(markdownContent))
                    });
                }
            }

            return blocks;
        }
    },

    methods: {
        extractTagContent(content, tagName) {
            const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, "s");
            const match = content.match(regex);
            return match ? match[1].trim() : "";
        },

        handleSelection(event) {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                this.$emit("word-select", selectedText);
            }
        },

        handleDoubleClick(event) {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                this.$emit("word-dbclick", selectedText);
            }
        },

        async copyContent() {
            try {
                const textContent = this.content;
                await navigator.clipboard.writeText(textContent);
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

        increaseFontSize() {
            this.fontSize = Math.min(this.fontSize + 2, 24);
        },

        decreaseFontSize() {
            this.fontSize = Math.max(this.fontSize - 2, 12);
        },
    },
};
</script>

<style>
/* 全局选择样式 */
::selection {
    background-color: rgba(var(--color-primary-rgb), 0.15);
    color: inherit;
}

::-moz-selection {
    background-color: rgba(var(--color-primary-rgb), 0.15);
    color: inherit;
}
</style>

<style scoped>
.markdown-viewer-container {
    position: relative;
    border-radius: var(--radius-sm);
    background: var(--color-bg-panel);
    transition: all 0.15s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.toolbar {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: var(--color-bg-panel);
    border-bottom: 1px solid var(--color-border);
    opacity: 0.6;
    transition: opacity 0.2s ease;
}

.toolbar:hover {
    opacity: 1;
}

.toolbar button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-bg-panel);
    color: var(--color-text);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    white-space: nowrap;
    opacity: 0.7;
}

.toolbar button:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-hover);
}

.toolbar button:active {
    transform: translateY(1px);
}

.toolbar button.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
}

.toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.toolbar button i {
    margin-right: 6px;
    font-size: 14px;
}

.markdown-content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    user-select: text;
}

/* Markdown 内容样式 */
.markdown-content {
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-text);
    user-select: text;
    -webkit-user-select: text;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--color-text);
}

.markdown-content :deep(h1) {
    font-size: 1.6em;
    padding-bottom: 0.2em;
    border-bottom: 1px solid var(--color-border);
}

.markdown-content :deep(h2) {
    font-size: 1.4em;
    padding-bottom: 0.2em;
    border-bottom: 1px solid var(--color-border);
}

.markdown-content :deep(h3) {
    font-size: 1.2em;
}

.markdown-content :deep(h4) {
    font-size: 1.1em;
}

.markdown-content :deep(h5) {
    font-size: 1em;
}

.markdown-content :deep(h6) {
    font-size: 0.9em;
    color: var(--color-text-light);
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
    margin: 8px 0;
    padding-left: 2em;
    margin-left: 0.5em;
}

.markdown-content :deep(ul ul),
.markdown-content :deep(ul ol),
.markdown-content :deep(ol ul),
.markdown-content :deep(ol ol) {
    margin: 4px 0;
    margin-left: 0.5em;
}

.markdown-content :deep(li) {
    margin: 4px 0;
    line-height: 1.8;
    position: relative;
    word-spacing: 0.05em;
    letter-spacing: 0.01em;
}

.markdown-content :deep(li:not(:lang(zh))) {
    text-align: justify;
}

.markdown-content :deep(li:lang(zh)),
.markdown-content :deep(li *:lang(zh)) {
    text-justify: inter-ideograph;
}

.markdown-content :deep(li) :is(:lang(en) + :lang(zh), :lang(zh) + :lang(en)) {
    margin: 0 0.25em;
}

.markdown-content :deep(ul li) {
    list-style-type: disc;
}

.markdown-content :deep(ul li li) {
    list-style-type: circle;
}

.markdown-content :deep(ul li li li) {
    list-style-type: square;
}

.markdown-content :deep(ol li) {
    list-style-type: decimal;
}

.markdown-content :deep(ol li li) {
    list-style-type: lower-alpha;
}

.markdown-content :deep(ol li li li) {
    list-style-type: lower-roman;
}

/* 任务列表 */
.markdown-content :deep(ul.contains-task-list) {
    padding-left: 0;
}

.markdown-content :deep(ul.contains-task-list li) {
    list-style-type: none;
    padding-left: 1.5em;
}

.markdown-content :deep(.task-list-item) {
    position: relative;
}

.markdown-content :deep(.task-list-item input[type="checkbox"]) {
    position: absolute;
    left: 0;
    top: 0.3em;
    margin: 0;
    transform: translateY(-1px);
}

/* 段落和列表 */
.markdown-content :deep(p) {
    margin: 0 0 16px 0;
    line-height: 1.6;
}

/* 链接样式 */
.markdown-content :deep(a) {
    color: var(--color-primary);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.15s ease;
}

.markdown-content :deep(a:hover) {
    border-bottom-color: var(--color-primary);
}

/* 代码样式 */
.markdown-content :deep(code) {
    padding: 0.2em 0.4em;
    margin: 0 0.2em;
    font-size: 90%;
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace;
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
    color: var(--color-text);
}

.markdown-content :deep(pre) {
    margin: 16px 0;
    padding: 16px;
    overflow: auto;
    font-size: 90%;
    line-height: 1.45;
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
}

.markdown-content :deep(pre code) {
    padding: 0;
    margin: 0;
    font-size: 100%;
    word-break: normal;
    white-space: pre;
    background: transparent;
    border: 0;
}

/* 引用样式 */
.markdown-content :deep(blockquote) {
    margin: 16px 0;
    padding: 0 16px;
    color: var(--color-text);
    opacity: 0.8;
    border-left: 3px solid var(--color-border);
    background: var(--color-bg-secondary);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.markdown-content :deep(blockquote > :first-child) {
    margin-top: 0;
}

.markdown-content :deep(blockquote > :last-child) {
    margin-bottom: 0;
}

/* 表格样式 */
.markdown-content :deep(table) {
    width: 100%;
    margin: 16px 0;
    border-collapse: collapse;
    border-spacing: 0;
    overflow: auto;
}

.markdown-content :deep(table th) {
    font-weight: 500;
    text-align: left;
    background: var(--color-bg-secondary);
}

.markdown-content :deep(table td),
.markdown-content :deep(table th) {
    padding: 8px 12px;
    border: 1px solid var(--color-border);
}

.markdown-content :deep(table tr:nth-child(2n)) {
    background: var(--color-bg-secondary);
}

/* 水平线 */
.markdown-content :deep(hr) {
    height: 1px;
    margin: 24px 0;
    background-color: var(--color-border);
    border: none;
}

/* 图片 */
.markdown-content :deep(img) {
    max-width: 100%;
    height: auto;
    margin: 16px 0;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
}

/* 代码高亮 */
.markdown-content :deep(.hljs) {
    display: block;
    overflow-x: auto;
    padding: 1em;
    color: var(--color-text);
    background: var(--color-bg-secondary);
}

.markdown-content :deep(.hljs-comment),
.markdown-content :deep(.hljs-quote) {
    color: var(--color-text-light);
    font-style: italic;
}

.markdown-content :deep(.hljs-keyword),
.markdown-content :deep(.hljs-selector-tag),
.markdown-content :deep(.hljs-subst) {
    color: var(--color-primary);
}

.markdown-content :deep(.hljs-string),
.markdown-content :deep(.hljs-doctag) {
    color: var(--color-success);
}

.markdown-content :deep(.hljs-number),
.markdown-content :deep(.hljs-literal) {
    color: var(--color-warning);
}

/* 自定义滚动条样式 */
.markdown-content-wrapper::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.markdown-content-wrapper::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
    border-radius: var(--radius);
}

.markdown-content-wrapper::-webkit-scrollbar-thumb {
    background: var(--neutral-300);
    border-radius: var(--radius);
    transition: var(--transition);
}

.markdown-content-wrapper::-webkit-scrollbar-thumb:hover {
    background: var(--neutral-400);
}

/* 添加一些动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.sentence-analysis {
    animation: fadeIn 0.3s ease-out;
    user-select: text;
    -webkit-user-select: text;
    margin-bottom: 24px;
    padding: 16px;
    border-radius: var(--radius-lg);
    background: var(--color-bg-secondary);
}

/* 移除其他选择样式 */
.grammar-text :deep(*) ::selection,
.notes-text :deep(*) ::selection,
.grammar-text :deep(*) ::-moz-selection,
.notes-text :deep(*) ::-moz-selection {
    background-color: transparent;
    color: inherit;
}

.grammar-text :deep(p) {
    margin: 0;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
}

.notes-text :deep(p) {
    margin: 0;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
}

.analysis-section {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
}

.analysis-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.analysis-title {
    margin: 0 0 8px 0;
    font-size: 13px;
    font-weight: normal;
    color: var(--color-text);
    opacity: 0.5;
}

.english-text {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.6;
    margin: 0;
    color: var(--color-text);
}

.chinese-text {
    font-size: 15px;
    line-height: 1.6;
    margin: 0;
    color: var(--color-text);
    opacity: 0.9;
}

.grammar-text, .notes-text {
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
    color: var(--color-text);
    opacity: 0.75;
}
</style>
