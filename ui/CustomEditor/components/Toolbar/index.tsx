import { CustomEditor } from 'types/slate';
import { editorUtils } from '../../utils';

interface ToolbarProps {
  editor: CustomEditor;
}

const Toolbar = (props: ToolbarProps) => {
  const { editor } = props;

  return (
    <div className=' sticky top-0 flex h-12 items-center gap-2 px-5 shadow-main'>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.toggleBoldMark(editor);
        }}>
        <i className='iconfont icon-bold rounded p-1 text-xl hover:bg-gray-50'></i>
      </button>
      <button
        onMouseDown={event => {
          event.preventDefault();
          editorUtils.toggleCodeBlock(editor);
        }}>
        <i className='iconfont icon-brackets-curly rounded p-1 text-xl hover:bg-gray-50'></i>
      </button>
    </div>
  );
};

export default Toolbar;
