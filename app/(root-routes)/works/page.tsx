'use client';

import { NoteTypeEnum, getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useMemo, useRef, useState } from 'react';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import { useWorksStore } from '@/lib/stores/works';
import EmptyInfo from '@/ui/EmptyInfo';
import { useUnmount } from 'react-use';
import { CARD_WIDTH, GAP } from '@/ui/Masonry/constants';

const FETCH_SIZE = 20;

const CARD_HEIGHT = 200;

const WorksPage = () => {
  const [request] = useRequest();

  const { works, setWorks } = useWorksStore();

  const [workTotal, setWorkTotal] = useState(Infinity);

  const containerRef = useRef<HTMLDivElement>(null);

  const [current, setCurrent] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const isLoadingRef = useRef(isLoading);

  // 最后更新时间
  const lastUpdated = useMemo(() => {
    if (!works.length) return;
    return works[0].createdAt;
  }, [works]);

  useUnmount(() => {
    setWorks([]);
  });

  const handleLoadData = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (works.length >= workTotal) return;
    setIsLoading(true);
    isLoadingRef.current = true;
    const nextCurrent = current + 1;
    setCurrent(nextCurrent);
    const res = await getNotesAPI(request)({
      current: nextCurrent,
      size: FETCH_SIZE,
      type: NoteTypeEnum.ARTICLE,
    });
    setIsLoading(false);
    isLoadingRef.current = false;
    setWorks([...works, ...res.list]);
    setWorkTotal(res.total);
    return res.list;
  }, [works, workTotal, current, request, setWorks]);

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
      className='mx-auto flex h-full w-full flex-col items-center overflow-y-auto px-5'
      ref={containerRef}>
      <PageBanner
        title='作品'
        lastUpdated={lastUpdated}
        onChartClick={handleChartClick}
      />
      <Masonry
        columnWidth={CARD_WIDTH}
        gap={GAP}
        data={works}
        touchBottom={handleLoadData}>
        {(index, position) => {
          const note = works[index];
          if (!note) return null;
          return (
            <NoteCard
              key={note._id}
              style={{
                position: 'absolute',
                width: `${position.width}px`,
                height: `${CARD_HEIGHT}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                overflow: 'hidden',
              }}
              note={note}
            />
          );
        }}
      </Masonry>
      <div className=' flex w-full items-center justify-center py-4'>
        {isLoading ? (
          <div className=' text-17 text-black-600'>加载中...</div>
        ) : works.length === 0 ? (
          <EmptyInfo tip='暂无作品' />
        ) : null}
      </div>
    </div>
  );
};

export default WorksPage;
