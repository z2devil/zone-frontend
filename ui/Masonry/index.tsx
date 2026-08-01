'use client';

import {
  CSSProperties,
  Key,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import {
  calculateMasonryGeometry,
  calculateMasonryOverscan,
  MasonryGeometry,
} from '@/ui/Masonry/layout';

export interface MasonryRecord<T> {
  height: number;
  meta: T;
  width: number;
}

interface MasonryProps<T> {
  bufferOffset?: number;
  children: (record: MasonryRecord<T>) => ReactNode;
  columnWidth: number;
  contentWidthChange?: (width: number) => void;
  data: T[];
  estimateSize: (item: T, width: number) => number;
  gap?: number;
  getItemKey: (item: T) => Key;
  loadDistance?: number;
  measurementVersion?: number;
  touchBottom?: () => void;
}

interface VirtualizedMasonryProps<T> extends MasonryProps<T> {
  geometry: MasonryGeometry;
  scrollMargin: number;
}

const getElementContentWidth = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  return Math.max(
    0,
    element.clientWidth -
      Number.parseFloat(style.paddingLeft || '0') -
      Number.parseFloat(style.paddingRight || '0')
  );
};

const readDocumentOffset = (element: HTMLElement) =>
  element.getBoundingClientRect().top + window.scrollY;

const measureElementHeight = (
  element: Element,
  entry: ResizeObserverEntry | undefined
) => {
  const borderBoxSize = entry?.borderBoxSize;
  let height: number;
  if (borderBoxSize) {
    const size = Array.isArray(borderBoxSize)
      ? borderBoxSize[0]
      : borderBoxSize;
    height = size?.blockSize || element.getBoundingClientRect().height;
  } else {
    height = element.getBoundingClientRect().height;
  }

  const measuredHeight = `${height}px`;
  const htmlElement = element as HTMLElement;
  if (
    htmlElement.style.getPropertyValue('--masonry-measured-height') !==
    measuredHeight
  ) {
    htmlElement.style.setProperty('--masonry-measured-height', measuredHeight);
  }
  return height;
};

const VirtualizedMasonry = <T,>({
  bufferOffset = 1200,
  children,
  data,
  estimateSize,
  gap = 20,
  geometry,
  getItemKey,
  loadDistance = 600,
  measurementVersion = 0,
  scrollMargin,
  touchBottom,
}: VirtualizedMasonryProps<T>) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const previousDataRef = useRef<T[]>(data);

  const estimateItemSize = useCallback(
    (index: number) =>
      Math.max(1, estimateSize(data[index], geometry.cardWidth)),
    [data, estimateSize, geometry.cardWidth]
  );

  const getVirtualItemKey = useCallback(
    (index: number) => getItemKey(data[index]),
    [data, getItemKey]
  );

  const averageEstimatedItemHeight = useMemo(() => {
    if (data.length === 0) return 480;
    const sample = data.slice(0, 20);
    const total = sample.reduce(
      (sum, item) => sum + Math.max(1, estimateSize(item, geometry.cardWidth)),
      0
    );
    return total / sample.length;
  }, [data, estimateSize, geometry.cardWidth]);

  const overscan = calculateMasonryOverscan(
    bufferOffset,
    geometry.columnCount,
    averageEstimatedItemHeight
  );

  const virtualizer = useWindowVirtualizer<HTMLDivElement>({
    count: data.length,
    directDomUpdates: true,
    directDomUpdatesMode: 'transform',
    estimateSize: estimateItemSize,
    gap,
    getItemKey: getVirtualItemKey,
    laneAssignmentMode: 'estimate',
    lanes: geometry.columnCount,
    measureElement: measureElementHeight,
    overscan,
    scrollMargin,
  });

  useLayoutEffect(() => {
    if (measurementVersion > 0) virtualizer.measure();
  }, [measurementVersion, virtualizer]);

  useLayoutEffect(() => {
    const previousData = previousDataRef.current;
    const previousByKey = new Map(
      previousData.map(item => [getItemKey(item), item] as const)
    );
    const changedExistingItem = data.some(item => {
      const previous = previousByKey.get(getItemKey(item));
      return previous !== undefined && previous !== item;
    });

    previousDataRef.current = data;
    if (changedExistingItem) virtualizer.measure();
  }, [data, getItemKey, virtualizer]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      !touchBottom ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) touchBottom();
      },
      {
        root: null,
        rootMargin: `0px 0px ${loadDistance}px 0px`,
      }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadDistance, touchBottom]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className='relative w-full' ref={virtualizer.containerRef}>
      {virtualItems.map(virtualItem => {
        const left =
          geometry.contentOffset +
          virtualItem.lane * (geometry.cardWidth + gap);
        const item = data[virtualItem.index];
        const style: CSSProperties = {
          left,
          position: 'absolute',
          top: 0,
          width: geometry.cardWidth,
        };

        return (
          <div
            data-index={virtualItem.index}
            key={virtualItem.key}
            ref={virtualizer.measureElement}
            style={style}>
            {children({
              height: virtualItem.size,
              meta: item,
              width: geometry.cardWidth,
            })}
          </div>
        );
      })}
      <div
        aria-hidden
        className='pointer-events-none absolute bottom-0 h-px w-full'
        ref={sentinelRef}
      />
    </div>
  );
};

const Masonry = <T,>({
  children,
  columnWidth,
  contentWidthChange,
  data,
  estimateSize,
  gap = 20,
  getItemKey,
  touchBottom,
  ...props
}: MasonryProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialLoadRequestedRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollMargin, setScrollMargin] = useState(0);

  const geometry = useMemo(
    () => calculateMasonryGeometry(containerWidth, columnWidth, gap),
    [columnWidth, containerWidth, gap]
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      setContainerWidth(getElementContentWidth(container));
      setScrollMargin(readDocumentOffset(container));
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);
    if (container.parentElement) observer.observe(container.parentElement);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    contentWidthChange?.(geometry.contentWidth);
  }, [contentWidthChange, geometry.contentWidth]);

  useEffect(() => {
    if (initialLoadRequestedRef.current) return;
    initialLoadRequestedRef.current = true;
    touchBottom?.();
  }, [touchBottom]);

  const geometryKey = `${geometry.columnCount}:${geometry.cardWidth}`;

  return (
    <div className='relative w-full' ref={containerRef}>
      {geometry.cardWidth > 0 ? (
        <VirtualizedMasonry
          {...props}
          key={geometryKey}
          children={children}
          columnWidth={columnWidth}
          data={data}
          estimateSize={estimateSize}
          gap={gap}
          geometry={geometry}
          getItemKey={getItemKey}
          scrollMargin={scrollMargin}
          touchBottom={touchBottom}
        />
      ) : null}
    </div>
  );
};

export default Masonry;
