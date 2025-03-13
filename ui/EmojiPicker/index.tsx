'use client';

import clsx from 'clsx';
import data from '@emoji-mart/data';
import type { EmojiMartData } from '@emoji-mart/data';
import { useRef, useState, useMemo } from 'react';
import { Input } from '@/ui/components/ui/input';
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area';
import EmptyInfo from '../EmptyInfo';

interface EmojiPickerProps {
  className?: string;
  onClick: (emoji: string) => void;
}

const EmojiPicker = (props: EmojiPickerProps) => {
  const { className, onClick } = props;

  const [searchContent, setSearchContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const emojis = useRef((data as EmojiMartData).emojis);

  const filteredEmojis = useMemo(() => {
    const filtered = Object.keys(emojis.current).filter(key => {
      const emoji = emojis.current[key];
      const matchesSearch =
        emoji.skins[0].native.includes(searchContent) ||
        emoji.keywords.some(code => code.includes(searchContent));
      const matchesCategory =
        selectedCategory === 'all' ||
        (data as EmojiMartData).categories
          .find(cate => cate.id === selectedCategory)
          ?.emojis.includes(key);
      return matchesSearch && matchesCategory;
    });
    return filtered.reduce(
      (acc, key) => {
        acc[key] = true;
        return acc;
      },
      {} as Record<string, true>
    );
  }, [searchContent, selectedCategory]);

  const filteredCategories = useMemo(() => {
    return (data as EmojiMartData).categories.filter(
      cate =>
        (selectedCategory === 'all' || cate.id === selectedCategory) &&
        cate.emojis.some(emoji => filteredEmojis[emoji])
    );
  }, [filteredEmojis, selectedCategory]);

  return (
    <div className={clsx(className)}>
      <div className='sticky top-0 z-10 bg-white'>
        <ScrollArea className='mb-1 w-full whitespace-nowrap pb-3'>
          <div className='flex w-max space-x-1'>
            <button
              className={clsx('inline-block rounded-lg px-2 py-1', {
                'bg-blue-500 text-white': selectedCategory === 'all',
                'bg-gray-200': selectedCategory !== 'all',
              })}
              onClick={() => setSelectedCategory('all')}>
              All
            </button>
            {(data as EmojiMartData).categories.map(cate => (
              <button
                className={clsx('inline-block rounded-lg px-2 py-1', {
                  'bg-blue-500 text-white': selectedCategory === cate.id,
                  'bg-gray-200': selectedCategory !== cate.id,
                })}
                key={cate.id}
                onClick={() => setSelectedCategory(cate.id)}>
                {cate.id}
              </button>
            ))}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
        <Input
          className='mb-4 rounded-lg'
          placeholder='搜索'
          value={searchContent}
          onChange={e => setSearchContent(e.target.value)}
        />
      </div>
      <div>
        {filteredCategories.length > 0 ? (
          filteredCategories.map(cate => (
            <div className='mb-4' key={cate.id}>
              <h2 className='mb-2 text-lg font-semibold'>{cate.id}</h2>
              <div className='grid grid-cols-[repeat(auto-fill,minmax(32px,1fr))] gap-2'>
                {cate.emojis
                  .filter(emoji => filteredEmojis[emoji])
                  .map((emoji, i) => (
                    <span
                      className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xl hover:bg-gray-200'
                      key={i}
                      onClick={() =>
                        onClick(emojis.current[emoji].skins[0].native)
                      }>
                      {emojis.current[emoji].skins[0].native}
                    </span>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyInfo tip='无结果' />
        )}
      </div>
    </div>
  );
};
export default EmojiPicker;
