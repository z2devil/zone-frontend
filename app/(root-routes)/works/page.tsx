'use client';

import { NoteTypeEnum, getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import EmptyInfo from '@/ui/EmptyInfo';
import { CARD_WIDTH, GAP } from '@/ui/Masonry/constants';
import { useNotesStore } from '@/lib/stores/notes';
import clsx from 'clsx';
import SearchBanner from '@/ui/SearchBanner';
import { useRouter, useSearchParams } from 'next/navigation';

const FETCH_SIZE = 20;

const WorksPage = () => {
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
        type: NoteTypeEnum.ARTICLE,
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

  const handleCancelSearch = useCallback(() => {
    router.push('/works');
  }, [router]);

  return (
    <div
      className='mx-auto flex h-full w-full flex-col items-center overflow-y-auto px-5'
      ref={containerRef}>
      {searchContent ? (
        <SearchBanner
          content={searchContent}
          total={noteTotal}
          onCancelSearch={handleCancelSearch}
        />
      ) : (
        <PageBanner
          title='作品'
          lastUpdated={lastUpdated}
          onChartClick={handleChartClick}
        />
      )}
      <Masonry
        columnWidth={CARD_WIDTH}
        gap={GAP}
        data={notes}
        touchBottom={handleLoadData}>
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
          <EmptyInfo tip='暂无作品' />
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

export default WorksPage;
