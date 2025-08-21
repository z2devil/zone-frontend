import { useCallback, useMemo, useRef } from 'react';
import style from './style.module.scss';
import { useOverride } from '../OverrideProvider';
import { Transforms } from 'slate';
import { LayoutBlockElement } from 'types/slate';
import { ReactEditor, useSlate } from 'slate-react';
import { BlockElementType } from '@/lib/constants';

interface LayoutEditProps {
  element: LayoutBlockElement;
}

const LayoutEdit = (props: LayoutEditProps) => {
  const { element } = props;

  const editor = useSlate();

  const override = useOverride();

  const newWidths = useRef<number[] | null>();

  const handleResizeStart = useCallback(
    (idx: number, initialX: number) => {
      const containerWidth = override?.containerRef.current?.clientWidth;
      if (!containerWidth) return;

      const initalWidths =
        override?.widths || element.children.map(child => child.width);

      override?.setIsResizing(true);

      const move = (e: MouseEvent) => {
        const delta = ((e.clientX - initialX) / containerWidth) * 100;

        const widths = [...initalWidths];

        const bothTotalWidth = widths[idx] + widths[idx + 1];
        widths[idx] = Math.min(
          Math.max(widths[idx] + delta, 10),
          bothTotalWidth - 10
        );
        widths[idx + 1] = bothTotalWidth - widths[idx];

        newWidths.current = [...widths];

        override?.setWidths(newWidths.current);
      };

      const up = () => {
        if (!newWidths.current) return;

        const widths = newWidths.current;

        const bothTotalWidth = widths[idx] + widths[idx + 1];
        widths[idx + 1] = bothTotalWidth - widths[idx];

        const currentPath = ReactEditor.findPath(editor, element);

        Transforms.setNodes(
          editor,
          { width: widths[idx] },
          { at: [...currentPath, idx] }
        );
        Transforms.setNodes(
          editor,
          { width: widths[idx + 1] },
          { at: [...currentPath, idx + 1] }
        );

        override?.setIsResizing(false);
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);

      return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
    },
    [override, element, editor]
  );

  const canAdd = useMemo(() => {
    return element.children.length < 5;
  }, [element.children.length]);

  const handleAdd = useCallback(
    (index: number) => {
      let needWidth = 100 / (element.children.length + 1);
      const newWidth = needWidth;
      const newWidths = element.children.map(child => child.width);
      for (let i = 0; i < newWidths.length; i++) {
        const prevWidth = newWidths[i];
        newWidths[i] = Math.max(
          prevWidth -
            needWidth *
              (prevWidth / newWidths.slice(i).reduce((a, b) => a + b, 0)),
          10
        );
        needWidth -= prevWidth - newWidths[i];
        Transforms.setNodes(
          editor,
          { width: newWidths[i] },
          { at: [...ReactEditor.findPath(editor, element), i] }
        );
      }
      newWidths.splice(index + 1, 0, newWidth);
      Transforms.insertNodes(
        editor,
        {
          type: BlockElementType.LAYOUT_ITEM,
          width: newWidth,
          children: [
            {
              type: BlockElementType.PARAGRAPH,
              children: [
                {
                  text: '',
                },
              ],
            },
          ],
        } as any,
        {
          at: [...ReactEditor.findPath(editor, element), index + 1],
          select: true,
        }
      );
    },
    [editor, element]
  );

  const controllers = useMemo(() => {
    return (
      override?.isResizing
        ? override?.widths || []
        : element.children.map(child => child.width)
    )
      .slice(0, -1)
      .map((width, idx) => {
        const controllerStyle = {
          marginLeft: `${width}%`,
        };
        return (
          <div className={style.controller} key={idx} style={controllerStyle}>
            {canAdd ? (
              <div className={style.addHandler} onClick={() => handleAdd(idx)}>
                <div className={style.btn}>
                  <span className='iconfont icon-plus'></span>
                </div>
              </div>
            ) : null}
            <div
              className={style.resizeHandler}
              onMouseDown={e => handleResizeStart(idx, e.clientX)}></div>
          </div>
        );
      });
  }, [
    canAdd,
    element.children,
    handleAdd,
    handleResizeStart,
    override?.isResizing,
    override?.widths,
  ]);

  return (
    <div className={style.layoutEdit} contentEditable={false}>
      {controllers}
    </div>
  );
};

export default LayoutEdit;
