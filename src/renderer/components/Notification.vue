<template>
    <Teleport to="body">
        <div v-if="visible" class="notification" :class="type">
            {{ message }}
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');
const type = ref('info');

const show = (msg: string, msgType: 'success' | 'warning' | 'error' = 'info') => {
    message.value = msg;
    type.value = msgType;
    visible.value = true;
    setTimeout(() => {
        visible.value = false;
    }, 3000);
};

defineExpose({
    show
});
</script>

<style scoped>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    z-index: 9999;
    transition: all 0.3s;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.success {
    background-color: #67c23a;
}

.warning {
    background-color: #e6a23c;
}

.error {
    background-color: #f56c6c;
}

.info {
    background-color: #909399;
}
</style>
