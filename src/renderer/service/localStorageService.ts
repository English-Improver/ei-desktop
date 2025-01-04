import { SaveSentenceDTO, WordVO } from "@/renderer/types/api.ts";
import { settingsService } from './settingsService';

interface StoredWord extends WordVO {
  sentenceId: number;
}

const LOCAL_STORAGE_KEYS = {
  SENTENCES: 'ei_sentences',
  WORDS: 'ei_words',
};

export const localStorageService = {
  // Save sentence and its explanation
  saveSentence(sentence: SaveSentenceDTO) {
    try {
      const settings = settingsService.getSettings();
      // 获取现有的句子列表
      const sentences = this.getSentences();
      
      // 查找是否已存在相同的句子
      const existingIndex = sentences.findIndex(s => s.sentence === sentence.sentence);
      
      if (existingIndex !== -1) {
        // 如果存在，更新现有句子
        sentences[existingIndex] = {
          ...sentences[existingIndex],
          ...sentence,
          words: sentence.words || sentences[existingIndex].words || []
        };
      } else {
        // 如果不存在，添加新句子
        sentences.unshift(sentence);
        // 限制句子数量
        if (sentences.length > settings.maxSentences) {
          sentences.pop();
        }
      }
      
      // 保存更新后的列表
      localStorage.setItem(LOCAL_STORAGE_KEYS.SENTENCES, JSON.stringify(sentences));
      return sentence;
    } catch (error) {
      console.error('Save sentence failed:', error);
      throw error;
    }
  },

  // Save word with its sentence relationship
  saveWord(word: WordVO): StoredWord {
    try {
      const settings = settingsService.getSettings();
      
      // 获取现有的单词列表
      const words = this.getWords();

      // 限制单词数量
      if (words.length >= settings.maxWords) {
        throw new Error(`Cannot save more than ${settings.maxWords} words.`);
      }
      
      const existingIndex = words.findIndex(w => w.word === word.word);
      
      if (existingIndex !== -1) {
        // 更新现有单词
        words[existingIndex] = { ...words[existingIndex], ...word };
      } else {
        // 添加新单词
        words.unshift(word);
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEYS.WORDS, JSON.stringify(words));
      return words[existingIndex !== -1 ? existingIndex : 0];
    } catch (error) {
      console.error('Save word failed:', error);
      throw error;
    }
  },

  // Get all stored sentences
  getSentences(): SaveSentenceDTO[] {
    try {
      const sentences = localStorage.getItem(LOCAL_STORAGE_KEYS.SENTENCES);
      return sentences ? JSON.parse(sentences) : [];
    } catch (error) {
      console.error('Get sentences failed:', error);
      return [];
    }
  },

  // Get all stored words
  getWords(): StoredWord[] {
    try {
      const words = localStorage.getItem(LOCAL_STORAGE_KEYS.WORDS);
      return words ? JSON.parse(words) : [];
    } catch (error) {
      console.error('Get words failed:', error);
      return [];
    }
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
