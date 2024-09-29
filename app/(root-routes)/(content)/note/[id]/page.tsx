'use client';

import {
  AdjacentNotes,
  NoteInfo,
  NoteTypeEnum,
  deleteNoteAPI,
  getAdjacentNotesAPI,
  getNoteAPI,
} from '@/lib/api/notes';
import { UserRole } from '@/lib/api/user';
import usePermission from '@/lib/hooks/usePermission';
import useRequest from '@/lib/hooks/useRequest';
import {
  useContextMenuUtilsStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
} from '@/lib/stores';
import { getContentSummary } from '@/lib/utils/editor';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import EmptyInfo from '@/ui/EmptyInfo';
import ImagePreview from '@/ui/ImagePreview';
import { NotificationType } from '@/ui/Notification/components/Notification';
import Editor from '@/ui/RichEditor/components/Editor';
import { BlockElementType } from '@/ui/RichEditor/constants';
import { withElementClick } from '@/ui/RichEditor/utils';
import TOC from '@/ui/TOC';
import clsx from 'clsx';
import imageLoader from 'config/image/loader';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Element, Node, createEditor } from 'slate';
import { withReact, Slate as SlateProvider } from 'slate-react';
import { ImageBlockElement } from 'types/slate';

interface NoteDetailPageProps {
  params: { id: string };
}

const NoteDetailPage = (props: NoteDetailPageProps) => {
  const { params } = props;

  const navigation = useRouter();

  const [request] = useRequest();

  const contextMenuUtils = useContextMenuUtilsStore(state => state.utils);

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const isLogin = usePermission([
    UserRole.LOGIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const [note, setNote] = useState<NoteInfo | null>(null);

  const detailTime = useMemo(
    () => dayjs(note?.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    [note]
  );

  const summaryTime = useMemo(
    () => dayjs(note?.createdAt).format('YYYY-MM-DD'),
    [note]
  );

  const [adjacentNotes, setAdjacentNotes] = useState<AdjacentNotes>({
    prev: null,
    next: null,
  });

  const prevNoteInfo = useMemo(() => {
    if (!adjacentNotes.prev) return null;
    return {
      id: adjacentNotes.prev._id,
      title: getContentSummary(adjacentNotes.prev.content),
    };
  }, [adjacentNotes]);

  const nextNoteInfo = useMemo(() => {
    if (!adjacentNotes.next) return null;
    return {
      id: adjacentNotes.next._id,
      title: getContentSummary(adjacentNotes.next.content),
    };
  }, [adjacentNotes]);

  /************************************************
   * ✨ 图像预览
   ************************************************/

  const blurDataURL = useMemo(() => {
    return getRandomRgbDataURL();
  }, []);

  const images = useMemo(() => {
    if (!note) return [];

    const content = JSON.parse(note.content) as Node[];
    if (!content) return [];

    const res: ImageBlockElement[] = [];
    const deep = (node: Node) => {
      if (!Element.isElement(node)) return;
      if (node.type === BlockElementType.IMAGE && node.url) {
        res.push(node);
      }
      if (node.children) {
        node.children.forEach(child => deep(child));
      }
    };
    content.forEach(node => deep(node));

    return res;
  }, [note]);

  const [showImagePreview, setShowImagePreview] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePreviewImage = useCallback(
    (element: ImageBlockElement) => {
      const index = images.findIndex(img => img.url === element.url);
      console.log('[ index ]', index, images, element);
      setCurrentImageIndex(index);
      setShowImagePreview(true);
    },
    [images]
  );

  const handleCloseImagePreview = useCallback(() => {
    setShowImagePreview(false);
  }, [setShowImagePreview]);

  const handleElementClick = useCallback(
    (element: Node) => {
      console.log('[ handleElementClick ]', element);
      if (
        Element.isElement(element) &&
        element.type === BlockElementType.IMAGE
      ) {
        handlePreviewImage(element);
      }
    },
    [handlePreviewImage]
  );

  /************************************************
   * ✨ 初始化
   ************************************************/

  const init = useCallback(async () => {
    try {
      const res = await getNoteAPI(request)(params.id);
      setNote(res);
      const adjacentNotes = await getAdjacentNotesAPI(request)(params.id);
      setAdjacentNotes(adjacentNotes);
      console.log('[ adjacentNotes ]', adjacentNotes);
    } catch (error) {
      return notFound();
    }
  }, [params, request]);

  useEffect(() => {
    init();
  }, [init]);

  /************************************************
   * ✨ 更多
   ************************************************/

  const handleSetting = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!note) return;
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
      note,
      notificationUtils,
      request,
    ]
  );

  const editor = useMemo(() => {
    return withElementClick(withReact(createEditor()), handleElementClick);
  }, [handleElementClick]);

  if (!note) return null;

  return (
    <SlateProvider editor={editor} initialValue={JSON.parse(note.content)}>
      <div
        className='mx-auto flex gap-8 md:w-fit'
        style={{
          minHeight: 'calc(100vh - 3.625rem)',
        }}>
        <div className='flex w-full flex-col overflow-hidden bg-gray-100 md:w-[45rem]'>
          <div className='flex flex-col gap-4 p-8'>
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
            <div className='mb-4 flex items-center justify-between gap-10'>
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
                  className='overflow-hidden text-ellipsis whitespace-nowrap text-19 font-semibold text-black-900 group-hover:text-primary-50'
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
            <div className='relative flex flex-1 flex-col overflow-hidden'>
              <Editor readonly />
            </div>
            {/* 底部 */}
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
          </div>
          {/* 上下页 */}
          <div className='flex flex-col gap-4 p-5 md:flex-row'>
            <Link
              className={clsx(
                'group flex h-16 flex-1 cursor-pointer items-center justify-start gap-2.5 overflow-hidden rounded-xl border border-transparent bg-black-50 px-3.5 py-2.5 transition-colors duration-100 hover:border-blue-600',
                {
                  'pointer-events-none': !prevNoteInfo,
                }
              )}
              href={`/note/${prevNoteInfo?.id}`}>
              <span className='iconfont icon-angle-left relative shrink-0 text-19 font-semibold text-black-600 transition-colors duration-100 group-hover:text-primary-50' />
              <span
                className='flex-1 truncate text-base font-semibold text-black-600 transition-colors duration-100 group-hover:text-primary-50'
                title={prevNoteInfo?.title}>
                {'上一篇：' + (prevNoteInfo?.title || '无')}
              </span>
            </Link>
            <Link
              className={clsx(
                'group flex h-16 flex-1 cursor-pointer items-center justify-end gap-2.5 overflow-hidden rounded-xl border border-transparent bg-black-50 px-3.5 py-2.5 transition-colors duration-100 hover:border-blue-600',
                {
                  'pointer-events-none': !nextNoteInfo,
                }
              )}
              href={`/note/${nextNoteInfo?.id}`}>
              <span
                className='flex-1 truncate text-base font-semibold text-black-600 transition-colors duration-100 group-hover:text-primary-50'
                title={nextNoteInfo?.title}>
                {'下一篇：' + (nextNoteInfo?.title || '无')}
              </span>
              <span className='iconfont icon-angle-right relative shrink-0 text-19 font-semibold text-black-600 transition-colors duration-100 group-hover:text-primary-50' />
            </Link>
          </div>
          {/* 评论 */}
          <div className='flex px-5 pb-20 pt-5'>
            <EmptyInfo tip='暂无评论' />
          </div>
        </div>
        <TOC className='sticky top-24 hidden h-fit shrink-0 lg:flex' />
      </div>
      {showImagePreview ? (
        <ImagePreview
          images={images}
          index={currentImageIndex}
          onClose={handleCloseImagePreview}
        />
      ) : null}
    </SlateProvider>
  );
};

export default NoteDetailPage;
