'use client';
import { getNotes } from '@/lib/note';
import Masonry from '@/ui/Masonry';
import NoteCard, { NoteCardType } from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useEffect, useRef, useState } from 'react';

interface INote {
  type: NoteCardType;
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const FETCH_SIZE = 30;

const NotePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<INote[]>([]);

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
    const res = await getNotes(nextCurrent, FETCH_SIZE);
    const code = res.code;
    if (code !== 200) return [];
    const nextData = res.data.list;
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
        <Masonry<INote>
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
