import { NoteInfo, NoteTypeEnum, deleteNoteAPI } from '@/lib/api/notes';
import dayjs from '@/lib/utils/dayjs';
import RichView from '../RichView';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationType } from '../Notification/components/Notification';
import usePermission from '@/lib/hooks/usePermission';
import { UserRole } from '@/lib/api/user';
import {
  useContextMenuUtilsStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
} from '@/lib/stores';
import useRequest from '@/lib/hooks/useRequest';
import { useNotesStore } from '@/lib/stores/notes';
import clsx from 'clsx';
import rem2px from '@/lib/utils/rem2px';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import imageLoader from 'config/image/loader';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';

interface NoteCardProps {
  note: NoteInfo;
  className?: string;
  style?: React.CSSProperties;
}

const NoteCard = (props: NoteCardProps) => {
  const { note, className, style } = props;

  const navigation = useRouter();

  const [request] = useRequest();

  const { notes, setNotes } = useNotesStore();

  const contextMenuUtils = useContextMenuUtilsStore(state => state.utils);

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const isLogin = usePermission([
    UserRole.LOGIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const detailTime = useMemo(
    () => dayjs(note.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    [note.createdAt]
  );

  const summaryTime = useMemo(
    () => dayjs(note.createdAt).format('YYYY-MM-DD'),
    [note.createdAt]
  );

  const blurDataURL = useMemo(() => {
    return getRandomRgbDataURL();
  }, []);

  const handleSetting = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      contextMenuUtils?.open(
        [
          {
            key: 'like',
            label: '喜欢',
            icon: <i className='iconfont icon-heart-filled text-17' />,
            onClick: () => {
              console.log('like');
            },
            sticky: true,
          },
          {
            key: 'share',
            label: '分享',
            icon: <i className='iconfont icon-share-filled text-17' />,
            onClick: () => {
              console.log('share');
            },
            sticky: true,
          },
          isAdmin && {
            key: 'lock',
            label: '上锁',
            icon: <i className='iconfont icon-lock-filled text-17' />,
            onClick: () => {
              console.log('lock');
            },
            sticky: true,
          },
          isAdmin && {
            key: 'edit',
            label: '编辑',
            icon: <i className='iconfont icon-edit text-19' />,
            onClick: () => {
              navigation.push(`/write/${note._id}`, {
                scroll: false,
              });
            },
          },
          isAdmin && {
            key: 'delete',
            label: '删除',
            icon: <i className='iconfont icon-trash text-19' />,
            onClick: () => {
              const uuid = modalUtils?.open({
                title: '删除',
                children: '确定要删除这篇笔记吗？',
                okText: '删除',
                onOk: async () => {
                  try {
                    await deleteNoteAPI(request)(note._id);
                    notificationUtils?.open({
                      type: NotificationType.SUCCESS,
                      content: '删除成功',
                      duration: 3,
                    });
                    setNotes(notes.filter(item => item._id !== note._id));
                  } catch (error) {
                    notificationUtils?.open({
                      type: NotificationType.ERROR,
                      content: '删除失败',
                      duration: 3,
                    });
                  } finally {
                    modalUtils.close(uuid);
                  }
                },
                cancelText: '取消',
                onCancel: () => {
                  modalUtils.close(uuid);
                },
              });
            },
          },
        ],
        { x: e.clientX, y: e.clientY },
        document.querySelector('body') as HTMLElement
      );
    },
    [
      contextMenuUtils,
      isAdmin,
      modalUtils,
      navigation,
      note._id,
      notes,
      notificationUtils,
      request,
      setNotes,
    ]
  );

  /************************************************
   * ✨ 内容收缩
   ************************************************/

  const cardRef = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const cardDOM = cardRef.current;
    if (cardDOM) {
      const maxHeight = rem2px(30);
      setIsCollapsed(cardDOM.scrollHeight > maxHeight);
    } else {
      setIsCollapsed(false);
    }
  }, []);

  return (
    <div
      className={clsx(
        twMerge(
          'group relative flex flex-col gap-2.5 overflow-hidden rounded-xl border border-black-80 bg-gray-100 p-5 transition-colors duration-200 hover:border-primary-50',
          className
        )
      )}
      ref={cardRef}
      style={style}>
      <Link href={`/note/${props.note._id}`} target='_blank'>
        <div className='flex flex-col gap-3'>
          {note.type === NoteTypeEnum.ARTICLE && note.bannerPath ? (
            <div className='relative mb-2 aspect-[3/1] w-full overflow-hidden rounded-lg'>
              <Image
                alt='封图'
                blurDataURL={blurDataURL}
                className='h-full w-full object-cover'
                height={200}
                loader={imageLoader}
                placeholder='blur'
                src={note.bannerPath}
                width={600}
              />
            </div>
          ) : null}
          {/* 顶部 */}
          <div className='flex items-center justify-between gap-10'>
            {note.type === NoteTypeEnum.NOTE ? (
              <div className='flex items-center gap-1'>
                <i className='iconfont icon-calender-filled text-17 text-black-250' />
                <span
                  className='text-[0.75rem] leading-[0.75rem] text-black-250'
                  title={detailTime}>
                  {summaryTime}
                </span>
              </div>
            ) : (
              <span
                className='overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-black-900 group-hover:text-primary-50'
                title={note.title}>
                {note.title}
              </span>
            )}
            {isLogin ? (
              <button
                className='group/more flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.5rem] border border-transparent transition-all duration-100 hover:bg-primary-50'
                onClick={handleSetting}>
                <i className='iconfont icon-ellipsis-v text-black-250 group-hover/more:text-white' />
              </button>
            ) : null}
          </div>
          {/* 内容 */}
          {note.type === NoteTypeEnum.NOTE ? (
            <div className='pointer-events-none relative flex max-h-[30rem] overflow-hidden'>
              <div className='mb-[1px] flex-1 overflow-hidden'>
                <RichView
                  isSummary
                  initialValue={JSON.parse(note.content)}
                  value={JSON.parse(note.content)}
                />
              </div>
              <div className='absolute bottom-0 left-0 right-0'>
                {isCollapsed ? (
                  <>
                    <div className='gradient-mask-y pointer-events-none absolute bottom-0 left-0 right-0 flex h-64 translate-y-32 select-none items-center justify-center gap-1 bg-gray-100'></div>
                    <div className='flex h-12 translate-y-2 cursor-pointer items-center justify-center gap-1'>
                      <span className='inline-block overflow-hidden whitespace-nowrap text-15 text-black-600'>
                        ···
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className='text-[0.9375rem] text-black-600'>
              {note.summary}
            </div>
          )}
          {/* 底部 */}
          {note.type === NoteTypeEnum.ARTICLE || note.tags.length ? (
            <div className='flex items-center justify-between gap-1'>
              {note.type === NoteTypeEnum.ARTICLE ? (
                <div className='flex items-center gap-1'>
                  <i className='iconfont icon-calender-filled text-17 text-black-250' />
                  <span
                    className='text-[0.75rem] leading-[0.75rem] text-black-250'
                    title={detailTime}>
                    {summaryTime}
                  </span>
                </div>
              ) : (
                <div />
              )}
              <div className='flex gap-2.5'>
                {note.tags.map(tag => (
                  <div
                    className='text-black text-xs font-normal text-primary-50'
                    key={tag._id}>
                    #{tag.label}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  );
};

export default NoteCard;
