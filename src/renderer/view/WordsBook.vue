<template>
    <div class="vocabulary-app">
        <header class="header">
            <h1>My Vocabulary Book</h1>
            <div class="view-controls">
                <select v-model="currentView">
                    <option value="date">By Date</option>
                    <option value="alphabet">Alphabetical</option>
                </select>
                <button @click="toggleOrder">
                    {{ isAscending ? "↑ Ascending" : "↓ Descending" }}
                </button>
            </div>
        </header>

        <main class="content">
            <word-list
                :words="sortedWords"
                :current-view="currentView"
                @select-word="selectWord"
            />
            <word-detail
                v-if="selectedWord"
                :word="selectedWord"
                @close="selectedWord = null"
            />
        </main>
    </div>
</template>

<script>
import WordList from "../components/WordList.vue";
import WordDetail from "../components/WordDetail.vue";

export default {
    name: "WordsBoook",
    components: {
        WordList,
        WordDetail,
    },
    data() {
        return {
            currentView: "date",
            isAscending: true,
            selectedWord: null,
            words: [
                {
                    id: 1,
                    word: "ephemeral",
                    addedDate: "2024-03-01",
                    meaning: "lasting for a very short time",
                    sentences: [
                        {
                            text: "The beauty of cherry blossoms is ephemeral, lasting only a few days.",
                            grammar: "Used as an adjective before a noun",
                        },
                        {
                            text: "Social media posts often seem ephemeral, quickly forgotten in the constant stream of information.",
                            grammar: "Used as a predicative adjective",
                        },
                    ],
                },
                // More words can be added here
            ],
        };
    },
    computed: {
        sortedWords() {
            let sorted = [...this.words];
            if (this.currentView === "date") {
                sorted.sort((a, b) => {
                    return this.isAscending
                        ? a.addedDate.localeCompare(b.addedDate)
                        : b.addedDate.localeCompare(a.addedDate);
                });
            } else {
                sorted.sort((a, b) => {
                    return this.isAscending
                        ? a.word.localeCompare(b.word)
                        : b.word.localeCompare(a.word);
                });
            }
            return sorted;
        },
    },
    methods: {
        toggleOrder() {
            this.isAscending = !this.isAscending;
        },
        selectWord(word) {
            this.selectedWord = word;
        },
    },
};
</script>

<style>
.vocabulary-app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.view-controls {
    display: flex;
    gap: 10px;
}

.view-controls select,
.view-controls button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
}

.content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
}

@media (max-width: 768px) {
    .content {
        grid-template-columns: 1fr;
    }
}
</style>
