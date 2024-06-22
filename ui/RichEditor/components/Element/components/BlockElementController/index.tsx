import { useCallback, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Identifier, XYCoord } from 'dnd-core';
import clsx from 'clsx';
import { CustomElement } from 'types/slate';
import { Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { DropType } from '@/ui/RichEditor/constants';
import { useEditorStore } from '@/lib/stores';

interface BlockElementControllerProps {
  id: string;
  children: any;
  element: CustomElement;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const enum ItemTypes {
  CARD = 'card',
}

const BlockElementController = (props: BlockElementControllerProps) => {
  const { id, children, element } = props;

  const [hovered, setHovered] = useState(false);

  const hover = useCallback(() => {
    setHovered(true);
  }, []);

  const unhover = useCallback(() => {
    setHovered(false);
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  const editorStore = useEditorStore();

  const editor = useSlate();

  const dragHoveringType = useMemo(() => {
    if (editorStore.dragHoveringElementInfo.id !== id) return DropType.NONE;
    return editorStore.dragHoveringElementInfo.type;
  }, [
    editorStore.dragHoveringElementInfo.id,
    editorStore.dragHoveringElementInfo.type,
    id,
  ]);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        editorStore.clearDragHovering();
      }
    },
  });

  const [, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;

      const dragId = item.id;
      const hoverId = id;

      if (dragId === hoverId) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      editorStore.setDragHovering(
        id,
        hoverClientY < hoverMiddleY ? DropType.UP : DropType.DOWN
      );
    },
    drop(item, monitor) {
      editorStore.clearDragHovering();

      if (!ref.current) return;

      const dragId = item.id;
      const hoverId = id;

      if (dragId === hoverId) return;

      const dragPath = dragId.split('-').map(Number);
      const hoverPath = hoverId.split('-').map(Number);

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      const isHoverdUp = hoverClientY < hoverMiddleY;

      const isDraggingUp = dragPath[0] > hoverPath[0];

      if (isDraggingUp) {
        if (!isHoverdUp) {
          hoverPath[0] += 1;
        }
      } else {
        if (isHoverdUp) {
          hoverPath[0] -= 1;
        }
      }

      Transforms.moveNodes(editor, {
        at: dragPath,
        to: hoverPath,
      });
    },
  });

  drop(preview(ref));

  return (
    <div
      ref={ref}
      className='relative'
      onMouseEnter={hover}
      onMouseLeave={unhover}>
      {/* 拖拽按钮 */}
      {hovered ? (
        <div
          ref={drag}
          className=' absolute -left-5 top-1/2 flex h-full w-5 -translate-y-1/2 cursor-grab items-center'
          contentEditable={false}>
          <div className=' flex h-full w-4 items-center justify-center rounded text-black-400 hover:bg-gray-200'>
            <span className='iconfont icon-draggable-dots'></span>
          </div>
        </div>
      ) : null}
      {/* 拖拽位置标识 */}
      {dragHoveringType ? (
        <div
          className={clsx(
            ' absolute h-1 w-full bg-primary-50 bg-opacity-40',
            dragHoveringType === DropType.UP
              ? 'top-0 -translate-y-1/2'
              : 'bottom-0 translate-y-1/2'
          )}></div>
      ) : null}
      {children}
    </div>
  );
};

export default BlockElementController;
