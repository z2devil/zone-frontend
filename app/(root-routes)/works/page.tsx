'use client';

import { NoteTypeEnum, getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useMemo, useRef, useState } from 'react';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import EmptyInfo from '@/ui/EmptyInfo';
import { CARD_WIDTH, GAP } from '@/ui/Masonry/constants';
import { useNotesStore } from '@/lib/stores/notes';
import clsx from 'clsx';

const FETCH_SIZE = 20;

const WorksPage = () => {
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
      });
      isLoadingRef.current = false;
      setIsLoading(false);
      setNotes(current === 0 ? res.list : notes.concat(res.list));
      setNoteTotal(res.total);
      return res.list;
    },
    [notes, noteTotal, request, setNotes]
  );

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
      className='mx-auto flex h-full w-full flex-col items-center overflow-y-auto px-5'
      ref={containerRef}>
      <PageBanner
        lastUpdated={lastUpdated}
        title='作品'
        onChartClick={handleChartClick}
      />
      <Masonry
        columnWidth={CARD_WIDTH}
        data={notes}
        gap={GAP}
        touchBottom={handleLoadData}>
        {record => {
          if (!record.meta) return null;
          return (
            <NoteCard
              key={record.meta._id}
              note={record.meta}
              style={{
                position: 'absolute',
                width: `${record.width}px`,
                transform: `translate(${record.x}px, ${record.y}px)`,
                overflow: 'hidden',
              }}
            />
          );
        }}
      </Masonry>
      <div className='flex w-full items-center justify-center py-4'>
        {notes.length === 0 ? (
          <EmptyInfo tip='暂无作品' />
        ) : (
          <div
            className={clsx('text-17 text-black-600', {
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
