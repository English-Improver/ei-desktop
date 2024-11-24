import { api } from "../api/axios";

/**
 * 解释
 */
export const sentenceService = {
  explain(sentence) {
    return api.post("/sentence/explain", { sentence });
  },
  // 解释句子中的单词
  explainWordInSentence(sentence0, word0) {
    const wordDto = {
      word: word0,
      belongSentence: sentence0,
    };
    return api.post("/sentence/explainWordInSentence", wordDto);
  },

  getSelectedWords(sentence) {
    return api.post("/sentence/getSelectedWords", { sentence });
  },
};
