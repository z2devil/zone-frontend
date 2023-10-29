import { CustomEditor } from 'types/slate';
import { editorUtils } from '../../utils';
import { ElementType, MarkType } from '../../constans';

interface ToolbarProps {
  editor: CustomEditor;
}

const Toolbar = (props: ToolbarProps) => {
  const { editor } = props;

  return (
    <div className=' sticky top-0 flex h-12 items-center gap-2 px-5 text-black-600 shadow-main'>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.insertNode(editor, ElementType.HEADING_1);
        }}>
        <i className='iconfont icon-head-title-filled rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
      </button>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.insertNode(editor, ElementType.CODE_BLOCK);
        }}>
        <i className='iconfont icon-brackets-curly rounded p-1 text-xl font-bold transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
      </button>
      {/* 分割线 */}
      <div className='mx-1 h-full w-[1px] bg-gray-50'></div>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.toggleMark(editor, MarkType.BOLD);
        }}>
        <i className='iconfont icon-bold rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
      </button>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.toggleMark(editor, MarkType.ITALIC);
        }}>
        <i className='iconfont icon-italic rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
      </button>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.toggleMark(editor, MarkType.UNDERLINE);
        }}>
        <i className='iconfont icon-underline rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
      </button>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.toggleMark(editor, MarkType.STRIKETHROUGH);
        }}>
        <i className='iconfont icon-text-strike-through rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
      </button>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.toggleMark(editor, MarkType.CODE);
        }}>
        <i className='iconfont icon-arrow rounded p-1 text-xl font-bold transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
      </button>
    </div>
  );
};

export default Toolbar;
