import { editorUtils } from '../../utils';
import { BlockElementType, InlineElementType, MarkType } from '../../constants';
import clsx from 'clsx';
import { useSlate } from 'slate-react';
import { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { Element, Transforms } from 'slate';

interface ToolbarProps {
  className?: string;
  fullScreen?: boolean;
  onChangeFullScreen?: (fullScreen: boolean) => void;
}

const Toolbar = (props: ToolbarProps) => {
  const { className, fullScreen, onChangeFullScreen } = props;

  const editor = useSlate();

  const isHeadingActive = () => {
    return (
      editorUtils.isElementActive(editor, BlockElementType.HEADING_1) ||
      editorUtils.isElementActive(editor, BlockElementType.HEADING_2) ||
      editorUtils.isElementActive(editor, BlockElementType.HEADING_3) ||
      editorUtils.isElementActive(editor, BlockElementType.HEADING_4) ||
      editorUtils.isElementActive(editor, BlockElementType.HEADING_5) ||
      editorUtils.isElementActive(editor, BlockElementType.HEADING_6)
    );
  };

  const handleFullScreen = useCallback(() => {
    onChangeFullScreen?.(!fullScreen);
  }, [fullScreen, onChangeFullScreen]);

  const handleInsertCodeBlock = useCallback(() => {
    // 如果当前选区在代码块中，则不进行包裹
    if (editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK)) {
      return;
    }
    Transforms.wrapNodes(
      editor,
      { type: BlockElementType.CODE_BLOCK, children: [] },
      {
        match: n =>
          Element.isElement(n) && n.type === BlockElementType.PARAGRAPH,
        split: true,
      }
    );
  }, [editor]);

  return (
    <div
      className={clsx(
        twMerge(
          ' sticky top-0 flex h-12 flex-shrink-0 px-5 text-black-600 shadow-main',
          className
        )
      )}>
      <div className=' flex h-full w-full flex-grow items-center gap-2 overflow-auto'>
        {/* 标题 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.insertBlockNode(editor, BlockElementType.HEADING_1);
          }}>
          <i
            className={clsx(
              'iconfont icon-head-title-filled rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50',
              isHeadingActive() ? 'text-primary-50' : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 代码块 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            handleInsertCodeBlock();
          }}>
          <i
            className={clsx(
              'iconfont icon-brackets-curly rounded p-1 text-xl font-bold transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isElementActive(editor, BlockElementType.CODE_BLOCK)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 图片 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.insertBlockNode(editor, BlockElementType.IMAGE);
            editorUtils.insertBlockNode(editor, BlockElementType.PARAGRAPH);
          }}>
          <i
            className={clsx(
              'iconfont icon-image rounded p-1 text-xl font-bold transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isElementActive(editor, BlockElementType.IMAGE)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 视频 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.insertBlockNode(editor, BlockElementType.VIDEO);
            editorUtils.insertBlockNode(editor, BlockElementType.PARAGRAPH);
          }}>
          <i
            className={clsx(
              'iconfont icon-film rounded p-1 text-xl font-bold transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isElementActive(editor, BlockElementType.VIDEO)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 音乐 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.insertBlockNode(editor, BlockElementType.MUSIC);
          }}>
          <i
            className={clsx(
              'iconfont icon-music rounded p-1 text-xl font-bold transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isElementActive(editor, BlockElementType.MUSIC)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 画板 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.insertBlockNode(editor, BlockElementType.WHITE_BOARD);
          }}>
          <i
            className={clsx(
              'iconfont icon-white-board rounded p-1 text-xl font-black transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isElementActive(editor, BlockElementType.WHITE_BOARD)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* spline */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.insertBlockNode(editor, BlockElementType.CUBE);
          }}>
          <i
            className={clsx(
              'iconfont icon-cube rounded p-1 text-xl font-black transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isElementActive(editor, BlockElementType.CUBE)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 分割线 */}
        <div className='mx-1 h-1/3 w-[1px] bg-gray-50'></div>
        {/* 粗体 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.toggleMark(editor, MarkType.BOLD);
          }}>
          <i
            className={clsx(
              'iconfont icon-bold rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isMarkActive(editor, MarkType.BOLD)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 斜体 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.toggleMark(editor, MarkType.ITALIC);
          }}>
          <i
            className={clsx(
              'iconfont icon-italic rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isMarkActive(editor, MarkType.ITALIC)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 下划线 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.toggleMark(editor, MarkType.UNDERLINE);
          }}>
          <i
            className={clsx(
              'iconfont icon-underline rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isMarkActive(editor, MarkType.UNDERLINE)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 删除线 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.toggleMark(editor, MarkType.STRIKETHROUGH);
          }}>
          <i
            className={clsx(
              'iconfont icon-text-strike-through rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isMarkActive(editor, MarkType.STRIKETHROUGH)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 代码段 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.insertInlineNode(editor, InlineElementType.CODE_SPAN);
          }}>
          <i
            className={clsx(
              'iconfont icon-arrow rounded p-1 text-xl font-bold transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isElementActive(editor, InlineElementType.CODE_SPAN)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
        {/* 链接 */}
        <button
          onMouseDown={event => {
            event.preventDefault();
            editorUtils.insertInlineNode(editor, InlineElementType.LINK);
          }}>
          <i
            className={clsx(
              'iconfont icon-link rounded p-1 text-xl font-bold transition-colors duration-100 hover:bg-gray-50',
              editorUtils.isElementActive(editor, InlineElementType.LINK)
                ? 'text-primary-50'
                : 'hover:text-black-900'
            )}></i>
        </button>
      </div>
      {/* 分割线 */}
      <div className=' flex h-full flex-shrink-0 items-center gap-2 border-l border-gray-50 pl-2'>
        <button
          onMouseDown={event => {
            event.preventDefault();
            handleFullScreen();
          }}>
          <i
            className={clsx(
              'iconfont rounded p-1 text-lg font-bold transition-colors duration-100 hover:bg-gray-50 hover:text-black-900',
              fullScreen ? 'icon-compress-alt' : 'icon-expand-alt'
            )}></i>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
