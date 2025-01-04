<template>
    <div class="settings-container">
        <div class="settings-header">
            <h2>设置</h2>
        </div>
        <div class="settings-content">
            <div class="settings-section">
                <h3>本地存储设置</h3>
                <div class="setting-item">
                    <label>最大保存句子数量</label>
                    <div class="input-group">
                        <input 
                            type="number" 
                            v-model="settings.maxSentences" 
                            min="1" 
                            max="100"
                            @change="handleSettingChange"
                        >
                        <span class="unit">个</span>
                    </div>
                </div>
                <div class="setting-item">
                    <label>最大保存单词数量</label>
                    <div class="input-group">
                        <input 
                            type="number" 
                            v-model="settings.maxWords" 
                            min="1" 
                            max="200"
                            @change="handleSettingChange"
                        >
                        <span class="unit">个</span>
                    </div>
                </div>
            </div>
            <div class="settings-actions">
                <button class="save-button" @click="saveSettings">保存设置</button>
                <button class="reset-button" @click="resetSettings">重置默认</button>
            </div>
        </div>
        <Notification ref="notificationRef" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settingsService } from '../service/settingsService';
import Notification from '../components/Notification.vue';

const notificationRef = ref();
const settings = ref(settingsService.getSettings());
const hasChanges = ref(false);

// 处理设置变更
const handleSettingChange = () => {
    hasChanges.value = true;
};

// 保存设置
const saveSettings = async () => {
    try {
        await settingsService.saveSettings(settings.value);
        hasChanges.value = false;
        notificationRef.value?.show('设置已保存成功', 'success');
    } catch (error) {
        console.error('Failed to save settings:', error);
        notificationRef.value?.show('设置保存失败', 'error');
    }
};

// 重置设置
const resetSettings = () => {
    settings.value = settingsService.getSettings();
    hasChanges.value = false;
    notificationRef.value?.show('设置已重置', 'success');
};

onMounted(() => {
    // 初始化设置
    settings.value = settingsService.getSettings();
});
</script>

<style scoped>
.settings-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.settings-header {
    margin-bottom: 30px;
}

.settings-header h2 {
    font-size: 24px;
    color: #333;
}

.settings-section {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-section h3 {
    font-size: 18px;
    color: #444;
    margin-bottom: 20px;
}

.setting-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.setting-item label {
    flex: 1;
    font-size: 16px;
    color: #666;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.input-group input {
    width: 80px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.unit {
    color: #666;
}

.settings-actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    margin-top: 30px;
}

button {
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.save-button {
    background-color: #4CAF50;
    color: white;
    border: none;
}

.save-button:hover {
    background-color: #45a049;
}

.reset-button {
    background-color: #f5f5f5;
    color: #666;
    border: 1px solid #ddd;
}

.reset-button:hover {
    background-color: #e8e8e8;
}
</style>
