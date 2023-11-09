import { NoteEntity, NoteTypeEnum, deleteNoteAPI } from '@/lib/api/notes';
import dayjs from '@/lib/utils/dayjs';
import RichView from '../RichView';
import { useRecoilValue } from 'recoil';
import { contextMenuUtilsState } from '@/lib/recoil/contextmenu';
import { useCallback } from 'react';
import { modalUtilsState } from '@/lib/recoil/modal';
import { notificationUtilsState } from '@/lib/recoil/notification';
import { NotificationType } from '../Notification/components/Notification';

interface NoteCardProps {
  note: NoteEntity;
  style: React.CSSProperties;
}

const NoteCard = (props: NoteCardProps) => {
  const { note, style } = props;

  const contextMenuUtils = useRecoilValue(contextMenuUtilsState);

  const modalUtils = useRecoilValue(modalUtilsState);

  const notificationUtils = useRecoilValue(notificationUtilsState);

  const handleSetting = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      contextMenuUtils?.open(
        [
          {
            key: 'like',
            label: '喜欢',
            onClick: () => {
              console.log('like');
            },
            icon: <i className='iconfont icon-heart-filled text-17' />,
            sticky: true,
          },
          {
            key: 'share',
            label: '分享',
            onClick: () => {
              console.log('share');
            },
            icon: <i className='iconfont icon-share-filled text-17' />,
            sticky: true,
          },
          {
            key: 'lock',
            label: '上锁',
            onClick: () => {
              console.log('lock');
            },
            icon: <i className='iconfont icon-lock-filled text-17' />,
            sticky: true,
          },
          {
            key: 'edit',
            label: '编辑',
            onClick: () => {
              console.log('edit');
            },
          },
          {
            key: 'delete',
            label: '删除',
            onClick: () => {
              const uuid = modalUtils?.open({
                title: '删除',
                children: '确定要删除这篇笔记吗？',
                okText: '删除',
                onOk: async () => {
                  console.log('delete');
                  try {
                    await deleteNoteAPI(note._id);
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
    [contextMenuUtils, modalUtils, notificationUtils, note._id]
  );

  return (
    <div
      className=' group flex flex-col gap-2.5 rounded-xl border border-black-80 bg-gray-100 p-5 transition-colors hover:border-primary-50'
      style={style}>
      <div className='flex flex-col gap-2'>
        {/* 顶部 */}
        <div className='flex items-center justify-between gap-10'>
          {note.type === NoteTypeEnum.NOTE ? (
            <div className='flex items-center gap-1'>
              <i className='iconfont icon-calender-filled text-17 text-black-250' />
              <span className='text-[0.75rem] leading-[0.75rem] text-black-250'>
                {dayjs(note.createdAt).format('YYYY-MM-DD')}
              </span>
            </div>
          ) : (
            <span className='overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-black-900 group-hover:text-primary-50'>
              {note.title}
            </span>
          )}
          <button
            className=' group/more flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.5rem] border border-transparent transition-all duration-100 hover:bg-primary-50'
            onClick={handleSetting}>
            <i className='iconfont icon-ellipsis-v text-black-250 group-hover/more:text-white' />
          </button>
        </div>
        {/* 内容 */}
        <div className='text-justify text-black-600'>
          {note.type === NoteTypeEnum.NOTE ? (
            <RichView initialValue={JSON.parse(note.content)} />
          ) : (
            note.content
          )}
        </div>
        {/* 底部 */}
        {note.type === NoteTypeEnum.ARTICLE && (
          <div className='flex items-center justify-between gap-1'>
            <div className='flex items-center gap-1'>
              <i className='iconfont icon-calender-filled text-17 text-black-250' />
              <span className='text-[0.75rem] leading-[0.75rem] text-black-250'>
                {dayjs(note.createdAt).format('YYYY-MM-DD')}
              </span>
            </div>
            <div className='flex gap-2.5'>
              {[].map((tag, i) => (
                <div
                  key={i}
                  className='text-black text-xs font-normal text-opacity-40'>
                  #{tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
