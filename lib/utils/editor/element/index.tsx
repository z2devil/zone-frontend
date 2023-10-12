import marked from '../marked';
import { forwardMatch } from '../match';
import { createRoot } from 'react-dom/client';

export const PLACEHOLDER_CHAR = '&#xFEFF;';

const createElement = (tagName: string, className?: string) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  return element;
};

const createPlaceholderElement = () => {
  const placeholder = document.createElement('span');
  placeholder.className = 'placeholder';
  placeholder.innerHTML = PLACEHOLDER_CHAR;
  return placeholder;
};

const parseInline = async (selection: Selection) => {
  const anchorNode = selection.anchorNode;
  const focusNode = selection.focusNode;
  if (!anchorNode || !focusNode) return;

  // 获取当前选区
  const currentRange = selection.getRangeAt(0);
  console.log('[ currentRange ]', currentRange);

  // 获取所在行当前选区前的区域
  const prevRange = document.createRange();
  prevRange.setStart(anchorNode, 0);
  prevRange.setEnd(currentRange.startContainer, currentRange.startOffset);

  // 获取当前选区前的文本
  const prevRangeText = prevRange.toString();
  console.log('[ prevRangeText ]', prevRangeText);

  // 获取当前选区前的文本匹配结果
  const matchResult = forwardMatch(prevRangeText.trimEnd());
  console.log('[ matchResult ]', matchResult);

  if (!matchResult.matchedString) return;

  // 转换为 HTML
  const HTML = await marked.parseInline(matchResult.matchedString, {
    async: true,
  });
  console.log('[ HTML ]', HTML);

  // 替换为 HTML
  const replaceRange = document.createRange();
  replaceRange.setStart(prevRange.startContainer, matchResult.start);
  replaceRange.setEnd(prevRange.startContainer, matchResult.end);
  replaceRange.deleteContents();

  const nextElement = document.createElement('element');
  nextElement.innerHTML = HTML.trim();

  // // TODO: 规范化 react-dom 的使用
  // const handleNextElementClick = () => {
  //   console.log('nextElement clicked');
  // };

  // const root = createRoot(nextElement);
  // root.render(
  //   <span
  //     className='inline'
  //     onClick={handleNextElementClick}
  //     dangerouslySetInnerHTML={{
  //       __html: HTML,
  //     }}></span>
  // );

  const placeholder = createPlaceholderElement();

  replaceRange.insertNode(placeholder);
  replaceRange.insertNode(nextElement);
  replaceRange.collapse(false);

  // 重新设置选区（光标位置）
  selection.removeAllRanges();
  // selection.addRange(replaceRange);
  selection.collapse(placeholder, 1);
};

const elementUtils = {
  createElement,
  parseInline,
};

export default elementUtils;
