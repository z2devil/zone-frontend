import { NoteInfo, deleteNoteAPI } from '@/lib/api/notes';
import dayjs from '@/lib/utils/dayjs';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import imageLoader from 'config/image/loader';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import { isEqual } from 'lodash';
import { AnimatePresence, motion, MotionStyle } from 'motion/react';
import { Slate as SlateProvider, withReact } from 'slate-react';
import RichEditor from '../RichEditor';
import { createEditor } from 'slate';
import { withPluginSetup } from '../RichEditor/plugins';

interface NoteCardProps {
  note: NoteInfo;
  className?: string;
  style?: MotionStyle;
}

const NoteCard = (props: NoteCardProps) => {
  const { note, className, style } = props;

  const pathname = usePathname();

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

  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (pathname === '/note/' + note._id) {
      setShowDetail(true);
    } else {
      setShowDetail(false);
    }
  }, [note._id, pathname]);

  const editor = useMemo(() => {
    const enhancers = [withReact, withPluginSetup];
    const res = enhancers.reduce(
      (editor, enhancer) => enhancer(editor),
      createEditor()
    );
    res.isSummary = true;
    return res;
  }, []);

  return (
    <motion.div
      className={clsx(twMerge('relative', className))}
      ref={cardRef}
      style={style}>
      <Link href={`/note/${props.note._id}`} scroll={false}>
        <AnimatePresence>
          {!showDetail ? (
            <motion.div
              className='group relative flex flex-col gap-2.5 overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-inset ring-black-50 duration-100 hover:ring-primary-50'
              exit={{
                opacity: 0,
                top: -50,
              }}
              initial={{ opacity: 0, top: -50 }}
              transition={{ type: 'tween', duration: 0.2 }}
              whileInView={{ opacity: 1, top: 0 }}>
              <div className='flex flex-col gap-3'>
                {note.bannerPath ? (
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
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2 overflow-hidden'>
                    <div className='h-5 w-1 flex-shrink-0 rounded-full bg-primary-50'></div>
                    <span
                      className='overflow-hidden text-ellipsis whitespace-nowrap text-19 font-semibold text-black-900'
                      title={note.title}>
                      {note.title || '随笔'}
                    </span>
                  </div>
                  {isLogin ? (
                    <button
                      className='group/more flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.5rem] border border-transparent transition-all duration-100 hover:bg-primary-50'
                      onClick={handleSetting}>
                      <i className='iconfont icon-ellipsis-v text-black-250 group-hover/more:text-white' />
                    </button>
                  ) : null}
                </div>
                {/* 内容 */}
                <div className='pointer-events-none relative flex flex-col overflow-hidden'>
                  <div
                    className={clsx(
                      'mb-1 max-h-[30rem] w-full',
                      isCollapsed && 'gradient-mask-b'
                    )}>
                    <SlateProvider
                      editor={editor}
                      initialValue={JSON.parse(note.content)}>
                      <RichEditor readonly />
                    </SlateProvider>
                  </div>
                </div>
                {/* 底部 */}
                <div className='flex items-center justify-between gap-1'>
                  <div className='flex h-6 items-center gap-1 rounded-lg'>
                    <i className='iconfont icon-calender-filled text-13 leading-3 text-black-250' />
                    <span
                      className='text-[0.75rem] leading-[0.75rem] text-black-400'
                      title={detailTime}>
                      {summaryTime}
                    </span>
                  </div>
                  <div className='flex gap-2.5'>
                    {note.tags.map(tag => (
                      <div
                        className='text-black flex h-6 items-center rounded-lg bg-primary-50/5 px-2 text-xs font-normal text-primary-50'
                        key={tag._id}>
                        {tag.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
};

export default memo(NoteCard, (prev, next) => isEqual(prev, next));
