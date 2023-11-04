import { INLINE_ELEMENTS } from './marked/constans';

interface MatchResult {
  matchedString: string | null;
  start: number;
  end: number;
}

const PATTERNS = (
  Object.values(INLINE_ELEMENTS)
    .map(element => {
      return element?.pattern || null;
    })
    .filter(Boolean) as string[]
).sort((a, b) => b.length - a.length);

/**
 * 向前匹配
 * @param input 输入的字符串
 * @param patterns 需要匹配的字符
 * @returns 匹配结果，包含匹配到的字符串、开始位置、结束位置。
 * 举个例子：
 * 今晚月色真美，我想吃**月饼**
 * 匹配到的字符串是 **月饼**，开始位置是 10，结束位置是 16。
 */
const forwardMatch = (input: string, patterns = PATTERNS): MatchResult => {
  console.log('[ forwardMatch ]', input, patterns);

  for (const pattern of patterns) {
    if (input.endsWith(pattern)) {
      const prevInput = input.slice(0, -pattern.length);
      console.log('[ prevInput ]', prevInput);
      const startIndex = prevInput.lastIndexOf(pattern);
      console.log('[ startIndex ]', startIndex);
      const matchedString = input.slice(startIndex);
      return { matchedString, start: startIndex, end: input.length };
    }
  }

  return { matchedString: null, start: -1, end: -1 };
};

export { forwardMatch };
