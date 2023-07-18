'use client';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useEffect, useRef, useState } from 'react';

interface INote {
  id: number;
  height: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const NotePage = () => {
  const [data, setData] = useState<INote[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [containerDOM, setContainerDOM] = useState<Element>();

  useEffect(() => {
    if (containerRef.current) {
      const parentDOM = containerRef.current.parentElement;
      parentDOM && setContainerDOM(parentDOM);
    }
  }, []);

  const handleLoadNext = (id?: number) => {
    console.log('load next', id);
    const newData = Array.from({ length: 30 }).map((_, index) => ({
      id: data.length + index + (id || 0),
      height: Math.floor(Math.random() * 200) + 100,
      title:
        new Array(Math.floor(Math.random() * 10) + 5)
          .fill(0)
          .map(() => '标题')
          .join('') + index,
      content: new Array(Math.floor(Math.random() * 200) + 10)
        .fill(0)
        .map(() => '内容')
        .join(''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
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
          column={2}
          loadNext={handleLoadNext}>
          {(index, position) => {
            const item = data[index];
            return (
              <NoteCard
                index={index}
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
