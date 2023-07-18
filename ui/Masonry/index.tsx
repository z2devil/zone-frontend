'use client';

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useResize from './hooks/useResize';

type Position = {
  id: number;
  x: number;
  y: number;
};

interface MasonryProps<T> {
  column: number;
  itemHeight?: number;
  gap?: number;
  bufferOffset?: number;
  loadDistance?: number;
  container: Element;
  children: (index: number, position: Position) => React.ReactNode;
  loadNext?: (id?: number) => void | Promise<T[]>;
}

const Masonry = <T extends { id: number; height: number }>(
  props: MasonryProps<T>
) => {
  const {
    // TODO: 之后支持不同高度的 item
    column,
    itemHeight,
    // 之后支持rem
    gap = 20,
    bufferOffset = 300,
    loadDistance = 600,
    container,
    children,
    loadNext,
  } = props;

  // 组件引用
  const masonryRef = useRef<HTMLDivElement>(null);

  // 滚动位置
  const scrollTop = useRef(0);

  // 所示位置
  const visionTop = useRef(0);

  // 各列高度
  const columnHeights = useRef<number[]>([]);

  // 数据记录
  const dataRecord = useRef<Position[]>([]);

  // 内容最大高度（最大范围）
  const [totalHeight, setTotalHeight] = useState(0);

  // 真实数据下标集合
  const [renderIndexArray, setRenderIndexArray] = useState<number[]>([]);

  // 预渲染数据下标集合
  const [preRenderIndexArray, setPreRenderIndexArray] = useState<number[]>([]);

  // 加载状态
  const [isloading, setIsLoading] = useState(false);

  // 计算填充区域高度
  const calcFillerHeight: CSSProperties = useMemo(() => {
    return {
      height: totalHeight + 'px',
    };
  }, [totalHeight]);

  // 容器尺寸
  const [containerSize] = useResize(container);

  // 更新所示区域
  const updateVisionRange = useCallback(() => {
    const masonryDOM = masonryRef.current;
    const masonryRect = masonryDOM?.getBoundingClientRect();
    if (!masonryRect) return;
    visionTop.current = -masonryRect.top;
    console.log('visionTop', visionTop.current);
  }, []);

  // 渲染调度
  const render = useCallback(() => {
    const visionRange = [
      visionTop.current - bufferOffset,
      visionTop.current + (containerSize.height || 900) + bufferOffset,
    ];
    console.log('visionRange', visionRange, containerSize.height);
    const indexArray: number[] = [];
    dataRecord.current.forEach((position, index) => {
      if (
        visionRange[0] < position.y + (itemHeight || 0) &&
        visionRange[1] > position.y
      ) {
        indexArray.push(index);
      }
    });
    setPreRenderIndexArray(indexArray);
  }, [bufferOffset, containerSize.height, itemHeight]);

  // 加载数据判断
  const handleLoadData = useCallback(
    async (id?: number) => {
      if (isloading) return;
      setIsLoading(true);
      const req = loadNext?.(id);
      if (req instanceof Promise) {
        const res = await req;
        for (const item of res) {
          // TODO: 提供自定义 key
          dataRecord.current.push({
            id: item.id,
            // TODO: 提供自定义 列宽
            x: 0,
            y: 0,
          });
        }
        updateVisionRange();
        render();
      } else {
        console.log('load next', req);
      }
      setIsLoading(false);
    },
    [isloading, loadNext, updateVisionRange, render]
  );

  // 滚动事件
  const isScrolling = useRef(false);
  const handleScroll = useCallback(() => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    requestAnimationFrame(() => {
      isScrolling.current = false;
      // 更新所示区域
      scrollTop.current = container.scrollTop;
      updateVisionRange();
      // 加载数据
      if (
        visionTop.current >
        totalHeight - containerSize.height - loadDistance
      ) {
        handleLoadData(dataRecord.current[dataRecord.current.length - 1].id);
      }
    });
  }, [
    container.scrollTop,
    updateVisionRange,
    render,
    totalHeight,
    containerSize.height,
    loadDistance,
    handleLoadData,
  ]);

  // 维护滚动事件
  useEffect(() => {
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [container, handleScroll]);

  // 初始化
  const init = useCallback(() => {
    columnHeights.current = Array.from({ length: column }).map(() => 0);
    handleLoadData();
  }, [column, handleLoadData]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preRenderContainerRef = useRef<HTMLDivElement>(null);

  const resizeObserverRef = useRef<ResizeObserver>();

  useEffect(() => {
    const preRenderContainerDOM = preRenderContainerRef.current;
    if (!preRenderContainerDOM || !preRenderIndexArray.length) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const card = entry.target;
        const index = Number(card.getAttribute('data-index'));
        const position = dataRecord.current[index];
        const height = card.getBoundingClientRect().height;
        const minIndex = columnHeights.current.indexOf(
          Math.min(...columnHeights.current)
        );
        position.x = minIndex * (card.getBoundingClientRect().width + gap);
        position.y = columnHeights.current[minIndex];
        columnHeights.current[minIndex] += height + gap;
      }
      setRenderIndexArray(prev => {
        const next = [...prev];
        for (const index of preRenderIndexArray) {
          next.push(index);
        }
        return next;
      });
      setTotalHeight(() => {
        let height = 0;
        columnHeights.current.forEach(prevHeight => {
          height = Math.max(height, prevHeight);
        });
        return height;
      });
      console.log('dataRecord', dataRecord.current);
      // 清除resizeObserver
      setPreRenderIndexArray([]);
      resizeObserver.disconnect();
    });
    const cards = preRenderContainerDOM.children;
    console.log('cards', cards);

    for (let i = 0; i < cards.length; i++) {
      resizeObserver.observe(cards[i]);
    }
    resizeObserverRef.current = resizeObserver;
    return () => {
      resizeObserver.disconnect();
    };
  }, [column, gap, preRenderIndexArray, render]);

  return (
    <div
      ref={masonryRef}
      className='relative min-h-screen'
      style={calcFillerHeight}>
      {renderIndexArray.map(i => {
        const position = dataRecord.current[i];
        return children(i, position);
      })}
      <div ref={preRenderContainerRef} className='invisible absolute'>
        {preRenderIndexArray.map(i => {
          return children(i, { id: -1, x: 0, y: 0 });
        })}
      </div>
    </div>
  );
};

export default Masonry;
