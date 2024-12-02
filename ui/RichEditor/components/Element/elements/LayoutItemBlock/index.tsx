import { ReactEditor, useReadOnly, useSlateStatic } from 'slate-react';
import { LayoutItemBlockElement } from 'types/slate';
import clsx from 'clsx';
import { useMemo } from 'react';
import style from './style.module.scss';
import { useOverride } from '../LayoutBlock/components/OverrideProvider';
import { Path } from 'slate';

interface LayoutItemProps {
  attributes: any;
  children: any;
  element: LayoutItemBlockElement;
}

const LayoutItemBlock = ({
  attributes,
  children,
  element,
}: LayoutItemProps) => {
  const readOnly = useReadOnly();

  const override = useOverride();

  const editor = useSlateStatic();

  const index = useMemo(() => {
    const path = ReactEditor.findPath(editor, element);
    return Path.isPath(path) ? path[path.length - 1] : 0;
  }, [editor, element]);

  const isResizing = useMemo(
    () => override?.isResizing,
    [override?.isResizing]
  );

  const currentWidth = useMemo(
    () => (isResizing ? override?.widths[index] : element.width),
    [element.width, index, isResizing, override?.widths]
  );

  const styles = useMemo(
    () => ({
      width: `${currentWidth}%`,
    }),
    [currentWidth]
  );

  return (
    <div {...attributes} className={style.layoutItemContainer} style={styles}>
      <div
        className={clsx(style.layoutItem, {
          [style.editable]: !readOnly,
        })}>
        {children}
      </div>
      {isResizing ? (
        <div className='absolute -top-9 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-lg bg-white px-2 ring-1 ring-black-50'>
          <span className='text-13 font-bold text-black-600'>{`${Math.floor(currentWidth || 0)}%`}</span>
        </div>
      ) : null}
    </div>
  );
};

export default LayoutItemBlock;
