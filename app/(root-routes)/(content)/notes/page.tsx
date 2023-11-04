'use client';

import { NoteEntity, getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import useResize from '@/ui/Masonry/hooks/useResize';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import px2number from '@/lib/utils/px2number';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useRecoilValue } from 'recoil';
import { notificationUtilsState } from '@/lib/recoil/notification';
import { modalUtilsState } from '@/lib/recoil/modal';

const FETCH_SIZE = 20;

const GAP = 20;

const CARD_WIDTH = 335;

const NotePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<NoteEntity[]>([]);

  const [column, setColumn] = useState(2);

  const [current, setCurrent] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  // 容器尺寸
  const [containerRect] = useResize(containerRef, {
    delay: 400,
  });

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
  const handleLoadData = async () => {
    const nextCurrent = current + 1;
    setCurrent(nextCurrent);
    setIsLoading(true);
    const res = await getNotesAPI({
      current: nextCurrent,
      size: FETCH_SIZE,
    });
    setIsLoading(false);
    const nextData = res.list;
    setData(prev => [...prev, ...nextData]);
    return nextData;
  };

  /************************************************
   * ✨ 以下为测试代码
   ************************************************/

  const notificationUtils = useRecoilValue(notificationUtilsState);

  const modalUtils = useRecoilValue(modalUtilsState);

  const handleChartClick = () => {
    notificationUtils?.open({
      type: NotificationType.WARNING,
      content: '暂未开放',
      duration: 3,
    });
    if (!modalUtils) return;
    const uuid = modalUtils.open({
      title: '暂未开放',
      children: new Array(Math.ceil(Math.random() * 10))
        .fill(0)
        .map(() => '暂未开放')
        .join(''),
      okText: '确定',
      onOk: () => {
        console.log('onOk');
        modalUtils.close(uuid);
      },
      cancelText: '取消',
      onCancel: () => {
        console.log('onCancel');
        modalUtils.close();
      },
    });
  };

  return (
    <div
      className='mx-auto flex h-full w-full flex-col items-center overflow-y-auto px-5'
      ref={containerRef}>
      <PageBanner
        title='笔记'
        lastUpdated='Sat Jul 08 2023 13:12:50 GMT+0800 (中国标准时间)'
        onChartClick={handleChartClick}
      />
      {isLoading && <div>loading...</div>}
      <Masonry<NoteEntity>
        containerRect={calcContainerRectInfo}
        column={column}
        loadData={handleLoadData}
        gap={GAP}>
        {(id, position) => {
          const item = data.find(item => item._id === id);
          if (!item) return null;
          return (
            <NoteCard
              key={id}
              style={{
                position: 'absolute',
                width: `${CARD_WIDTH}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                overflow: 'hidden',
              }}
              type={item.type}
              title={item.title}
              content={item.content}
              date={item.createdAt}
              tags={[]}
            />
          );
        }}
      </Masonry>
    </div>
  );
};

export default NotePage;
