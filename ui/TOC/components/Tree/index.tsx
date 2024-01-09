import { MouseEvent, useCallback, useMemo, useState } from 'react';
import { TOCTreeItem } from '../..';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Path } from 'slate';
import clsx from 'clsx';

interface TOCTreeProps {
  data: TOCTreeItem;
  level?: number;
  activePath?: number[];
}

const TOCTree = (props: TOCTreeProps) => {
  const { data, level = 0, activePath } = props;

  const editor = useSlate();

  const [isCollapse, setIsCollapse] = useState(false);

  const isActive = useMemo(() => {
    return activePath && Path.equals(data.path, activePath);
  }, [activePath, data.path]);

  const calcChildren = useMemo(() => {
    return isCollapse ? [] : data.children || [];
  }, [data.children, isCollapse]);

  const calcItemStyle = useMemo(() => {
    return {
      paddingLeft: `${(level + 1) * 16}px`,
    };
  }, [level]);

  const calcArrowStyle = useMemo(() => {
    return {
      transform: `rotate(${!isCollapse ? 90 : 0}deg)`,
    };
  }, [isCollapse]);

  const handleLink = useCallback(() => {
    const [node] = Editor.node(editor, data.path);
    const nodeDOM = ReactEditor.toDOMNode(editor, node);
    nodeDOM.scrollIntoView({
      block: 'center',
    });
  }, [data.path, editor]);

  const handleToggleCollapse = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      setIsCollapse(!isCollapse);
    },
    [isCollapse]
  );

  return (
    <>
      <div
        className={clsx(
          ' flex h-9 cursor-pointer items-center justify-between gap-2 px-4 text-sm transition-colors duration-100',
          isActive
            ? 'text-primary-50 hover:text-primary-100'
            : 'text-black-250 hover:text-black-600'
        )}
        style={calcItemStyle}
        title={data.label}
        onClick={handleLink}>
        <span className='flex-1 truncate'>{data.label}</span>
        {data.children?.length ? (
          <button
            className=' flex h-5 w-5 items-center justify-center'
            onClick={handleToggleCollapse}>
            <span
              className='iconfont icon-angle-right block shrink-0'
              style={calcArrowStyle}></span>
          </button>
        ) : null}
      </div>
      {calcChildren.map((item, index) => (
        <TOCTree
          key={index}
          data={item}
          level={level + 1}
          activePath={activePath}
        />
      ))}
    </>
  );
};

export default TOCTree;
