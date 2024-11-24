<!-- SentenceInput.vue -->
<template>
    <div class="sentence-input">
        <el-input
            v-model="inputValue"
            :style="{ width: width }"
            :rows="rows"
            @mouseup="onSelect"
            @keyup="onSelect"
            @input="handleInput"
            type="textarea"
            :placeholder="placeholder"
        />
        <!-- 选中文本的信息展示 -->
        <transition name="fade">
            <div class="selection-info">
                <div class="selection-header">
                    <span>已选中:</span>
                    <el-button link @click="clearSelection" size="small">
                        清除
                    </el-button>
                </div>

                <el-input
                    v-model="localSelectedText"
                    type="text"
                    :rows="2"
                    class="selected-content"
                    @input="handleSelectedTextChange"
                />
                <!-- 操作按钮 -->
                <div class="action-buttons">
                    <el-button
                        type="primary"
                        size="small"
                        :loading="isTranslating"
                        :disabled="isTranslating"
                        @click="handleTranslate"
                    >
                        {{ isTranslating ? "翻译中..." : "翻译" }}
                    </el-button>
                    <el-button
                        type="info"
                        size="small"
                        :loading="isSearching"
                        :disabled="isSearching"
                        @click="handleSearch"
                    >
                        {{ isSearching ? "查询中..." : "查询" }}
                    </el-button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
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
        default: "400px",
    },
    rows: {
        type: Number,
        default: 5,
    },
    placeholder: {
        type: String,
        default: "Please input",
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
]);

const inputValue = ref(props.modelValue);
const localSelectedText = ref(props.selectedText);
const selectionRange = ref({ start: 0, end: 0 });

// 监听外部传入的 selectedText 变化
watch(
    () => props.selectedText,
    (newVal) => {
        localSelectedText.value = newVal;
    },
);

// 监听本地 selectedText 变化并同步到外部
watch(localSelectedText, (newVal) => {
    emit("update:selectedText", newVal);
});

const handleInput = (value) => {
    inputValue.value = value;
    emit("update:modelValue", value);
};

const handleSelectedTextChange = (value) => {
    localSelectedText.value = value;
};

const onSelect = (event) => {
    const textarea = event.target;
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

const clearSelection = () => {
    localSelectedText.value = "";
    selectionRange.value = { start: 0, end: 0 };
};

const setSelectedText = (text) => {
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
.sentence-input {
    display: flex;
    flex-direction: row;
    gap: 16px;
}

.selection-info {
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    min-width: 200px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.selection-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    color: #606266;
}

.selected-content {
    margin-bottom: 12px;
}

.selected-content :deep(.el-textarea__inner) {
    background-color: white;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    word-break: break-all;
    line-height: 1.5;
    color: #303133;
    font-size: 14px;
}

.action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.action-buttons .el-button {
    min-width: 80px;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}
</style>
