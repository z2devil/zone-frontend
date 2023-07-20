'use client';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useEffect, useRef, useState } from 'react';

interface INote {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NotePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<INote[]>([]);

  const [column, setColumn] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      console.log('width', width);
      if (!width) return;
      if (width < 1440) {
        setColumn(1);
      } else {
        setColumn(2);
      }
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

  const handleLoadData = (id?: number) => {
    console.log('load next', id);
    const newData = Array.from({ length: 30 }).map((_, index) => {
      const id = data.length + index;
      return {
        id,
        title: '标题' + id,
        content: new Array(Math.floor(Math.random() * 200) + 10)
          .fill(0)
          .map(() => '内容')
          .join(''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
    return new Promise<INote[]>(resolve => {
      setTimeout(() => {
        setData(prev => [...prev, ...newData]);
        resolve(newData);
      }, 200);
    });
  };

  return (
    <div
      className='mx-auto flex flex-1 flex-col max-lg:w-full lg:max-2xl:w-[30rem] 2xl:w-[61.25rem]'
      ref={containerRef}>
      <PageBanner
        title='笔记'
        lastUpdated='Sun Jul 09 2023 15:04:58 GMT+0800 (中国标准时间)'
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
