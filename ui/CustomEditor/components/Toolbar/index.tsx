import { CustomEditor } from 'types/slate';
import { editorUtils } from '../../utils';
import { MarkType } from '../../constans';

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
          editorUtils.toggleMark(editor, MarkType.BOLD);
        }}>
        <i className='iconfont icon-bold rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
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
          editorUtils.toggleMark(editor, MarkType.CODE);
        }}>
        <i className='iconfont icon-brackets-curly rounded p-1 text-xl transition-colors duration-100 hover:bg-gray-50 hover:text-black-900'></i>
      </button>
    </div>
  );
};

export default Toolbar;
