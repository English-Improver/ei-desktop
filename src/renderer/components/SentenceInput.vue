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

const hasContent = ref(false);

watch(inputValue, (newValue) => {
    hasContent.value = newValue !== "";
});

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
                    <div class="sentence-input-container">
                        <textarea
                            v-model="inputValue"
                            :rows="rows"
                            class="sentence-input"
                            :placeholder="placeholder"
                            @mouseup="onSelect"
                            @keyup="onSelect"
                            @input="handleInput"
                            aria-label="文本输入框"
                        />
                    </div>
                </div>

                <div class="panel__actions">
                    <div class="button-group">
                        <button 
                            class="btn clickable"
                            :class="{ 'loading': isExplain }"
                            @click="handleExplain"
                            :disabled="!hasContent || isExplain"
                        >
                            解释
                        </button>
                        <button 
                            class="btn clickable"
                            @click="handleClear"
                            :disabled="!hasContent"
                        >
                            清空
                        </button>
                        <button 
                            class="btn clickable"
                            :class="{ 'loading': isSaving }"
                            @click="handleSave"
                            :disabled="!hasContent || isSaving || isSaved"
                        >
                            {{ isSaving ? '保存中' : (isSaved ? '已保存' : '保存') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- 已选文本面板 -->
            <div class="panel">
                <div class="panel__content">
                    <div class="sentence-input-container">
                        <textarea
                            v-model="localSelectedText"
                            :rows="rows"
                            class="sentence-input"
                            @input="handleSelectedTextChange"
                            placeholder="选中的文本将显示在这里..."
                            aria-label="选中的文本"
                        />
                    </div>
                </div>

                <div class="panel__actions">
                    <div class="button-group">
                        <button 
                            class="btn clickable"
                            :class="{ 'loading': isTranslating }"
                            @click="handleTranslate"
                            :disabled="!localSelectedText || isTranslating"
                        >
                            翻译
                        </button>
                        <button 
                            class="btn clickable"
                            @click="handleSearch"
                            :disabled="!localSelectedText || isSearching"
                        >
                            查询
                        </button>
                    </div>
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

.sentence-input-container {
    position: relative;
    width: 100%;
    background-color: var(--color-bg-panel);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    transition: all 0.2s ease;
}

.sentence-input-container:focus-within {
    border-color: var(--color-border-hover);
    box-shadow: 0 0 0 2px var(--primary-light);
}

.sentence-input {
    width: 100%;
    min-height: 32px;
    max-height: 80px;
    padding: 6px 8px;
    background-color: transparent;
    border: none;
    outline: none;
    resize: vertical;
    font-size: 14px;
    line-height: 1.4;
    color: var(--color-text);

    /* 自定义滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;

    /* Webkit 浏览器的滚动条样式 */
    &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--color-border);
        border-radius: 3px;
        border: 1px solid var(--color-bg-panel);

        &:hover {
            background-color: var(--color-border-hover, #666);
        }
    }
}

.sentence-input::placeholder {
    color: var(--text-hint-light);
}

/* Actions */
.panel__actions {
    display: flex;
    padding: 4px 8px;
    justify-content: flex-start;
    background-color: var(--color-bg-panel);
}

/* Buttons */
.button-group {
    display: flex;
    gap: var(--space-2);
}

.button-container {
    display: flex;
    gap: var(--space-2);
    padding: 4px var(--space-2);
    background-color: var(--color-bg-secondary);
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--btn-bg);
    color: var(--text-primary);
    border: 1px solid var(--btn-border);
    box-shadow: var(--btn-shadow);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.3px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.btn:hover:not(:disabled) {
    background-color: var(--btn-bg-hover);
    box-shadow: var(--btn-shadow-hover);
    transform: translateY(-1px);
}

.btn:active:not(:disabled) {
    background-color: var(--btn-bg-active);
    box-shadow: var(--btn-shadow-active);
    transform: translateY(0);
}

.btn:disabled {
    background-color: var(--gray-900);
    color: var(--gray-600);
    box-shadow: none;
    cursor: not-allowed;
    border-color: var(--gray-800);
}

.btn.loading {
    color: transparent;
}

.btn.loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    left: 50%;
    margin: -8px 0 0 -8px;
    border-radius: 50%;
    border: 2px solid;
    border-color: var(--text-primary) transparent var(--text-primary) transparent;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 700px) {
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

    .button-group {
        flex-wrap: wrap;
    }

    .btn {
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

    .sentence-input {
        border-width: 2px;
    }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
    .action-button,
    .panel,
    .sentence-input {
        transition: none;
    }

    .is-loading::after {
        animation: none;
    }
}
</style>
