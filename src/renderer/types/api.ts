/**
 * http返回基本类型Result
 */

// 首先定义枚举类型（假设这些是 Java 中的枚举值）
export enum ResultType {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  ERROR = "ERROR",
  // 添加其他可能的结果类型
}

export enum Operation {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  QUERY = "QUERY",
  // 添加其他可能的操作类型
}

// 定义主要的 Result 接口
export interface Result {
  resultType: ResultType;
  operation: Operation;
  message: string;
  data: Record<string, any>; // 等同于 Java 的 Map<String, Object>
  content: string;
}

// 如果你需要泛型支持，可以这样定义
export interface ResultWithData<T> {
  resultType: ResultType;
  operation: Operation;
  message: string;
  data: T;
  content: string;
}

/**
 * 单词类型
 */

// 单词含义的类型定义
export interface WordMeaningDTO {
  property: string;
  meaning: string;
}

// 单词详情的类型定义
export interface WordVO {
  word: string;
  pronunciation: string;
  meaningInSentence: string;
  meanings: WordMeaningDTO[];
  isWord: number;
}

// SaveSentence 接口定义
export interface SaveSentenceDTO {
  // @NotBlank 对应的字段在 TypeScript 中标记为必填
  sentence: string;
  explanation: string;

  // 可选字段
  userId?: number;
  sentenceId?: number;
}
