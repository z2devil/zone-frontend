'use client';

import { getNotesAPI } from '@/lib/api/notes';
import Masonry from '@/ui/Masonry';
import NoteCard from '@/ui/NoteCard';
import PageBanner from '@/ui/PageBanner';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationType } from '@/ui/Notification/components/Notification';
import { useAuthStore, useNotificationUtilsStore } from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import EmptyInfo from '@/ui/EmptyInfo';
import { CARD_WIDTH, GAP } from '@/ui/Masonry/constants';
import clsx from 'clsx';
import { CategoryEntity, getCategoriesAPI } from '@/lib/api/aggregate';
import SearchBanner from '@/ui/SearchBanner';
import { isEqual, sortBy } from 'lodash';
import SearchLayer from '@/ui/SearchLayer';
import SiteRecord from '@/ui/SiteRecord/SiteRecord';
import { motion } from 'motion/react';
import { NoteCardHeightEstimator } from '@/lib/note-card-estimator';

const FETCH_SIZE = 20;

const arraysEqualUnordered = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) return false;
  const sortedArr1 = sortBy(arr1);
  const sortedArr2 = sortBy(arr2);
  return isEqual(sortedArr1, sortedArr2);
};

const NotePage = () => {
  const { notes, setNotes, filter, setFilterTags, setFilterContent } =
    useNotesStore();

  const latestSearchTag = useRef<string[]>([]);

  const latestSearchContent = useRef<string>(undefined);

  const [request] = useRequest();

  const token = useAuthStore(state => state.token);

  const latestActor = useRef<string | null>(undefined);

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const [noteTotal, setNoteTotal] = useState(Infinity);

  const containerRef = useRef<HTMLDivElement>(null);

  const [contentWidth, setContentWidth] = useState(0);

  const currentRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);

  const isLoadingRef = useRef(isLoading);

  const requestIdRef = useRef(0);

  const [heightEstimator] = useState(() => new NoteCardHeightEstimator());

  const [measurementVersion, setMeasurementVersion] = useState(0);

  const estimateNoteSize = useCallback(
    (note: (typeof notes)[number], width: number) =>
      heightEstimator.estimate(note, width),
    [heightEstimator]
  );

  const getNoteKey = useCallback(
    (note: (typeof notes)[number]) => note._id,
    []
  );

  useEffect(() => {
    heightEstimator.retain(new Set(notes.map(note => note._id)));
  }, [heightEstimator, notes]);

  useEffect(() => {
    if (!document.fonts) return;
    let active = true;

    document.fonts.ready.then(() => {
      if (!active) return;
      heightEstimator.clear();
      setMeasurementVersion(version => version + 1);
    });

    return () => {
      active = false;
    };
  }, [heightEstimator]);

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
      if (isLoadingRef.current && !force) return;
      const requestId = ++requestIdRef.current;
      isLoadingRef.current = true;
      setIsLoading(true);
      const current = currentRef.current;
      const nextCurrent = current + 1;
      currentRef.current = nextCurrent;
      try {
        const res = await getNotesAPI(request)({
          current: nextCurrent,
          size: FETCH_SIZE,
          tags: filter.tags.length ? filter.tags : void 0,
          search: filter.content,
        });
        if (requestId !== requestIdRef.current) return;
        setNotes(current === 0 ? res.list : notes.concat(res.list));
        setNoteTotal(res.total);
        return res.list;
      } finally {
        if (requestId === requestIdRef.current) {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [notes, noteTotal, request, filter.tags, filter.content, setNotes]
  );

  useEffect(() => {
    const actorChanged = latestActor.current !== token;
    if (
      !actorChanged &&
      filter.content === latestSearchContent.current &&
      arraysEqualUnordered(filter.tags, latestSearchTag.current)
    ) {
      return;
    }
    latestSearchContent.current = filter.content;
    latestSearchTag.current = filter.tags;
    latestActor.current = token;
    currentRef.current = 0;
    setNoteTotal(Infinity);
    if (actorChanged) setNotes([]);
    handleLoadData(true);
  }, [handleLoadData, setNotes, filter.content, filter.tags, token]);

  const [showSearchLayer, setShowSearchLayer] = useState(false);

  const handleSearchClick = useCallback(() => {
    setShowSearchLayer(true);
  }, []);

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

  useEffect(() => {
    let active = true;
    setCategories([]);
    getCategoriesAPI(request)().then(res => {
      if (active) setCategories(res);
    });
    return () => {
      active = false;
    };
  }, [request, token]);

  const handleCategoryClick = useCallback(
    (id?: string) => {
      if (id === void 0) {
        setFilterTags([]);
      } else {
        setFilterTags([id]);
      }
    },
    [setFilterTags]
  );

  const handleCancelSearch = useCallback(() => {
    setFilterContent();
  }, [setFilterContent]);

  return (
    <div
      className='mx-auto flex h-full w-full flex-col items-center px-5'
      ref={containerRef}>
      {filter.content ? (
        <SearchBanner
          content={filter.content}
          total={noteTotal}
          onCancelSearch={handleCancelSearch}
          onSearchAgain={() => setShowSearchLayer(true)}
        />
      ) : (
        <PageBanner
          canSearch
          containerWidth={contentWidth}
          lastUpdated={lastUpdated}
          title='笔记'
          onChartClick={handleChartClick}
          onSearchClick={handleSearchClick}
        />
      )}
      <motion.div
        className='relative mx-auto mb-5 flex w-full snap-x gap-5 overflow-x-auto'
        exit={{ opacity: 0, top: -50 }}
        initial={{ opacity: 0, top: -50 }}
        style={{
          width: contentWidth + 'px',
          scrollbarWidth: 'none',
        }}
        transition={{ type: 'tween' }}
        whileInView={{
          opacity: 1,
          top: 0,
        }}>
        <div
          className='w-30 group flex shrink-0 cursor-pointer snap-start items-center justify-between gap-2 rounded-3xl bg-white px-5 py-4 ring-1 ring-inset ring-black-50 duration-100 hover:ring-primary-50'
          onClick={() => handleCategoryClick()}>
          <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='flex gap-[6px] text-17 font-semibold text-black-250'>
              <span className='truncate text-black-600 transition-colors duration-100 group-hover:text-primary-50'>
                全部
              </span>
            </div>
          </div>
          <div className='flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-black-250 transition-colors duration-100 group-hover:text-primary-50'>
            <span className='iconfont icon-angle-right font-semibold'></span>
          </div>
        </div>
        {categories.map(category => (
          <div
            className={clsx(
              'group flex w-60 shrink-0 cursor-pointer snap-start items-center justify-between gap-2 rounded-3xl bg-white px-5 py-4 ring-1 ring-inset ring-black-50 duration-100 hover:ring-primary-50',
              {
                'ring-primary-50': filter.tags.includes(category._id),
              }
            )}
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}>
            <div className='flex flex-1 flex-col overflow-hidden'>
              <div className='flex gap-[6px] text-17 font-semibold text-black-250'>
                <span className='truncate text-black-600 transition-colors duration-100 group-hover:text-primary-50'>
                  {category.label}
                </span>
                <span className='shrink-0'>·</span>
                <span className='shrink-0'>{category.count}篇</span>
              </div>
              <span className='truncate text-xs text-black-250'>
                {category.latestNote.title || '随笔'}
              </span>
            </div>
            <div className='flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-black-250 transition-colors duration-100 group-hover:text-primary-50'>
              <span className='iconfont icon-angle-right font-semibold'></span>
            </div>
          </div>
        ))}
      </motion.div>
      <Masonry
        columnWidth={CARD_WIDTH}
        contentWidthChange={handleContentWidthChange}
        data={notes}
        estimateSize={estimateNoteSize}
        gap={GAP}
        getItemKey={getNoteKey}
        measurementVersion={measurementVersion}
        touchBottom={handleLoadData}>
        {record => {
          if (!record.meta) return null;
          return (
            <NoteCard
              key={record.meta._id}
              note={record.meta}
              reservedHeight={record.height}
            />
          );
        }}
      </Masonry>
      <motion.div className='flex w-full items-center justify-center py-4'>
        {notes.length === 0 ? (
          <EmptyInfo tip='暂无笔记' />
        ) : (
          <div
            className={clsx('text-17 text-black-600', {
              invisible: !isLoading,
            })}>
            加载中...
          </div>
        )}
      </motion.div>
      <SearchLayer
        show={showSearchLayer}
        onHide={() => setShowSearchLayer(false)}
      />
      <SiteRecord />
    </div>
  );
};

export default NotePage;
