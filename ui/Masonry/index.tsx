'use client';

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { throttle } from 'lodash-es';
import MasonyCore, { MasonryRecord } from './utils/core';

type Record = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface MasonryProps {
  children: (index: number, record: Record) => React.ReactNode;
  data: any[];
  // containerRect: containerRectInfo | undefined;
  visionWidth: number;
  column: number;
  cellWidth: number;
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
    // containerRect,
    visionWidth,
    column,
    cellWidth,
    gap = 20,
    bufferOffset = 300,
    loadDistance = 600,
    chunkSize = 10,
    keyField = '_id',
    touchBottom,
  } = props;

  // 初始化状态
  const [initialized, setInitialized] = useState(false);

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 上次宽度引用
  const lastestWdithRef = useRef<number>(0);

  // 预渲染容器引用
  const preRenderContainerRef = useRef<HTMLDivElement>(null);

  // 位置记录
  const [records, setRecords] = useState<MasonryRecord[]>([]);

  // 内容最大高度（最大范围）
  const [totalHeight, setTotalHeight] = useState(0);

  // 真实数据下标集合
  const [renderIndexes, setRenderIndexes] = useState<number[]>([]);

  // 预渲染数据下标集合
  const [preRenderIds, setPreRenderIds] = useState<string[]>([]);

  // 计算填充区域高度
  const calcFillerStyle: CSSProperties = useMemo(() => {
    return {
      height: totalHeight + 'px',
    };
  }, [totalHeight]);

  // 核心
  const masonryCoreRef = useRef<MasonyCore | null>();

  // 初始化
  const init = useCallback(() => {
    if (initialized) return;

    const preRenderContainerDOM = preRenderContainerRef.current;
    if (!preRenderContainerDOM) return;

    masonryCoreRef.current = new MasonyCore(column, preRenderContainerDOM, {
      bufferOffset,
      gap,
      keyField,
    });

    touchBottom?.();

    setInitialized(true);
  }, [initialized, column, bufferOffset, gap, keyField, touchBottom]);

  useEffect(() => {
    init();
  }, [init]);

  // 销毁
  const destroy = useCallback(() => {
    const masonryCore = masonryCoreRef.current;
    if (!masonryCore) return;

    masonryCore.destroy();
    masonryCoreRef.current = null;
  }, []);

  // 销毁
  useEffect(() => {
    return () => {
      destroy();
    };
  }, [destroy]);

  // 重置
  const reset = useCallback(() => {
    if (!initialized) return;

    const preRenderContainerDOM = preRenderContainerRef.current;
    if (!preRenderContainerDOM) return;

    const masornyCore = masonryCoreRef.current;
    if (!masornyCore) return;

    let needCalcSize = false;

    if (lastestWdithRef.current !== visionWidth) {
      if (visionWidth < cellWidth) {
        lastestWdithRef.current = visionWidth;
        needCalcSize = true;
      } else {
        if (lastestWdithRef.current !== cellWidth) {
          lastestWdithRef.current = cellWidth;
          needCalcSize = true;
        }
      }
      masornyCore.setVisionWdith(visionWidth);
    }

    if (needCalcSize) {
      setPreRenderIds(latestDataRef.current.map(item => item[keyField]));
    }

    requestAnimationFrame(async () => {
      masornyCore.setColumCount(column);
      const [nextRecords, nextTotalHeight, renderIndexes] =
        await masornyCore.reset(needCalcSize);

      setPreRenderIds([]);
      setRecords(nextRecords);
      setTotalHeight(nextTotalHeight);
      setRenderIndexes(renderIndexes);
    });
  }, [cellWidth, column, initialized, keyField, visionWidth]);

  // 重置（container 变化时）
  useEffect(() => {
    reset();
  }, [reset]);

  // 上次数据引用
  const latestDataRef = useRef(data);

  useEffect(() => {
    if (!initialized) return;

    const masonryCore = masonryCoreRef.current;
    if (!masonryCore) return;

    const needPreRenderIds = masonryCore.updateData(
      latestDataRef.current,
      data,
      keyField
    );

    latestDataRef.current = data;

    setPreRenderIds(needPreRenderIds);

    requestAnimationFrame(async () => {
      const [nextRecords, nextTotalHeight, renderIndexes] =
        await masonryCore.render();

      setPreRenderIds([]);
      setRecords(nextRecords);
      setTotalHeight(nextTotalHeight);
      setRenderIndexes(renderIndexes);
    });
  }, [initialized, data, keyField]);

  /************************************************
   * ✨ 滚动
   ************************************************/

  // 滚动事件
  const handleScroll = throttle(
    useCallback(() => {
      const containerDOM = containerRef.current;
      if (!containerDOM) return;

      const masonryCore = masonryCoreRef.current;
      if (!masonryCore) return;

      const containerTop = containerDOM.getBoundingClientRect().top;

      const [nextRecords, nextTotalHeight, renderIndexes] =
        masonryCore.onScroll(containerTop);

      setRecords(nextRecords);
      setTotalHeight(nextTotalHeight);
      setRenderIndexes(renderIndexes);

      // 触底
      if (
        -containerTop + window.innerHeight + loadDistance >= nextTotalHeight &&
        data.length
      ) {
        touchBottom?.();
      }
    }, [data.length, loadDistance, touchBottom]),
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
    <div
      ref={containerRef}
      className='relative min-h-screen w-full'
      style={calcFillerStyle}>
      {renderIndexes.map(index => {
        const record = records[index];
        if (!record) return null;
        return children(index, record);
      })}
      <div ref={preRenderContainerRef} className='invisible absolute'>
        {preRenderIds.map(id => {
          const index = data.findIndex(item => item[keyField] === id);
          return (
            <div key={id} data-id={id}>
              {children(index, {
                x: 0,
                y: 0,
                width: Math.min(cellWidth, visionWidth),
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
