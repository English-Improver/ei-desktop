import { SaveSentenceDTO, WordVO } from "@/types/api.ts";

interface StoredWord extends WordVO {
  sentenceId: number;
}

const LOCAL_STORAGE_KEYS = {
  SENTENCES: 'ei_sentences',
  WORDS: 'ei_words',
};

export const localStorageService = {
  // Save sentence and its explanation
  saveSentence(sentence: SaveSentenceDTO): SaveSentenceDTO {
    const sentences = this.getSentences();
    const newSentence = {
      ...sentence,
      sentenceId: Date.now(), // Generate a unique ID
      timestamp: new Date().toISOString(),
    };
    sentences.unshift(newSentence); // Add to beginning of array
    localStorage.setItem(LOCAL_STORAGE_KEYS.SENTENCES, JSON.stringify(sentences));
    return newSentence;
  },

  // Get all stored sentences
  getSentences(): SaveSentenceDTO[] {
    const sentencesStr = localStorage.getItem(LOCAL_STORAGE_KEYS.SENTENCES);
    return sentencesStr ? JSON.parse(sentencesStr) : [];
  },

  // Save word with its sentence relationship
  saveWord(word: WordVO, sentenceId: number): StoredWord {
    const words = this.getWords();
    const storedWord: StoredWord = {
      ...word,
      sentenceId,
      timestamp: new Date().toISOString(),
    };
    words.unshift(storedWord);
    localStorage.setItem(LOCAL_STORAGE_KEYS.WORDS, JSON.stringify(words));
    return storedWord;
  },

  // Get all stored words
  getWords(): StoredWord[] {
    const wordsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.WORDS);
    return wordsStr ? JSON.parse(wordsStr) : [];
  },

  // Get words for a specific sentence
  getWordsBySentenceId(sentenceId: number): StoredWord[] {
    const words = this.getWords();
    return words.filter(word => word.sentenceId === sentenceId);
  },

  // Clear all stored data
  clearAll() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SENTENCES);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.WORDS);
  }
};
