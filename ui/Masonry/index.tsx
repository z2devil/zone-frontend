'use client';

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MasonryRecord, diffAndUpdateRecords } from './utils';
import { useMount, useUnmount } from 'react-use';
import useResize from './hooks/useResize';
import { throttle } from 'lodash';

type Record = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface MasonryProps {
  children: (index: number, record: Record) => React.ReactNode;
  data: any[];
  columnWidth: number;
  gap?: number;
  bufferOffset?: number;
  loadDistance?: number;
  chunkSize?: number;
  keyField?: string;
  touchBottom?: () => void;
}

const Masonry = (props: MasonryProps) => {
  const {
    children,
    data,
    columnWidth,
    gap = 20,
    bufferOffset = 1200,
    loadDistance = 600,
    chunkSize = 10,
    keyField = '_id',
    touchBottom,
  } = props;

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 预渲染容器引用
  const prerenderContainerRef = useRef<HTMLDivElement>(null);

  // 监听器引用
  const observerRef = useRef<MutationObserver>();

  // 位置记录
  const [records, setRecords] = useState<MasonryRecord[]>([]);

  // 真实数据下标集合
  const [renderIndexes, setRenderIndexes] = useState<number[]>([]);

  // 预渲染数据下标集合
  const [prerenderIds, setPrerenderIds] = useState<string[]>([]);

  // 数据引用
  const dataRef = useRef(data);

  // 记录的引用
  const recordsRef = useRef<MasonryRecord[]>([]);

  // 上次容器宽度引用
  const latestContainerWidth = useRef<number>(0);

  // 容器宽度引用
  const containerWidthRef = useRef<number>(0);

  // 滚动距离
  const scrollTopRef = useRef(0);

  // 总高度
  const [totalHeight, setTotalHeight] = useState(0);

  // 计算填充区域高度
  const calcFillerStyle: CSSProperties = useMemo(() => {
    return {
      height: totalHeight + 'px',
    };
  }, [totalHeight]);

  // 容器尺寸 & 列数
  const [containerWidth, column] = useResize(containerRef, {
    delay: 400,
  });

  // 挂载
  const mount = useCallback(() => {
    setRecords([]);
    setRenderIndexes([]);

    touchBottom?.();
  }, [touchBottom]);

  useMount(() => {
    mount();
  });

  // 卸载
  const unmount = useCallback(() => {
    setRecords([]);
    setRenderIndexes([]);
  }, []);

  useUnmount(() => {
    unmount();
  });

  // 预渲染（用于计算卡片大小）
  const prerender = useCallback(
    async (ids: string[]) => {
      const preRenderContainerDOM = prerenderContainerRef.current;
      if (!preRenderContainerDOM) return;

      let promiseResovle: () => void;
      const promise = new Promise<void>(resovle => {
        promiseResovle = resovle;
      });

      setPrerenderIds(ids);

      // 定义回调函数，当观察到变化时执行
      const callback = (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType !== 1) return;
              const cardId = (node as HTMLElement).getAttribute('data-id');
              const cardDOM = (node as HTMLElement).children[0];
              if (!cardId || !cardDOM) return;
              recordsRef.current.forEach(record => {
                if (record[keyField] === cardId) {
                  record.height = cardDOM.clientHeight;
                  record.width = cardDOM.clientWidth;
                  return true;
                }
              });
            });
          }
        }
        requestAnimationFrame(() => {
          promiseResovle();
        });
      };

      observerRef.current = new MutationObserver(callback);

      observerRef.current.observe(preRenderContainerDOM, {
        childList: true,
      });

      await promise;

      observerRef.current.disconnect();

      observerRef.current = undefined;

      setPrerenderIds([]);
    },
    [keyField]
  );

  // 渲染
  const render = useCallback(async () => {
    // 位置计算
    const recordsRefValue = recordsRef.current;
    const columnHeights = Array(column).fill(0);
    for (let i = 0; i < recordsRefValue.length; i++) {
      const record = recordsRefValue[i];
      if (!record) throw new Error('record missing');
      const minIndex = columnHeights.indexOf(Math.min(...columnHeights));
      const wrapperWidth = column * (record.width + gap) - gap;
      record.x =
        minIndex * (record.width + gap) +
        (containerWidthRef.current - wrapperWidth) / 2;
      record.y = columnHeights[minIndex];
      columnHeights[minIndex] += record.height + gap;
    }
    setTotalHeight(Math.max(...columnHeights) - gap);
    setRecords([...recordsRefValue]);

    // 渲染区域计算
    const visionTop = -scrollTopRef.current;
    const containerHeight = window.innerHeight;

    const visionRange = [
      visionTop - bufferOffset,
      visionTop + containerHeight + bufferOffset,
    ];

    const nextRenderIndexes: number[] = [];

    for (let i = 0; i < recordsRefValue.length; i++) {
      const record = recordsRefValue[i];
      if (!record) continue;
      if (
        record.y + record.height > visionRange[0] &&
        record.y < visionRange[1]
      ) {
        nextRenderIndexes.push(i);
      }
    }

    setRenderIndexes(nextRenderIndexes);
  }, [bufferOffset, column, gap]);

  // 更新
  const update = useCallback(async () => {
    const nextRecords = structuredClone(recordsRef.current);
    const nextPrerenderIds = diffAndUpdateRecords(
      nextRecords,
      dataRef.current,
      data,
      keyField
    );

    dataRef.current = data;

    recordsRef.current = nextRecords;

    let needCalcSize = false;

    if (latestContainerWidth.current !== containerWidth) {
      if (containerWidth < columnWidth) {
        latestContainerWidth.current = containerWidth;
        needCalcSize = true;
      } else if (latestContainerWidth.current !== columnWidth) {
        latestContainerWidth.current = columnWidth;
        needCalcSize = true;
      }
      containerWidthRef.current = containerWidth;
    }

    if (needCalcSize) {
      nextPrerenderIds.push(...data.map(record => record[keyField]));
    }

    if (nextPrerenderIds.length) {
      await prerender(nextPrerenderIds);
    }

    await render();
  }, [data, keyField, containerWidth, columnWidth, prerender, render]);

  useEffect(() => {
    update();
  }, [update]);

  // 滚动事件
  const handleScroll = throttle(
    useCallback(async () => {
      const containerDOM = containerRef.current;
      if (!containerDOM) return;

      scrollTopRef.current = containerDOM.getBoundingClientRect().top;

      await render();

      // 触底
      if (
        -scrollTopRef.current + window.innerHeight + loadDistance >=
          totalHeight &&
        data.length
      ) {
        touchBottom?.();
      }
    }, [data.length, loadDistance, render, totalHeight, touchBottom]),
    100
  );

  // 维护滚动事件
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div ref={containerRef} className='relative w-full' style={calcFillerStyle}>
      {renderIndexes.map(index => {
        const record = records[index];
        if (!record) return null;
        return children(index, record);
      })}
      <div ref={prerenderContainerRef} className='invisible absolute'>
        {prerenderIds.map(id => {
          const index = data.findIndex(item => item[keyField] === id);
          return (
            <div key={id} data-id={id}>
              {children(index, {
                x: 0,
                y: 0,
                width: Math.min(columnWidth, containerWidth),
                height: 0,
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Masonry;
