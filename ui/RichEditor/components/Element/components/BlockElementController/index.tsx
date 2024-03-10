import { useCallback, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Identifier, XYCoord } from 'dnd-core';
import clsx from 'clsx';
import { CustomElement } from 'types/slate';
import { Range, Transforms } from 'slate';
import { ReactEditor, useSlate, useSlateSelection } from 'slate-react';
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

      // TODO:上下元素有问题
      console.log('[ drop ]', dragPath, hoverPath);

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
      className={clsx('relative', {
        ' opacity-30': isDragging,
        'border-primary-50': dragHoveringType,
        'border-t': dragHoveringType === DropType.UP,
        'border-b': dragHoveringType === DropType.DOWN,
      })}
      onMouseEnter={hover}
      onMouseLeave={unhover}>
      {hovered ? (
        <div
          ref={drag}
          className=' absolute left-0 top-1/2 flex h-full -translate-x-full -translate-y-1/2 cursor-grab items-center rounded p-[1px] text-black-400 hover:bg-gray-200'
          contentEditable={false}>
          <span className='iconfont icon-draggable-dots'></span>
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default BlockElementController;
