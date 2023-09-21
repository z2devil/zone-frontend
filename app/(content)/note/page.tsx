'use client';

import { NoteEntity, getNotesAPI } from '@/lib/api/note';
import Masonry from '@/ui/Masonry';
import useResize from '@/ui/Masonry/hooks/useResize';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useEffect, useMemo, useRef, useState } from 'react';
import px2number from '@/lib/utils/px2number';

const FETCH_SIZE = 20;

const GAP = 20;

const CARD_WIDTH = 335;

const NotePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<NoteEntity[]>([]);

  const [column, setColumn] = useState(2);

  const [current, setCurrent] = useState(0);

  // 容器尺寸
  const [containerRect] = useResize(containerRef, {
    delay: 400,
  });

  const calcContainerRectInfo = useMemo(() => {
    const containerDOM = containerRef.current;
    if (!containerDOM) return;
    const style = getComputedStyle(containerDOM);
    const width =
      px2number(style.width) -
      px2number(style.paddingLeft) -
      px2number(style.paddingRight);
    return {
      width,
      windowHeight: containerDOM.clientHeight,
      scrollTop: containerDOM.scrollTop,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRect?.width]);

  useEffect(() => {
    const handleResize = () => {
      const containerDOM = containerRef.current;
      if (!containerDOM) return;
      const style = getComputedStyle(containerDOM);
      const containerWidth =
        px2number(style.width) -
        px2number(style.paddingLeft) -
        px2number(style.paddingRight);
      if (containerWidth < CARD_WIDTH) return;
      const column = Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP));
      setColumn(column);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRect?.width]);

  // TODO: total 问题
  const handleLoadData = async () => {
    const nextCurrent = current + 1;
    setCurrent(nextCurrent);
    const res = await getNotesAPI({
      current: nextCurrent,
      size: FETCH_SIZE,
    });
    console.log('res', res);
    // const code = res;
    // if (code !== 200) return [];
    const nextData = res.list;
    setData(prev => [...prev, ...nextData]);
    return nextData;
  };

  return (
    <div
      className='mx-auto flex h-full w-full flex-col items-center overflow-y-auto px-5'
      ref={containerRef}>
      <PageBanner
        title='笔记'
        lastUpdated='Sat Jul 08 2023 13:12:50 GMT+0800 (中国标准时间)'
      />
      <Masonry<NoteEntity>
        containerRect={calcContainerRectInfo}
        column={column}
        loadData={handleLoadData}
        gap={GAP}>
        {(id, position) => {
          const item = data.find(item => item._id === id);
          if (!item) return null;
          return (
            <NoteCard
              key={id}
              style={{
                position: 'absolute',
                width: `${CARD_WIDTH}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                overflow: 'hidden',
              }}
              type={item.type}
              title={item.title}
              content={item.content}
              date={item.createdAt}
              tags={[]}
            />
          );
        }}
      </Masonry>
    </div>
  );
};

export default NotePage;
