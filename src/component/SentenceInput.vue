<!-- SentenceInput.vue -->
<template>
    <div class="sentence-input-container">
        <div class="input-section">
            <div class="input-content">
                <div class="input-header">
                    <div class="left-hint">输入文本</div>
                    <div class="right-hint" v-if="inputValue">
                        {{ inputValue.length }} 个字符
                    </div>
                </div>
                <el-input
                    v-model="inputValue"
                    :style="{ width: '100%' }"
                    :rows="3"
                    @mouseup="onSelect"
                    @keyup="onSelect"
                    @input="handleInput"
                    type="textarea"
                    :placeholder="placeholder"
                    resize="none"
                />
                <div class="input-actions">
                    <div class="action-group">
                        <el-button 
                            type="primary" 
                            size="small"
                            :loading="isExplain"
                            :disabled="!inputValue"
                            @click="handleExplain"
                        >
                            解释句子
                        </el-button>
                        <el-button 
                            type="default" 
                            size="small"
                            :disabled="!inputValue"
                            @click="handleClear"
                        >
                            清空内容
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 选中文本的信息展示 -->
        <div class="selection-info">
            <div class="selection-header">
                <span class="header-title">已选中文本</span>
                <el-button 
                    link 
                    @click="clearSelection" 
                    size="small" 
                    type="info"
                    :disabled="!localSelectedText"
                >
                    清除
                </el-button>
            </div>

            <el-input
                v-model="localSelectedText"
                type="textarea"
                :rows="3"
                class="selected-content"
                @input="handleSelectedTextChange"
                resize="none"
                placeholder="选中的文本将显示在这里..."
            />
            
            <div class="action-buttons">
                <el-button
                    type="primary"
                    size="small"
                    :loading="isTranslating"
                    :disabled="isTranslating || !localSelectedText"
                    @click="handleTranslate"
                >
                    {{ isTranslating ? "翻译中..." : "翻译" }}
                </el-button>
                <el-button
                    type="info"
                    size="small"
                    :loading="isSearching"
                    :disabled="isSearching || !localSelectedText"
                    @click="handleSearch"
                >
                    {{ isSearching ? "查询中..." : "查询" }}
                </el-button>
            </div>
        </div>
    </div>
</template>

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
        default: false
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
    "clear"
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

watch(localSelectedText, (newVal) => {
    emit("update:selectedText", newVal);
});

const handleInput = (value: string) => {
    inputValue.value = value;
    emit("update:modelValue", value);
};

const handleSelectedTextChange = (value: string) => {
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

<style scoped>
.sentence-input-container {
    display: flex;
    gap: 12px;
    width: 100%;
    align-items: stretch;
}

.input-section {
    flex: 1;
    min-width: 300px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 12px;
    display: flex;
    flex-direction: column;
}

.input-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
}

.input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
}

.left-hint {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
}

.right-hint {
    font-size: 12px;
    color: #909399;
}

.input-section :deep(.el-textarea) {
    flex: 1;
}

.input-section :deep(.el-textarea__inner) {
    border-radius: 6px;
    transition: all 0.3s ease;
    background-color: #ffffff;
    height: 100% !important;
    border-color: #dcdfe6;
}

.input-section :deep(.el-textarea__inner:hover) {
    border-color: #c0c4cc;
}

.input-section :deep(.el-textarea__inner:focus) {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.input-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
    padding: 0 4px;
}

.action-group {
    display: flex;
    gap: 12px;
}

.action-group .el-button {
    min-width: 84px;
    border-radius: 6px;
    font-weight: 500;
}

.selection-info {
    width: 260px;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 12px;
}

.selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.header-title {
    color: #606266;
    font-size: 14px;
    font-weight: 500;
}

.selected-content {
    flex: 1;
    margin-bottom: 8px;
}

.selected-content :deep(.el-textarea) {
    height: 100%;
}

.selected-content :deep(.el-textarea__inner) {
    background-color: white;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    word-break: break-all;
    line-height: 1.5;
    color: #303133;
    font-size: 14px;
    resize: none;
    height: 100% !important;
}

.selected-content :deep(.el-textarea__inner:hover) {
    border-color: #c0c4cc;
}

.selected-content :deep(.el-textarea__inner:focus) {
    border-color: #409eff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 0 4px;
}

.action-buttons .el-button {
    flex: 1;
    min-width: 84px;
    border-radius: 6px;
    font-weight: 500;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
    .sentence-input-container {
        flex-direction: column;
    }
    
    .input-section, .selection-info {
        width: 100%;
    }

    .action-group, .action-buttons {
        justify-content: stretch;
    }
}
</style>