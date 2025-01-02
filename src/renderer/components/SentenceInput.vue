<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
    selectedText: {
        type: String,
        default: "",
    },
    width: {
        type: String,
        default: "100%",
    },
    rows: {
        type: Number,
        default: 3,
    },
    placeholder: {
        type: String,
        default: "请输入或粘贴要分析的文本...",
    },
    isExplain: {
        type: Boolean,
        default: false,
    },
    isTranslating: {
        type: Boolean,
        default: false,
    },
    isSearching: {
        type: Boolean,
        default: false,
    },
    isSaving: {
        type: Boolean,
        default: false,
    },
    isSaved: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits([
    "update:modelValue",
    "update:selectedText",
    "select",
    "translate",
    "search",
    "explain",
    "clear",
    "save",
]);

const inputValue = ref(props.modelValue);
const localSelectedText = ref(props.selectedText);
const selectionRange = ref({ start: 0, end: 0 });

watch(
    () => props.selectedText,
    (newVal) => {
        localSelectedText.value = newVal;
    },
);

watch(
    () => props.modelValue,
    (newValue) => {
        inputValue.value = newValue;
    },
);

watch(localSelectedText, (newVal) => {
    emit("update:selectedText", newVal);
});

const handleInput = (event: Event) => {
    const value = (event.target as HTMLTextAreaElement).value;
    inputValue.value = value;
    emit("update:modelValue", value);
};

const handleSelectedTextChange = (event: Event) => {
    const value = (event.target as HTMLTextAreaElement).value;
    localSelectedText.value = value;
};

const onSelect = (event: Event) => {
    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
        const text = inputValue.value.substring(start, end);
        localSelectedText.value = text;
        selectionRange.value = { start, end };
        emit("select", {
            text,
            range: { start, end },
        });
    }
};

const handleTranslate = () => {
    if (props.isTranslating) return;
    emit("translate", localSelectedText.value);
};

const handleSearch = () => {
    if (props.isSearching) return;
    emit("search", localSelectedText.value);
    clearSelection();
};

const handleExplain = () => {
    emit("explain", inputValue.value);
};

const handleClear = () => {
    inputValue.value = "";
    emit("update:modelValue", "");
    emit("clear");
};

const clearSelection = () => {
    localSelectedText.value = "";
    selectionRange.value = { start: 0, end: 0 };
};

const setSelectedText = (text: string) => {
    localSelectedText.value = text;
};

// 保存段落
// 添加保存段落的处理函数
const handleSave = () => {
    if (!inputValue.value || props.isSaving || props.isSaved) return;
    emit("save", inputValue.value);
};
defineExpose({
    getSelectedText: () => localSelectedText.value,
    getSelectionRange: () => selectionRange.value,
    clearSelection,
    setSelectedText,
});
</script>

<template>
    <div class="text-processor">
        <div class="text-processor__container">
            <!-- 输入面板 -->
            <div class="panel">
                <div class="panel__content">
                    <textarea
                        v-model="inputValue"
                        :rows="rows"
                        class="content__textarea"
                        :placeholder="placeholder"
                        @mouseup="onSelect"
                        @keyup="onSelect"
                        @input="handleInput"
                        aria-label="文本输入框"
                    />
                </div>

                <div class="panel__actions">
                    <button
                        class="action-button action-button--primary"
                        :class="{ 'is-loading': isExplain }"
                        :disabled="!inputValue || isExplain"
                        @click="handleExplain"
                    >
                        <svg class="icon" :class="{ 'icon-spin': isExplain }" viewBox="0 0 24 24">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                            />
                        </svg>
                        <span>{{ isExplain ? '解释中...' : '解释句子' }}</span>
                    </button>
                    
                    <button
                        class="action-button action-button--accent"
                        :class="{ 'is-loading': isSaving, 'is-saved': isSaved }"
                        :disabled="!inputValue || isSaving || isSaved"
                        :title="isSaved ? '当前句子已保存' : '保存句子'"
                        @click="handleSave"
                    >
                        <svg class="icon" :class="{ 'icon-spin': isSaving }" viewBox="0 0 24 24">
                            <path
                                d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
                            />
                        </svg>
                        <span>{{ isSaving ? '保存中...' : (isSaved ? '已保存' : '保存') }}</span>
                    </button>
                    
                    <button
                        class="action-button action-button--secondary"
                        :disabled="!inputValue"
                        @click="handleClear"
                    >
                        <svg class="icon" viewBox="0 0 24 24">
                            <path
                                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                            />
                        </svg>
                        <span>清空</span>
                    </button>
                </div>
            </div>

            <!-- 已选文本面板 -->
            <div class="panel">
                <div class="panel__content">
                    <textarea
                        v-model="localSelectedText"
                        :rows="rows"
                        class="content__textarea"
                        @input="handleSelectedTextChange"
                        placeholder="选中的文本将显示在这里..."
                        aria-label="选中的文本"
                    />
                </div>

                <div class="panel__actions">
                    <button
                        class="action-button action-button--primary"
                        :class="{ 'is-loading': isTranslating }"
                        :disabled="!localSelectedText || isTranslating"
                        @click="handleTranslate"
                    >
                        <svg class="icon" :class="{ 'icon-spin': isTranslating }" viewBox="0 0 24 24">
                            <path
                                d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
                            />
                        </svg>
                        <span>{{ isTranslating ? '翻译中...' : '翻译单词' }}</span>
                    </button>
                    <button
                        class="action-button action-button--accent"
                        :class="{ 'is-loading': isSearching }"
                        :disabled="isSearching || !localSelectedText"
                        @click="handleSearch"
                    >
                        <svg class="icon" :class="{ 'icon-spin': isSearching }" viewBox="0 0 24 24">
                            <path
                                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                            />
                        </svg>
                        <span>{{ isSearching ? '查询中...' : '查询' }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Design Tokens */

/* Layout */
.text-processor {
    width: 98%;
    background-color: var(--color-bg-primary);
    padding: 0 12px;
    margin-right: 18px;
}

.text-processor__container {
    display: flex;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
}

.text-processor__container > div:first-child {
    flex: 7;
}

.text-processor__container > div:last-child {
    flex: 3;
}

/* Panel Component */
.panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-panel);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-base);
    overflow: hidden;
}

.panel:hover {
    box-shadow: var(--shadow-md);
}

/* Header */
.panel__header {
    padding: var(--space-2) 0;
}

/* .header__title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text);
    略微增加字体大小以突出标题层级
    font-size: 10px;
    font-weight: 600;
} */

.character-count {
    margin-left: auto;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    background-color: var(--color-background);
    border-radius: 9999px;
}

/* Content Area */
.panel__content {
    flex: 1;
    position: relative;
    padding: 8px;
    display: flex;
    flex-direction: column;
}

.content__textarea {
    width: 100%;
    min-height: 32px;
    max-height: 80px;
    padding: 6px 8px;
    background-color: var(--color-bg-input);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-base);
    font-size: 0.875rem;
    line-height: 1.4;
    resize: vertical;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.content__textarea:hover {
    border-color: var(--color-primary);
}

.content__textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Actions */
.panel__actions {
    display: flex;
    gap: 6px;
    padding: 6px 8px;
    justify-content: flex-start;
    background-color: var(--color-bg-panel);
    border-top: 1px solid var(--color-border);
}

/* Buttons */
.action-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    font-size: 0.875rem;
    border-radius: var(--radius-base);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-button--primary {
    background-color: var(--color-primary);
    color: #fff;
}
.action-button--primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}
.action-button--primary:active:not(:disabled) {
    background-color: var(--color-primary-active);
    transform: translateY(0);
}

.action-button--accent {
    background-color: var(--color-accent);
    color: #fff;
}
.action-button--accent:hover:not(:disabled) {
    background-color: var(--color-accent-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}
.action-button--accent:active:not(:disabled) {
    background-color: var(--color-accent-active);
    transform: translateY(0);
}

.action-button--secondary {
    background-color: var(--color-bg-secondary);
    color: var(--color-text);
    border: 1px solid var(--color-border);
}
.action-button--secondary:hover:not(:disabled) {
    background-color: var(--color-bg-secondary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}

.clear-button {
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    color: var(--color-primary);
    cursor: pointer;
    transition:
        background-color var(--transition-base),
        color var(--transition-base);
}
.clear-button:hover:not(:disabled) {
    background-color: rgba(59, 130, 246, 0.1);
    border-radius: var(--radius-base);
}

/* States */
.action-button:disabled {
    background-color: var(--color-disabled);
    color: var(--color-text-secondary);
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

.is-loading {
    opacity: 0.8;
    cursor: not-allowed;
}

.is-saved {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: var(--color-success);
    color: white;
}

.is-saved:hover {
    opacity: 0.7;
    background-color: var(--color-success);
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.icon-spin {
    animation: spin 1s linear infinite;
    transform-origin: center;
}

/* Icons */
.icon {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
}

/* Animations */
@keyframes spin {
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

/* Responsive Design */
@media (max-width: 800px) {
    .text-processor__container {
        flex-direction: column;
    }
    
    .text-processor__container > div:first-child,
    .text-processor__container > div:last-child {
        flex: 1;
        width: 100%;
    }
}

@media (max-width: 500px) {
    .panel__actions {
        flex-wrap: wrap;
        gap: var(--space-2);
    }

    .action-button {
        min-width: 80px;
    }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
    :root {
        --color-background: #1e293b;
        --color-background: #0f172a;
        --color-text: #f1f5f9;
        --color-text-secondary: #94a3b8;
        --color-border: #334155;
        --color-disabled: #475569;
    }
}

/* High Contrast Mode Support */
@media (prefers-contrast: more) {
    :root {
        --color-primary: #0040ff;
        --color-primary-hover: #0030cc;
        --color-accent: #6000ff;
        --color-accent-hover: #4c00cc;
        --color-border: #000000;
    }

    .content__textarea {
        border-width: 2px;
    }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
    .action-button,
    .panel,
    .content__textarea {
        transition: none;
    }

    .is-loading::after {
        animation: none;
    }
}
</style>
