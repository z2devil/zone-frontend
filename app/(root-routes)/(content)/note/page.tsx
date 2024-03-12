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
import { useUnmount } from 'react-use';

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

  useUnmount(() => {
    setNotes([]);
  });

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
    setNotes([...notes, ...res.list]);
    setNoteTotal(res.total);
    return res.list;
  }, [current, notes, request, setNotes, noteTotal]);

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const handleChartClick = () => {
    notificationUtils?.open({
      type: NotificationType.WARNING,
      content: '暂未开放',
      duration: 3,
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
        {(index, position) => {
          const note = notes[index];
          return note ? (
            <NoteCard
              key={note._id}
              style={{
                position: 'absolute',
                width: `${position.width}px`,
                maxHeight: `30rem`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                overflow: 'hidden',
              }}
              note={note}
            />
          ) : null;
        }}
      </Masonry>
      <div className=' flex w-full items-center justify-center py-4'>
        {isLoading ? (
          <div className=' text-17 text-black-600'>加载中...</div>
        ) : notes.length === 0 ? (
          <EmptyInfo tip='暂无笔记' />
        ) : null}
      </div>
    </div>
  );
};

export default NotePage;
