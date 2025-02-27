import { api } from "../api/axios.js";
import { SaveSentenceDTO, WordVO } from "@/renderer/types/api.ts";

/**
 * 解释
 */
export const sentenceService = {
  // 解释句子
  explain(sentence: string) {
    return api.post("/sentence/explain", { sentence });
  },
  // 解释句子中的单词
  explainWordInSentence(sentence0: string, word0: string) {
    const wordDto = {
      word: word0,
      belongSentence: sentence0,
    };
    return api.post("/sentence/explainWordInSentence", wordDto);
  },

  getSelectedWords(sentence: string) {
    return api.post("/sentence/getSelectedWords", { sentence });
  },
  saveSentence(sentence: SaveSentenceDTO) {
    return api.post("/sentence/save", sentence); // 直接发送 DTO 对象，不需要包装
  },
  /**
   *
   * 在wordVO结构改变的时候记得更新
   * @param word
   * @param contextType
   * @returns
   */
  saveWordInSentence(word: WordVO, contextType: string) {
    return api.post("/sentence/saveWordInSentence", {
      word: word.word,
      pronunciation: word.pronunciation,
      meaningInSentence: word.meaningInSentence,
      meanings: word.meanings,
      isWord: word.isWord,
      contextType: contextType,
    });
  },
  // 获取单词保存状态
  getWordSavedStatus(word: string) {
    return api.post("/sentence/getWordSavedStatus", { word });
  }
};
