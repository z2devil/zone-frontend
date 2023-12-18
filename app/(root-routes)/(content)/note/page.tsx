'use client';

import { getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import useResize from '@/ui/Masonry/hooks/useResize';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useMemo, useRef, useState } from 'react';
import px2number from '@/lib/utils/px2number';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import EmptyInfo from '@/ui/EmptyInfo';
import { CARD_WIDTH, GAP } from '@/ui/Masonry/constants';

const FETCH_SIZE = 20;

const NotePage = () => {
  const [request] = useRequest();

  const { notes, setNotes } = useNotesStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const [current, setCurrent] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  // 容器尺寸 & 列数
  const [containerRect, column] = useResize(containerRef, {
    delay: 400,
  });

  // 最后更新时间
  const lastUpdated = useMemo(() => {
    if (!notes.length) return;
    return notes[0].createdAt;
  }, [notes]);

  // 容器矩形信息
  const calcContainerRectInfo = useMemo(() => {
    const containerDOM = containerRef.current;
    if (!containerDOM) return;
    const style = getComputedStyle(containerDOM);
    const width =
      px2number(style.width) -
      px2number(style.paddingLeft) -
      px2number(style.paddingRight);
    return {
      width,
      windowHeight: containerDOM.clientHeight,
      scrollTop: containerDOM.scrollTop,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRect?.width]);

  const handleLoadData = useCallback(async () => {
    const nextCurrent = current + 1;
    setCurrent(nextCurrent);
    setIsLoading(true);
    const res = await getNotesAPI(request)({
      current: nextCurrent,
      size: FETCH_SIZE,
    });
    setIsLoading(false);
    setNotes([...notes, ...res.list]);
    return res.list;
  }, [current, notes, request, setNotes]);

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
        title='笔记'
        lastUpdated={lastUpdated}
        onChartClick={handleChartClick}
      />
      {isLoading ? (
        <div className=' text-17 text-black-600'>加载中...</div>
      ) : notes.length === 0 ? (
        <EmptyInfo tip='暂无笔记' />
      ) : null}
      <Masonry
        containerRect={calcContainerRectInfo}
        column={column}
        cellWidth={CARD_WIDTH}
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
    </div>
  );
};

export default NotePage;
