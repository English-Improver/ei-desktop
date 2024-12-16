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
});

const emit = defineEmits([
    "update:modelValue",
    "update:selectedText",
    "select",
    "translate",
    "search",
    "explain",
    "clear",
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
                <!-- <div class="panel__header">
                    <div class="header__title">
                        <svg
                            class="icon"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                            />
                        </svg>

                        <div v-if="inputValue" class="character-count">
                            {{ inputValue.length }} 字
                        </div>
                    </div>
                </div> -->

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
                        <svg class="icon" viewBox="0 0 24 24">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                            />
                        </svg>
                        <span>解释句子</span>
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
                <!-- <div class="panel__header">
                    <div class="header__title">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path
                                d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2z"
                            />
                        </svg>
                        <span>已选中文本</span>
                        <button
                            class="clear-button"
                            @click="clearSelection"
                            :disabled="!localSelectedText"
                        >
                            清除
                        </button>
                    </div>
                </div> -->

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
                        :disabled="isTranslating || !localSelectedText"
                        @click="handleTranslate"
                    >
                        <svg class="icon" viewBox="0 0 24 24">
                            <path
                                d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
                            />
                        </svg>
                        <span>{{ isTranslating ? "翻译中..." : "翻译" }}</span>
                    </button>
                    <button
                        class="action-button action-button--accent"
                        :class="{ 'is-loading': isSearching }"
                        :disabled="isSearching || !localSelectedText"
                        @click="handleSearch"
                    >
                        <svg class="icon" viewBox="0 0 24 24">
                            <path
                                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                            />
                        </svg>
                        <span>{{ isSearching ? "查询中..." : "查询" }}</span>
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
    width: 97%;
    padding: var(--space-2);
    background-color: var(--color-background);
}

.text-processor__container {
    display: flex;
    gap: var(--space-6);
    max-width: 1280px;
    margin: 0 auto;
    background-color: var(--color-background);
    /* 增加一点垂直间距以防止过度紧凑 */
    align-items: flex-start;
}

/* Panel Component */
.panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    /* gap: var(--space-2); */
    /* padding: var(--space-4); */
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-base);
}

.panel:hover {
    /* 将过度明显的阴影减弱，保持轻微 hover 效果 */
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
}

.content__textarea {
    width: 92%;
    padding: var(--space-3);
    background-color:;
    color: var(--color-text);
    /* border: 1px solid transparent; */
    border-radius: var(--radius-base);
    font-size: 0.875rem;
    line-height: 1.6; /* 略微增大行高，提高可读性 */
    resize: vertical;
    transition:
        border-color var(--transition-base),
        box-shadow var(--transition-base);
}

.content__textarea:hover {
    border-color: var(--color-border);
}

.content__textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    /* 将聚焦时的阴影缩小，让视觉更柔和 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Actions */
.panel__actions {
    display: flex;
    gap: var(--space-2);
    padding:;
    /* 可根据需求将按钮居中或右对齐 */
    justify-content: flex-start;
}

/* Buttons */
.action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: 0.4rem 0.6rem;
    border: none;
    border-radius: var(--radius-base);
    font-size: 0.68rem;
    font-weight: 500;
    cursor: pointer;
    transition:
        background-color var(--transition-base),
        box-shadow var(--transition-base),
        transform var(--transition-base);
}

.action-button--primary {
    background-color: var(--color-primary);
    color: #fff;
}
.action-button--primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    /* 去除或保留轻微的上移效果也行，这里稍作保留 */
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
    background-color: var(--color-background);
    color: var(--color-text);
    border: 1px solid var(--color-border);
}
.action-button--secondary:hover:not(:disabled) {
    background-color: var(--color-background);
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
    position: relative;
    color: transparent !important;
}
.is-loading::after {
    content: "";
    position: absolute;
    width: 1rem;
    height: 1rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
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
@media (max-width: 768px) {
    .text-processor__container {
        flex-direction: column;
        gap: var(--space-4);
    }

    /* 在小屏幕下可适当增大间距和调整按钮布局 */
    .panel__actions {
        flex-wrap: wrap;
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
