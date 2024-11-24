export function cleanXMLContent(text, options = {}) {
  const defaultOptions = {
    removeTags: true, // 移除XML标签
    removeEmptyLines: true, // 移除空行
    removeBrackets: false, // 移除方括号[]
    removeDashes: false, // 移除破折号-
    removeExtraSpaces: true, // 移除多余空格
  };

  const settings = { ...defaultOptions, ...options };
  let cleanText = text;

  // 移除XML标签
  if (settings.removeTags) {
    cleanText = cleanText.replace(/<[^>]*>/g, "");
  }

  // 移除方括号及其内容
  if (settings.removeBrackets) {
    cleanText = cleanText.replace(/\[.*?\]/g, "");
  }

  // 移除破折号
  if (settings.removeDashes) {
    cleanText = cleanText.replace(/^-\s*/gm, "");
  }

  // 移除多余空格
  if (settings.removeExtraSpaces) {
    cleanText = cleanText.replace(/\s+/g, " ");
  }

  // 移除多余的空行
  if (settings.removeEmptyLines) {
    cleanText = cleanText.replace(/^\s*[\r\n]/gm, "\n");
  }

  // 移除开头和结尾的空白
  return cleanText.trim();
}
