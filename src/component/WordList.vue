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
    /* border: 1px solid #eee; */
    /* border-radius: 8px; */
    overflow: hidden;
}

.group-header {
    background: #f5f5f5;
    padding: 8px 16px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
}

.word-item {
    padding: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #eee;
}

.word-item:hover {
    background-color: #f9f9f9;
}

.word-item h3 {
    margin: 0 0 8px 0;
    color: #333;
}

.word-brief {
    margin: 0;
    color: #666;
    font-size: 0.9em;
}

.word-date {
    display: block;
    margin-top: 8px;
    color: #999;
    font-size: 0.8em;
}
</style>
