'use client';

import { NoteTypeEnum, getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import useResize from '@/ui/Masonry/hooks/useResize';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import px2number from '@/lib/utils/px2number';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useNotificationUtilsStore } from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import { useWorksStore } from '@/lib/stores/works';
import EmptyInfo from '@/ui/EmptyInfo';

const FETCH_SIZE = 20;

const GAP = 20;

const CARD_WIDTH = 335;

const CARD_HEIGHT = 200;

const WorksPage = () => {
  const [request] = useRequest();

  const { works, setWorks } = useWorksStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const [column, setColumn] = useState(2);

  const [current, setCurrent] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  // 容器尺寸
  const [containerRect] = useResize(containerRef, {
    delay: 400,
  });

  // 最后更新时间
  const lastUpdated = useMemo(() => {
    if (!works.length) return;
    return works[0].createdAt;
  }, [works]);

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

  // 计算列数
  const handleResize = useCallback(() => {
    const containerDOM = containerRef.current;
    if (!containerDOM) return;
    const style = getComputedStyle(containerDOM);
    const containerWidth =
      px2number(style.width) -
      px2number(style.paddingLeft) -
      px2number(style.paddingRight);
    if (containerWidth < CARD_WIDTH) {
      setColumn(1);
      return;
    }
    const column = Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP));
    setColumn(column);
  }, []);

  // 监听窗口变化
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRect?.width, handleResize]);

  // TODO: total 问题
  const handleLoadData = useCallback(async () => {
    const nextCurrent = current + 1;
    setCurrent(nextCurrent);
    setIsLoading(true);
    const res = await getNotesAPI(request)({
      current: nextCurrent,
      size: FETCH_SIZE,
      type: NoteTypeEnum.ARTICLE,
    });
    setIsLoading(false);
    setWorks([...works, ...res.list]);
    return res.list;
  }, [current, works, request, setWorks]);

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
      {isLoading ? (
        <div className=' text-17 text-black-600'>加载中...</div>
      ) : works.length === 0 ? (
        <EmptyInfo tip='暂无作品' />
      ) : null}
      <Masonry
        containerRect={calcContainerRectInfo}
        column={column}
        cellWidth={CARD_WIDTH}
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
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                overflow: 'hidden',
              }}
              note={note}
            />
          );
        }}
      </Masonry>
    </div>
  );
};

export default WorksPage;
