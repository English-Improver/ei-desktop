<template>
    <div class="vocabulary-app">
        <header class="header">
            <h1>My Vocabulary Book</h1>
            <div class="view-controls">
                <select v-model="currentView" :disabled="loading">
                    <option value="date">By Date</option>
                    <option value="alphabet">Alphabetical</option>
                </select>
                <button @click="toggleOrder" :disabled="loading">
                    {{ isAscending ? "↑ Ascending" : "↓ Descending" }}
                </button>
            </div>
        </header>

        <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            {{ error }}
            <button class="retry-button" @click="fetchWords(true)">Retry</button>
        </div>

        <main class="content" :class="{ 'with-detail': selectedWord }">
            <div class="word-list-container">
                <div class="scrollable-content" ref="wordListContainer" @scroll="handleScroll">
                    <div v-if="loading && !words.length" class="loading-placeholder">
                        <div v-for="n in 5" :key="n" class="skeleton-item">
                            <div class="skeleton-header"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-text short"></div>
                        </div>
                    </div>
                    <template v-else>
                        <word-list
                            :words="sortedWords"
                            :current-view="currentView"
                            @select-word="selectWord"
                        />
                        <div v-if="loading" class="loading-more">
                            <div class="loading-spinner"></div>
                            <span>Loading more words...</span>
                        </div>
                        <div v-if="!loading && !hasMore" class="no-more-words">
                            No more words to load
                        </div>
                    </template>
                </div>
            </div>
            <div v-if="selectedWord" class="word-detail-container">
                <word-detail
                    :word="selectedWord"
                    @close="selectedWord = null"
                />
            </div>
        </main>
    </div>
</template>

<script>
import WordList from "../components/WordList.vue";
import WordDetail from "../components/WordDetail.vue";
import { api } from "../api/axios";

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
            words: [],
            loading: false,
            error: null,
            currentPage: 1,
            hasMore: true,
            pageSize: 10,
            scrollThreshold: 100,
            isLoadingMore: false
        };
    },
    computed: {
        sortedWords() {
            return this.words;
        },
    },
    methods: {
        toggleOrder() {
            this.isAscending = !this.isAscending;
            this.resetAndFetch();
        },
        selectWord(word) {
            this.selectedWord = word;
        },
        async fetchWords(reset = false) {
            if (reset) {
                this.currentPage = 1;
                this.words = [];
                this.hasMore = true;
                this.error = null;
                this.isLoadingMore = false;
            }

            if (!this.hasMore || this.isLoadingMore) {
                console.log('Skipping fetch:', { hasMore: this.hasMore, isLoadingMore: this.isLoadingMore });
                return;
            }

            this.isLoadingMore = true;
            if (this.currentPage === 1) {
                this.loading = true;
            }

            try {
                console.log('Fetching page:', this.currentPage);
                const response = await api.get('/api/words/with-sentences', {
                    params: {
                        userId: 1,
                        sortBy: this.currentView === 'date' ? 'time' : 'alphabet',
                        order: this.isAscending ? 'asc' : 'desc',
                        pageNum: this.currentPage,
                        pageSize: this.pageSize
                    }
                });
                
                if (response?.resultType === 'SUCCESS' && response.data?.page?.records) {
                    const wordsList = response.data.page.records;
                    const pageInfo = response.data.page;
                    
                    if (!Array.isArray(wordsList)) {
                        throw new Error('Words data is not in expected format');
                    }

                    if (wordsList.length === 0) {
                        console.log('No words in response');
                        this.hasMore = false;
                        return;
                    }

                    const newWords = wordsList.map(word => ({
                        id: word.wordId,
                        word: word.word,
                        pronunciation: word.pronunciation || '',
                        meaning: this.formatMeanings(word),
                        addedDate: word.addedDate || new Date().toISOString().split('T')[0],
                        sentences: (word.sentences || []).map(s => ({
                            id: s.sentenceId,
                            text: s.sentence || '',
                            grammar: s.meaning || ''
                        }))
                    }));

                    const isLastPage = this.currentPage >= pageInfo.pages;
                    console.log('Page info:', {
                        currentPage: this.currentPage,
                        totalPages: pageInfo.pages,
                        newWordsCount: newWords.length,
                        isLastPage
                    });

                    if (reset) {
                        this.words = newWords;
                    } else {
                        this.words = [...this.words, ...newWords];
                    }
                    
                    if (isLastPage) {
                        console.log('Reached last page');
                        this.hasMore = false;
                    } else {
                        this.currentPage++;
                        console.log('Moving to next page:', this.currentPage);
                    }
                } else {
                    throw new Error(response?.message || 'Invalid response format');
                }
            } catch (error) {
                console.error('Error fetching words:', error);
                this.error = 'Failed to load words. Please try again.';
                this.hasMore = false;
            } finally {
                this.loading = false;
                this.isLoadingMore = false;
            }
        },
        formatMeanings(word) {
            let meanings = [];
            
            if (word.phraseMeaning) {
                meanings.push(word.phraseMeaning);
            }
            
            if (word.wordMeanings && word.wordMeanings.length > 0) {
                const wordMeanings = word.wordMeanings
                    .filter(m => m && m.property && m.meaning)
                    .map(m => `${m.property}. ${m.meaning}`);
                meanings = meanings.concat(wordMeanings);
            }
            
            return meanings.join('; ');
        },
        handleScroll(event) {
            const container = event.target;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const scrollBottom = scrollHeight - scrollTop - clientHeight;
            
            console.log('Scroll Debug:', {
                scrollTop,
                scrollHeight,
                clientHeight,
                scrollBottom,
                threshold: this.scrollThreshold,
                loading: this.loading,
                hasMore: this.hasMore
            });
            
            if (scrollBottom <= this.scrollThreshold && !this.loading && this.hasMore) {
                console.log('Triggering fetchWords');
                this.fetchWords();
            }
        },
        resetAndFetch() {
            this.currentPage = 1;
            this.words = [];
            this.hasMore = true;
            this.fetchWords(true);
        }
    },
    watch: {
        currentView() {
            this.resetAndFetch();
        }
    },
    created() {
        this.fetchWords(true);
    },
};
</script>

<style>
.vocabulary-app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f7fafc;
}

.header {
    padding: 16px 24px;
    background: #ffffff;
    border-bottom: 1px solid #edf2f7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 500;
    color: #1a202c;
}

.view-controls {
    display: flex;
    gap: 12px;
    align-items: center;
}

.view-controls select {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: #ffffff;
    color: #4a5568;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.view-controls select:hover:not(:disabled) {
    border-color: #4299e1;
}

.view-controls button {
    padding: 8px 12px;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.view-controls button:hover:not(:disabled) {
    background-color: #3182ce;
}

.content {
    flex: 1;
    display: flex;
    padding: 16px;
    gap: 16px;
    overflow: hidden;
    min-height: 0;
}

.word-list-container {
    flex: 1;
    min-width: 0;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
}

.scrollable-content {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    scroll-behavior: smooth;
}

.scrollable-content::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
    background: transparent;
}

.scrollable-content::-webkit-scrollbar-thumb {
    background-color: rgba(203, 213, 224, 0.4);
    border-radius: 3px;
    transition: background-color 0.2s;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
    background-color: rgba(160, 174, 192, 0.6);
}

.loading-placeholder {
    padding: 16px;
    display: grid;
    gap: 16px;
    animation: fadeIn 0.3s ease;
}

.skeleton-item {
    background: #ffffff;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.skeleton-header {
    height: 24px;
    background: linear-gradient(
        90deg,
        rgba(237, 242, 247, 0.6) 25%,
        rgba(237, 242, 247, 0.9) 50%,
        rgba(237, 242, 247, 0.6) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
    border-radius: 4px;
    margin-bottom: 12px;
    width: 60%;
}

.skeleton-text {
    height: 16px;
    background: linear-gradient(
        90deg,
        rgba(237, 242, 247, 0.6) 25%,
        rgba(237, 242, 247, 0.9) 50%,
        rgba(237, 242, 247, 0.6) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
    border-radius: 4px;
    margin-bottom: 8px;
}

.skeleton-text.short {
    width: 40%;
}

.loading-more {
    padding: 24px;
    text-align: center;
    color: #718096;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(to bottom, transparent, rgba(247, 250, 252, 0.8) 20%);
    backdrop-filter: blur(4px);
    position: sticky;
    bottom: 0;
    margin-top: -24px;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #4299e1;
    border-radius: 50%;
    animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.no-more-words {
    padding: 24px;
    text-align: center;
    color: #718096;
    font-size: 0.875rem;
    background: linear-gradient(to bottom, transparent, rgba(247, 250, 252, 0.8) 20%);
    backdrop-filter: blur(4px);
    position: sticky;
    bottom: 0;
    margin-top: -24px;
}

.error-message {
    margin: 12px;
    padding: 12px;
    background-color: #fff5f5;
    border: 1px solid #feb2b2;
    border-radius: 6px;
    color: #c53030;
    display: flex;
    align-items: center;
}

.error-icon {
    margin-right: 8px;
}

.retry-button {
    margin-left: auto;
    padding: 6px 12px;
    background-color: #c53030;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.retry-button:hover {
    background-color: #9b2c2c;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.word-detail-container {
    width: 0;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
}

.content.with-detail .word-detail-container {
    width: 360px;
    opacity: 1;
}

@media (max-width: 768px) {
    .header {
        padding: 12px 16px;
    }

    .content {
        padding: 12px;
        gap: 12px;
    }

    .content.with-detail .word-detail-container {
        width: 320px;
    }
}

@media (max-width: 640px) {
    .header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .view-controls {
        flex-direction: row;
        justify-content: space-between;
    }

    .view-controls select,
    .view-controls button {
        flex: 1;
    }
}
</style>
