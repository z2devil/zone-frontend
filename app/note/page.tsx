'use client';
import { NoteEntity, getNotesAPI } from '@/lib/api/note';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useEffect, useRef, useState } from 'react';

const FETCH_SIZE = 30;

const NotePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<NoteEntity[]>([]);

  const [column, setColumn] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // console.log('width', width);
      if (!width) return;
      setColumn(Math.floor((width - 400) / 500));
      // if (width < 1440) {
      //   setColumn(1);
      // } else {
      //   setColumn(2);
      // }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [containerDOM, setContainerDOM] = useState<Element>();

  useEffect(() => {
    if (containerRef.current) {
      const parentDOM = containerRef.current.parentElement;
      parentDOM && setContainerDOM(parentDOM);
    }
  }, []);

  const [current, setCurrent] = useState(0);

  // TODO: total 问题
  const handleLoadData = async (total: number) => {
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
      className='mx-auto flex flex-1 flex-col max-lg:w-full lg:max-2xl:w-[30rem] 2xl:w-[61.25rem]'
      ref={containerRef}>
      <PageBanner
        title='笔记'
        lastUpdated='Sat Jul 08 2023 13:12:50 GMT+0800 (中国标准时间)'
      />
      {containerDOM && (
        <Masonry<NoteEntity>
          container={containerDOM}
          column={column}
          loadData={handleLoadData}>
          {(index, position) => {
            const item = data[index];
            return (
              <NoteCard
                key={index}
                style={{
                  position: 'absolute',
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
      )}
    </div>
  );
};

export default NotePage;
