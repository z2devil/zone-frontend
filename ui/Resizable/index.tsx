import clsx from 'clsx';
import React, {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useRef,
  CSSProperties,
} from 'react';
import { twMerge } from 'tailwind-merge';

export enum ResizeDirection {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

interface ResizableProps {
  directions: ResizeDirection[];
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onResizing?: (size: { width: number; height: number }) => void;
  onResized?: (size: { width: number; height: number }) => void;
}

const Resizable = (props: ResizableProps) => {
  const { directions, children, className, style, onResizing, onResized } =
    props;

  const resizableRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent, direction: ResizeDirection) => {
      const startMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };

      const startSize = {
        width: resizableRef.current?.offsetWidth || 0,
        height: resizableRef.current?.offsetHeight || 0,
      };

      let newWidth = 0;
      let newHeight = 0;

      const handleMouseMove = (e: MouseEvent) => {
        if (direction === ResizeDirection.RIGHT) {
          newWidth = startSize.width + (e.clientX - startMousePosition.x);
        }
        if (direction === ResizeDirection.BOTTOM) {
          newHeight = startSize.height + (e.clientY - startMousePosition.y);
        }
        if (direction === ResizeDirection.LEFT) {
          newWidth = startSize.width - (e.clientX - startMousePosition.x);
        }
        if (direction === ResizeDirection.TOP) {
          newHeight = startSize.height - (e.clientY - startMousePosition.y);
        }

        onResizing?.({
          width: newWidth ? Math.max(0, newWidth) : 0,
          height: newHeight ? Math.max(0, newHeight) : 0,
        });
      };

      const handleMouseUp = () => {
        onResized?.({
          width: newWidth ? Math.max(0, newWidth) : 0,
          height: newHeight ? Math.max(0, newHeight) : 0,
        });
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onResized, onResizing]
  );

  return (
    <div
      className={clsx(twMerge('relative', className))}
      ref={resizableRef}
      style={style}>
      {children}
      {directions.includes(ResizeDirection.RIGHT) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '10px',
            height: '100%',
            cursor: 'e-resize',
          }}
          onMouseDown={e => handleMouseDown(e, ResizeDirection.RIGHT)}
        />
      )}
      {directions.includes(ResizeDirection.BOTTOM) && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '10px',
            cursor: 's-resize',
          }}
          onMouseDown={e => handleMouseDown(e, ResizeDirection.BOTTOM)}
        />
      )}
      {directions.includes(ResizeDirection.LEFT) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '10px',
            height: '100%',
            cursor: 'w-resize',
          }}
          onMouseDown={e => handleMouseDown(e, ResizeDirection.LEFT)}
        />
      )}
      {directions.includes(ResizeDirection.TOP) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '10px',
            cursor: 'n-resize',
          }}
          onMouseDown={e => handleMouseDown(e, ResizeDirection.TOP)}
        />
      )}
    </div>
  );
};

export default Resizable;
