<template>
    <div class="word-list">
        <div
            v-for="(words, groupKey) in groupedWords"
            :key="groupKey"
            class="word-group"
        >
            <div class="group-header">
                {{ getGroupHeader(words[0]) }}
            </div>
            <div class="word-grid">
                <div
                    v-for="word in words"
                    :key="word.id"
                    class="word-item"
                    @click="$emit('select-word', word)"
                >
                    <h3>{{ word.word }}</h3>
                    <p class="word-brief">{{ word.meaning }}</p>
                    <span class="word-date">{{ formatDate(word.addedDate) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "WordList",
    props: {
        words: {
            type: Array,
            required: true,
            default: () => [],
        },
        currentView: {
            type: String,
            required: true,
            validator: (value) => ["date", "alphabet"].includes(value),
        },
    },
    computed: {
        groupedWords() {
            if (!this.words || !this.words.length) return {};

            return this.words.reduce((groups, word) => {
                if (!word.addedDate || !word.word) return groups;

                const key =
                    this.currentView === "date"
                        ? word.addedDate.substring(0, 7) // Group by month
                        : word.word[0].toUpperCase(); // Group by first letter

                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(word);
                return groups;
            }, {});
        },
    },
    methods: {
        getGroupHeader(word) {
            if (!word) return "";

            if (this.currentView === "date") {
                return this.formatMonth(word.addedDate);
            }
            return word.word[0].toUpperCase();
        },
        formatDate(date) {
            if (!date) return "";
            return new Date(date).toLocaleDateString();
        },
        formatMonth(date) {
            if (!date) return "";
            return new Date(date).toLocaleDateString("default", {
                year: "numeric",
                month: "long",
            });
        },
    },
};
</script>

<style>
.word-list {
    padding: 16px;
}

.word-group {
    margin-bottom: 20px;
}

.word-group:last-child {
    margin-bottom: 0;
}

.group-header {
    padding: 8px 12px;
    background-color: #f8f9fa;
    border-radius: 6px;
    color: #2c3e50;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 12px;
    position: sticky;
    top: 0;
    z-index: 1;
}

.word-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
}

.word-item {
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
    display: flex;
    flex-direction: column;
}

.word-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-color: #3498db;
}

.word-item h3 {
    margin: 0 0 4px 0;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.word-brief {
    margin: 0;
    color: #4a5568;
    font-size: 13px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    flex: 1;
}

.word-date {
    color: #718096;
    font-size: 12px;
    margin-top: 8px;
}

@media (max-width: 768px) {
    .word-list {
        padding: 12px;
    }

    .word-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
    }

    .word-item {
        padding: 10px;
    }

    .word-item h3 {
        font-size: 14px;
    }

    .word-brief {
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    .word-grid {
        grid-template-columns: 1fr;
    }
}
</style>
