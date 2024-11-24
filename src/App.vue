<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="70px">
                <!-- <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
    <el-radio-button
        :value="isCollapse"
        @click="isCollapse = !isCollapse"
        >...</el-radio-button
    >
</el-radio-group> -->
                <el-menu
                    default-active="1"
                    class="el-menu-vertical-demo"
                    :collapse="isCollapse"
                    @open="handleOpen"
                    @close="handleClose"
                >
                    <el-sub-menu index="1">
                        <template #title>
                            <el-icon><location /></el-icon>
                            <span>Navigator One</span>
                        </template>
                        <el-menu-item-group>
                            <template #title><span>Group One</span></template>
                            <el-menu-item index="1-1">item one</el-menu-item>
                            <el-menu-item index="1-2">item two</el-menu-item>
                        </el-menu-item-group>
                        <el-menu-item-group title="Group Two">
                            <el-menu-item index="1-3">item three</el-menu-item>
                        </el-menu-item-group>
                        <el-sub-menu index="1-4">
                            <template #title><span>item four</span></template>
                            <el-menu-item index="1-4-1">item one</el-menu-item>
                        </el-sub-menu>
                    </el-sub-menu>
                    <el-menu-item index="2">
                        <el-icon><icon-menu /></el-icon>
                        <template #title>Navigator Two</template>
                    </el-menu-item>
                    <el-menu-item index="3" disabled>
                        <el-icon><document /></el-icon>
                        <template #title>Navigator Three</template>
                    </el-menu-item>
                    <el-menu-item index="4">
                        <el-icon><setting /></el-icon>
                        <template #title>Navigator Four</template>
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <el-main>
                <!-- 搜索句子区域 -->
                <div class="ei-main">
                    <SentenceInput
                        v-model="sentence"
                        :rows="5"
                        placeholder="请输入或粘贴文本..."
                        @translate="handleTranslate"
                        :isTranslating="isTranslating"
                        v-model:selectedText="selectedText"
                        ref="inputRef"
                    />
                </div>
                <div class="main-ei-container">
                    <div class="ei-search-container">
                        <el-button
                            type="primary"
                            @click="explain"
                            :loading="explainLoading"
                            style="marigin-bottom: 10px"
                            >解释</el-button
                        >
                        <!-- 搜索结果区域 -->
                        <div
                            class="ei-search-result-container"
                            v-show="
                                explanation != undefined &&
                                explanation.length > 10
                            "
                        >
                            <MarkdownViewer
                                :content="explanation"
                                :showToolbar="false"
                                @word-dbclick="handleSelectWord"
                                @word-select="handleSelectWord"
                                :autoDetectLanguage="true"
                            />
                        </div>
                    </div>
                    <!-- 单词展示区域 -->
                    <el-scrollbar height="400px">
                        <div class="ei-word-container">
                            <WordTag :words="words" />
                        </div>
                    </el-scrollbar>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
} from "@element-plus/icons-vue";
import WordTag from "./component/WordTag.vue";
import MarkdownViewer from "./component/MarkDownViewer.vue";
import SentenceInput from "./component/SentenceInput.vue";
import { sentenceService } from "./service/sentence.js";
import { cleanXMLContent } from "./util/stringUtils.js";

const isCollapse = ref(true);
// 当前搜索的句子
const sentence = ref("");
// 句子解析
const explanation = ref("");
// 当前选中的单词
const selectedText = ref("");

const handleSelectWord = (word) => {
    console.log(word);
    selectedText.value = word;
};
// 当前搜索的单词
const words = ref([]);
const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath);
};
const explainLoading = ref(false);
// 解释句子 async
const explain = async () => {
    explainLoading.value = true;
    // 发送请求
    try {
        sentenceService.explain(sentence.value).then((res) => {
            // 解析结果
            console.log(res);
            explanation.value = res;
            // explanation.value = cleanXMLContent(res);
            console.log("\n");
            console.log(explanation.value);
            explainLoading.value = false;
        });
    } catch (e) {
        explainLoading.value = false;
        console.log(e);
    }
};
// 解释句子中的单词
const isTranslating = ref(false);
const handleTranslate = (word) => {
    console.log(word);
    // alert("trigger");
    isTranslating.value = true;
    try {
        sentenceService
            .explainWordInSentence(sentence.value, word)
            .then((res) => {
                // 解析结果
                console.log(res);
                words.value.push(res);
                isTranslating.value = false;
            });
        // console.log("Selected text:", word);
    } catch (error) {
        console.log(e);
        isTranslating.value = false;
    }
};
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
}

.main-ei-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
/* 设置固定大小 */
.ei-search-container {
    width: 400px;
}

.ei-word-container {
    width: 240px;
}
</style>
