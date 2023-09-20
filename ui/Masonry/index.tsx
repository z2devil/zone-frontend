'use client';

import {
  CSSProperties,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { throttle } from 'lodash';
import MasonyCore, {
  MasonryRecord,
  MasonryUpdateDataType,
  containerRectInfo,
} from './utils';

type Record = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface MasonryProps<T> {
  containerRect: containerRectInfo | undefined;
  column: number;
  gap?: number;
  bufferOffset?: number;
  loadDistance?: number;
  chunkSize?: number;
  children: (id: string, record: Record) => React.ReactNode;
  loadData?: () => Promise<T[]>;
}

let _prevColumn = 0;

const Masonry = <T extends { _id: string }>(props: MasonryProps<T>) => {
  const {
    containerRect,
    column,
    gap = 20,
    bufferOffset = 300,
    loadDistance = 600,
    chunkSize = 10,
    children,
    loadData,
  } = props;

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  // 预渲染容器引用
  const preRenderContainerRef = useRef<HTMLDivElement>(null);

  // 位置记录
  const [records, setRecords] = useState<MasonryRecord[]>([]);

  // 内容最大高度（最大范围）
  const [totalHeight, setTotalHeight] = useState(0);

  // 真实数据下标集合
  const [renderIds, setRenderIds] = useState<string[]>([]);

  // 预渲染数据下标集合
  const [preRenderIds, setPreRenderIds] = useState<string[]>([]);

  // 计算填充区域高度
  const calcFillerStyle: CSSProperties = useMemo(() => {
    return {
      height: totalHeight + 'px',
    };
  }, [totalHeight]);

  // 核心
  const masonryCoreRef = useRef<MasonyCore>();

  useEffect(() => {
    const preRenderContainerDOM = preRenderContainerRef.current;
    if (!containerRect || !preRenderContainerDOM) return;

    masonryCoreRef.current = new MasonyCore(
      column,
      preRenderContainerDOM,
      containerRect,
      {
        bufferOffset,
        gap,
      }
    );

    _prevColumn = column;

    handleLoadData();

    return () => {
      masonryCoreRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!containerRect) return;

    const preRenderContainerDOM = preRenderContainerRef.current;
    if (!preRenderContainerDOM) return;

    const masornyCore = masonryCoreRef.current;
    if (!masornyCore) return;

    if (_prevColumn !== column && (column === 1 || _prevColumn === 1)) {
      // TODO: masornyCore init
    } else {
      const [nextRecords, nextTotalHeight, renderIds] = masornyCore.reset(
        column,
        containerRect
      );

      setRecords(nextRecords);
      setTotalHeight(nextTotalHeight);
      setRenderIds(renderIds);
    }
    _prevColumn = column;
  }, [column, containerRect]);

  // 加载数据判断
  const handleLoadData = useCallback(async () => {
    const masonryCore = masonryCoreRef.current;
    if (!masonryCore) return;

    const res = (await loadData?.()) || [];

    const preRenderIds = res.map(item => item._id);

    setPreRenderIds(preRenderIds);

    requestAnimationFrame(async () => {
      const [nextRecords, nextTotalHeight, renderIds] =
        await masonryCore.updateData(MasonryUpdateDataType.ADD, preRenderIds);
      setPreRenderIds([]);
      setRecords(nextRecords);
      setTotalHeight(nextTotalHeight);
      setRenderIds(renderIds);
    });
  }, [loadData]);

  // 滚动事件
  const handleScroll = throttle(
    useCallback(() => {
      const containerDOM = containerRef.current;
      if (!containerDOM) return;

      const masonryCore = masonryCoreRef.current;
      if (!masonryCore) return;

      const [nextRecords, nextTotalHeight, renderIds] = masonryCore.onScroll(
        containerDOM.getBoundingClientRect().top
      );
      setRecords(nextRecords);
      setTotalHeight(nextTotalHeight);
      setRenderIds(renderIds);
    }, []),
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
      {renderIds.map(id => {
        const record = records.find(record => record.id === id);
        if (!record) return null;
        return children(id, record);
      })}
      <div ref={preRenderContainerRef} className='invisible absolute'>
        {preRenderIds.map(id => {
          return (
            <div key={id} data-id={id}>
              {children(id, { x: 0, y: 0, width: 0, height: 0 })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Masonry;
