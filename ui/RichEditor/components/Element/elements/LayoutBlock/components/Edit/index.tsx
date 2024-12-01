import { useCallback, useMemo, useRef } from 'react';
import { LayoutBlockElement } from 'types/slate';
import style from './style.module.scss';
import { useOverride } from '../OverrideProvider';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';

interface LayoutEditProps {
  element: LayoutBlockElement;
}

const LayoutEdit = (props: LayoutEditProps) => {
  const { element } = props;

  const editor = useSlate();

  const override = useOverride();

  const newWidths = useRef<number[] | null>();

  const handleMouseDown = useCallback(
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
        widths[idx] = Math.floor(widths[idx]);
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

  const controllers = useMemo(() => {
    return (override?.widths || element.children.map(child => child.width))
      .slice(0, -1)
      .map((width, idx) => {
        const controllerStyle = {
          left: `${width}%`,
        };
        return (
          <div
            className={style.controller}
            key={idx}
            style={controllerStyle}
            onMouseDown={e => handleMouseDown(idx, e.clientX)}></div>
        );
      });
  }, [element.children, handleMouseDown, override?.widths]);

  return (
    <div className={style.layoutEdit} contentEditable={false}>
      {controllers}
    </div>
  );
};

export default LayoutEdit;
