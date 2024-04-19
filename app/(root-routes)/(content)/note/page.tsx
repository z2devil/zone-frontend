'use client';

import { NoteTypeEnum, getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import EmptyInfo from '@/ui/EmptyInfo';
import { CARD_WIDTH, GAP } from '@/ui/Masonry/constants';
import clsx from 'clsx';
import { CategoryEntity, getCategoriesAPI } from '@/lib/api/aggregate';
import { useMount } from 'react-use';
import { getContentSummary } from '@/lib/utils/editor';
import SearchBanner from '@/ui/SearchBanner';
import { useRouter, useSearchParams } from 'next/navigation';

const FETCH_SIZE = 20;

const NotePage = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const searchTag = searchParams.get('tag') || void 0;

  const latestSearchTag = useRef<string>();

  const searchContent = searchParams.get('search') || void 0;

  const latestSearchContent = useRef<string>();

  const [request] = useRequest();

  const { notes, setNotes } = useNotesStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const [noteTotal, setNoteTotal] = useState(Infinity);

  const containerRef = useRef<HTMLDivElement>(null);

  const [contentWidth, setContentWidth] = useState(0);

  const currentRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);

  const isLoadingRef = useRef(isLoading);

  // 最后更新时间
  const lastUpdated = useMemo(() => {
    if (!notes.length) return;
    return notes[0].createdAt;
  }, [notes]);

  const handleLoadData = useCallback(
    async (force = false) => {
      if (notes.length >= noteTotal && !force) {
        return;
      }
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoading(true);
      const current = currentRef.current;
      const nextCurrent = current + 1;
      currentRef.current = nextCurrent;
      const res = await getNotesAPI(request)({
        current: nextCurrent,
        size: FETCH_SIZE,
        tags: searchTag ? [searchTag] : void 0,
        search: searchContent,
      });
      isLoadingRef.current = false;
      setIsLoading(false);
      setNotes(current === 0 ? res.list : notes.concat(res.list));
      setNoteTotal(res.total);
      return res.list;
    },
    [notes, noteTotal, request, searchTag, searchContent, setNotes]
  );

  useEffect(() => {
    if (
      searchContent === latestSearchContent.current &&
      searchTag === latestSearchTag.current
    ) {
      return;
    }
    latestSearchContent.current = searchContent;
    latestSearchTag.current = searchTag;
    currentRef.current = 0;
    setNoteTotal(Infinity);
    handleLoadData(true);
  }, [handleLoadData, setNotes, searchContent, searchTag]);

  const handleChartClick = () => {
    notificationUtils?.open({
      type: NotificationType.WARNING,
      content: '暂未开放',
      duration: 3,
      closable: true,
    });
  };

  const handleContentWidthChange = useCallback((width: number) => {
    setContentWidth(width);
  }, []);

  /************************************************
   * ✨ 标签分类
   ************************************************/

  const [categories, setCategories] = useState<CategoryEntity[]>([]);

  useMount(async () => {
    const res = await getCategoriesAPI(request)();
    setCategories(res);
  });

  const handleCategoryClick = useCallback(
    (id?: string) => {
      router.push(`/note${id ? `?tag=${id}` : ''}`);
    },
    [router]
  );

  const handleCancelSearch = useCallback(() => {
    router.push('/note');
  }, [router]);

  return (
    <div
      className='mx-auto flex h-full w-full flex-col items-center px-5'
      ref={containerRef}>
      {searchContent ? (
        <SearchBanner
          content={searchContent}
          total={noteTotal}
          onCancelSearch={handleCancelSearch}
        />
      ) : (
        <PageBanner
          title='笔记'
          lastUpdated={lastUpdated}
          onChartClick={handleChartClick}
        />
      )}
      <div
        className='mx-auto mb-5 flex w-full snap-x gap-5 overflow-auto'
        style={{
          width: contentWidth + 'px',
          scrollbarWidth: 'none',
        }}>
        <div
          className='w-30 group flex shrink-0 cursor-pointer snap-start items-center justify-between gap-2 rounded-xl border border-black-80 bg-gray-100 px-5 py-4 transition-colors duration-100 hover:border-primary-50'
          onClick={() => handleCategoryClick()}>
          <div className=' flex flex-1 flex-col overflow-hidden'>
            <div className=' flex gap-[6px] text-17 font-semibold text-black-250'>
              <span className=' truncate text-black-600 transition-colors duration-100 group-hover:text-primary-50'>
                全部
              </span>
            </div>
          </div>
          <div className=' flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-black-250 transition-colors duration-100 group-hover:text-primary-50'>
            <span className='iconfont icon-angle-right font-semibold'></span>
          </div>
        </div>
        {categories.map(category => (
          <div
            key={category._id}
            className={clsx(
              'group flex w-60 shrink-0 cursor-pointer snap-start items-center justify-between gap-2 rounded-xl border border-black-80 bg-gray-100 px-5 py-4 transition-colors duration-100 hover:border-primary-50',
              searchTag === category._id ? 'border-primary-50' : ''
            )}
            onClick={() => handleCategoryClick(category._id)}>
            <div className=' flex flex-1 flex-col overflow-hidden'>
              <div className=' flex gap-[6px] text-17 font-semibold text-black-250'>
                <span className=' truncate text-black-600 transition-colors duration-100 group-hover:text-primary-50'>
                  {category.label}
                </span>
                <span className='shrink-0'>·</span>
                <span className='shrink-0'>{category.count}篇</span>
              </div>
              <span className=' truncate text-xs text-black-250'>
                {category.latestNote.type === NoteTypeEnum.ARTICLE
                  ? category.latestNote.summary?.replaceAll(' ', '')
                  : getContentSummary(category.latestNote.content)}
              </span>
            </div>
            <div className=' flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-black-250 transition-colors duration-100 group-hover:text-primary-50'>
              <span className='iconfont icon-angle-right font-semibold'></span>
            </div>
          </div>
        ))}
      </div>
      <Masonry
        columnWidth={CARD_WIDTH}
        gap={GAP}
        data={notes}
        touchBottom={handleLoadData}
        contentWidthChange={handleContentWidthChange}>
        {record => {
          if (!record.meta) return null;
          return (
            <NoteCard
              key={record.meta._id}
              style={{
                position: 'absolute',
                width: `${record.width}px`,
                transform: `translate(${record.x}px, ${record.y}px)`,
                overflow: 'hidden',
              }}
              note={record.meta}
            />
          );
        }}
      </Masonry>
      <div className=' flex w-full items-center justify-center py-4'>
        {notes.length === 0 ? (
          <EmptyInfo tip='暂无笔记' />
        ) : (
          <div
            className={clsx(' text-17 text-black-600', {
              invisible: !isLoading,
            })}>
            加载中...
          </div>
        )}
      </div>
    </div>
  );
};

export default NotePage;
