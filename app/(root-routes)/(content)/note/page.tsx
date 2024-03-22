'use client';

import { getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useMemo, useRef, useState } from 'react';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import EmptyInfo from '@/ui/EmptyInfo';
import { CARD_WIDTH, GAP } from '@/ui/Masonry/constants';
import clsx from 'clsx';

const FETCH_SIZE = 20;

const NotePage = () => {
  const [request] = useRequest();

  const { notes, setNotes } = useNotesStore();

  const [noteTotal, setNoteTotal] = useState(Infinity);

  const containerRef = useRef<HTMLDivElement>(null);

  const [current, setCurrent] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const isLoadingRef = useRef(isLoading);

  // 最后更新时间
  const lastUpdated = useMemo(() => {
    if (!notes.length) return;
    return notes[0].createdAt;
  }, [notes]);

  const handleLoadData = useCallback(async () => {
    if (notes.length >= noteTotal) {
      return;
    }
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    const nextCurrent = current + 1;
    setCurrent(nextCurrent);
    const res = await getNotesAPI(request)({
      current: nextCurrent,
      size: FETCH_SIZE,
    });
    isLoadingRef.current = false;
    setIsLoading(false);
    setNotes(current === 0 ? res.list : notes.concat(res.list));
    setNoteTotal(res.total);
    return res.list;
  }, [current, notes, request, setNotes, noteTotal]);

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const handleChartClick = () => {
    notificationUtils?.open({
      type: NotificationType.WARNING,
      content: '暂未开放',
      duration: 3,
      closable: true,
    });
  };

  return (
    <div
      className='mx-auto flex h-full w-full flex-col items-center px-5'
      ref={containerRef}>
      <PageBanner
        title='笔记'
        lastUpdated={lastUpdated}
        onChartClick={handleChartClick}
      />
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
