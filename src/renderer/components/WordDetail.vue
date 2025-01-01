// components/WordDetail.vue
<template>
    <div class="word-detail">
        <div class="detail-header">
            <h2>{{ word.word }}</h2>
            <button class="close-button" @click="$emit('close')">×</button>
        </div>

        <div class="detail-content">
            <div class="meaning-section">
                <h3>Meaning</h3>
                <p>{{ word.meaning }}</p>
            </div>

            <div class="sentences-section">
                <h3>Example Sentences</h3>
                <div v-for="(sentence, index) in word.sentences" :key="index" class="sentence-item">
                    <p class="sentence-text">{{ sentence.text }}</p>
                    <div class="grammar-note">
                        <span class="grammar-label">Grammar Note:</span>
                        {{ sentence.grammar }}
                    </div>
                </div>
            </div>

            <div class="meta-info">
                <span>Added on {{ formatDate(word.addedDate) }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'WordDetail',
    props: {
        word: {
            type: Object,
            required: true
        }
    },
    methods: {
        formatDate(date) {
            return new Date(date).toLocaleDateString('default', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    }
}
</script>

<style>
.word-detail {
    background: white;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8f8f8;
    border-bottom: 1px solid #eee;
}

.detail-header h2 {
    margin: 0;
    color: #333;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0 8px;
}

.close-button:hover {
    color: #333;
}

.detail-content {
    padding: 20px;
}

.meaning-section,
.sentences-section {
    margin-bottom: 24px;
}

.meaning-section h3,
.sentences-section h3 {
    color: #666;
    font-size: 1.1em;
    margin-bottom: 12px;
}

.sentence-item {
    margin-bottom: 16px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 6px;
}

.sentence-text {
    margin: 0 0 8px 0;
    color: #333;
}

.grammar-note {
    font-size: 0.9em;
    color: #666;
}

.grammar-label {
    color: #888;
    font-weight: 500;
}

.meta-info {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #eee;
    color: #999;
    font-size: 0.9em;
}
</style>
