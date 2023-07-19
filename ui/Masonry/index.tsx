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
import usePromise from './hooks/usePromise';

type Record = {
  id: number;
  x: number;
  y: number;
  height: number;
};

interface MasonryProps<T> {
  column: number;
  itemHeight?: number;
  gap?: number;
  bufferOffset?: number;
  loadDistance?: number;
  container: Element;
  children: (index: number, record: Record) => React.ReactNode;
  loadData?: (id?: number) => Promise<T[]>;
}

let resolveFn: ((value: unknown) => void) | undefined;

const createPromise = () => {
  return new Promise(resolve => {
    resolveFn = resolve;
  });
};

const Masonry = <T extends { id: number }>(props: MasonryProps<T>) => {
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
    loadData,
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
  const records = useRef<Record[]>([]);

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

  // 加载数据判断
  const handleLoadData = useCallback(
    async (id?: number) => {
      const res = (await loadData?.(id)) || [];
      for (const item of res) {
        // TODO: 提供自定义 key
        records.current.push({
          id: item.id,
          // TODO: 提供自定义 列宽
          x: 0,
          y: 0,
          height: 0,
        });
      }
      // 预渲染
      const preRenderIndexArray: number[] = [];
      records.current.forEach((record, index) => {
        if (!record.height) {
          preRenderIndexArray.push(index);
        }
      });
      console.log('preRenderIndexArray', preRenderIndexArray);
      setPreRenderIndexArray(preRenderIndexArray);
    },
    [loadData]
  );

  // 渲染调度
  const render = useCallback(async () => {
    const visionRange = [
      visionTop.current - bufferOffset,
      visionTop.current + (containerSize.height || 900) + bufferOffset,
    ];

    const renderIndexArray: number[] = [];
    const renderRange = [visionRange[1], visionRange[0]];

    console.log(
      '等待预渲染完成，开始渲染',
      JSON.stringify(records),
      JSON.stringify(visionRange)
    );

    records.current.forEach((record, index) => {
      if (
        record.y + record.height > visionRange[0] &&
        record.y < visionRange[1]
      ) {
        renderIndexArray.push(index);
        renderRange[0] = Math.min(renderRange[0], record.y);
        renderRange[1] = Math.max(renderRange[1], record.y + record.height);
      }
    });

    console.log(
      JSON.stringify(renderIndexArray),
      JSON.stringify(renderRange),
      JSON.stringify(visionRange)
    );

    // 判断是否满足渲染需求
    if (
      // renderRange[0] > visionRange[0] ||
      renderRange[1] < visionRange[1] ||
      !renderIndexArray.length
    ) {
      console.log('不满足渲染需求，开始加载数据');

      // 加载数据
      await handleLoadData();
      return;
    }

    // 渲染
    setRenderIndexArray(renderIndexArray);
  }, [bufferOffset, containerSize.height, handleLoadData]);

  // 滚动事件
  const isScrolling = useRef(false);
  const handleScroll = useCallback(() => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    requestAnimationFrame(async () => {
      isScrolling.current = false;
      scrollTop.current = container.scrollTop;
      updateVisionRange();
      await render();
    });
  }, [container.scrollTop, render, updateVisionRange]);

  // 维护滚动事件
  useEffect(() => {
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [container, handleScroll]);

  // 初始化
  const init = useCallback(async () => {
    columnHeights.current = Array.from({ length: column }).map(() => 0);
    const promise = createPromise();
    await handleLoadData();
    await promise;
    updateVisionRange();
    await render();
  }, [column, handleLoadData, render, updateVisionRange]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 预渲染
  const preRenderContainerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver>();
  useEffect(() => {
    const preRenderContainerDOM = preRenderContainerRef.current;
    if (!preRenderContainerDOM || !preRenderIndexArray.length) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const wrapper = entry.target;
        const index = Number(wrapper.getAttribute('data-index'));
        const record = records.current[index];
        const rect = wrapper.children[0].getBoundingClientRect();
        const height = rect.height;
        const minIndex = columnHeights.current.indexOf(
          Math.min(...columnHeights.current)
        );
        record.x = minIndex * (rect.width + gap);
        record.y = columnHeights.current[minIndex];
        record.height = height;
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
      console.log('预渲染完成', records.current);
      resolveFn?.(null);
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
  }, [column, gap, preRenderIndexArray]);

  return (
    <div
      ref={masonryRef}
      className='relative min-h-screen'
      style={calcFillerHeight}>
      {renderIndexArray.map(i => {
        const position = records.current[i];
        return children(i, position);
      })}
      <div ref={preRenderContainerRef} className='invisible absolute'>
        {preRenderIndexArray.map(i => {
          return (
            <div key={i} data-index={i}>
              {children(i, { id: -1, x: 0, y: 0, height: 0 })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Masonry;
