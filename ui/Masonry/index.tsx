'use client';

import {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMount } from 'react-use';
import useResize from './hooks/useResize';
import { isEqual } from 'lodash';

type MasonryRecord = {
  x: number;
  y: number;
  width: number;
  height: number;
  meta: any;
};

interface MasonryProps {
  children: (record: MasonryRecord) => React.ReactNode;
  data: any[];
  columnWidth: number;
  gap?: number;
  bufferOffset?: number;
  loadDistance?: number;
  chunkSize?: number;
  keyField?: string;
  touchBottom?: () => void;
  contentWidthChange?: (width: number) => void;
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
    contentWidthChange,
  } = props;

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 预渲染容器引用
  const prerenderContainerRef = useRef<HTMLDivElement>(null);

  // 监听器引用
  const observerRef = useRef<MutationObserver>();

  // 记录
  const [recordMap, setRecordMap] = useState<Record<string, MasonryRecord>>({});

  // 记录的引用
  const recordMapRef = useRef<Record<string, MasonryRecord>>({});

  // 真实数据下标集合
  const [renderKeys, setRenderKeys] = useState<string[]>([]);

  // 预渲染数据下标集合
  const [prerenderKeys, setPrerenderKeys] = useState<string[]>([]);

  // 数据引用
  const dataRef = useRef<any[]>(data);

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
    touchBottom?.();
  }, [touchBottom]);

  useMount(() => {
    mount();
  });

  // 预渲染（用于计算卡片大小）
  const prerender = useCallback(async (keys: string[]) => {
    const preRenderContainerDOM = prerenderContainerRef.current;
    if (!preRenderContainerDOM) return;

    let promiseResovle: () => void;
    const promise = new Promise<void>(resovle => {
      promiseResovle = resovle;
    });

    setPrerenderKeys(keys);

    const recordMapRefValue = recordMapRef.current;

    // 定义回调函数，当观察到变化时执行
    const callback = (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType !== 1) return;
            const key = (node as HTMLElement).getAttribute('data-id');
            const cardDOM = (node as HTMLElement).children[0];
            if (!key || !cardDOM) return;
            const rect = cardDOM.getBoundingClientRect();
            recordMapRefValue[key] = {
              ...recordMapRefValue[key],
              width: rect.width,
              height: rect.height,
            };
          });
        }
      }
      recordMapRef.current = recordMapRefValue;
      promiseResovle();
    };

    observerRef.current = new MutationObserver(callback);

    observerRef.current.observe(preRenderContainerDOM, {
      childList: true,
    });

    await promise;

    observerRef.current.disconnect();

    observerRef.current = undefined;

    setPrerenderKeys([]);
  }, []);

  // 渲染
  const render = useCallback(() => {
    const visionTop = -scrollTopRef.current;
    const containerHeight = window.innerHeight;

    const visionRange = [
      visionTop - bufferOffset,
      visionTop + containerHeight + bufferOffset,
    ];

    const nextRenderKeys: string[] = [];

    const recordMapRefValue = recordMapRef.current;
    const columnHeights = Array(column).fill(0);

    const recordMapRefValueKeys = Object.keys(recordMapRefValue);

    let wrapperWidth = 0;

    for (let i = 0; i < recordMapRefValueKeys.length; i++) {
      const record = recordMapRefValue[recordMapRefValueKeys[i]];
      if (!record) continue;
      const minIndex = columnHeights.indexOf(Math.min(...columnHeights));
      wrapperWidth = column * (record.width + gap) - gap;
      record.x =
        minIndex * (record.width + gap) +
        (containerWidthRef.current - wrapperWidth) / 2;
      record.y = columnHeights[minIndex];
      columnHeights[minIndex] += record.height + gap;
      if (
        record.y + record.height > visionRange[0] &&
        record.y < visionRange[1]
      ) {
        nextRenderKeys.push(recordMapRefValueKeys[i]);
      }
    }

    contentWidthChange?.(wrapperWidth);

    setTotalHeight(Math.max(...columnHeights) - gap);

    setRecordMap(recordMapRefValue);
    setRenderKeys(nextRenderKeys);
  }, [bufferOffset, column, contentWidthChange, gap]);

  // 更新
  const update = useCallback(async () => {
    const nextPrerenderIds: string[] = [];

    let needCalcSize = false;

    let needCalcPosition = false;

    if (latestContainerWidth.current !== containerWidth) {
      needCalcPosition = true;
      if (containerWidth < columnWidth) {
        latestContainerWidth.current = containerWidth;
        needCalcSize = true;
      } else if (latestContainerWidth.current !== columnWidth) {
        latestContainerWidth.current = columnWidth;
        needCalcSize = true;
      }
      containerWidthRef.current = containerWidth;
    }

    if (!needCalcPosition && !needCalcSize && isEqual(data, dataRef.current)) {
      return;
    }

    dataRef.current = data;

    const recordMapRefValue = recordMapRef.current;
    const nextRecordMap: Record<string, MasonryRecord> = {};
    data.forEach(d => {
      const prevRecord = recordMapRefValue[d[keyField]];
      if (!prevRecord) {
        nextRecordMap[d[keyField]] = {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          meta: d,
        };
        nextPrerenderIds.push(d[keyField]);
        return;
      }
      if (needCalcSize) {
        nextPrerenderIds.push(d[keyField]);
      }
      nextRecordMap[d[keyField]] = {
        ...prevRecord,
        meta: d,
      };
    });
    recordMapRef.current = nextRecordMap;

    if (nextPrerenderIds.length) {
      await prerender(nextPrerenderIds);
    }

    render();
  }, [data, containerWidth, render, columnWidth, keyField, prerender]);

  // bugfix: 修复更新并发问题
  useLayoutEffect(() => {
    update();
  }, [update]);

  // 滚动事件
  const handleScroll = useCallback(async () => {
    const containerDOM = containerRef.current;
    if (!containerDOM) return;

    scrollTopRef.current = containerDOM.getBoundingClientRect().top;

    // 触底
    if (
      -scrollTopRef.current + window.innerHeight + loadDistance >=
        totalHeight &&
      data.length
    ) {
      touchBottom?.();
    } else {
      render();
    }
  }, [data.length, loadDistance, render, totalHeight, touchBottom]);

  // 维护滚动事件
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className='relative w-full' ref={containerRef} style={calcFillerStyle}>
      {renderKeys.map(key => {
        return children(recordMap[key]);
      })}
      <div className='invisible absolute' ref={prerenderContainerRef}>
        {prerenderKeys.map(key => {
          const index = data.findIndex(item => item[keyField] === key);
          return (
            <div data-id={key} key={key}>
              {children({
                x: 0,
                y: 0,
                width: Math.min(columnWidth, containerWidth),
                height: 0,
                meta: data[index],
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Masonry;
