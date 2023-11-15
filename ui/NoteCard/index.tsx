import { NoteEntity, NoteTypeEnum, deleteNoteAPI } from '@/lib/api/notes';
import dayjs from '@/lib/utils/dayjs';
import RichView from '../RichView';
import { useCallback } from 'react';
import { NotificationType } from '../Notification/components/Notification';
import usePermission from '@/lib/hooks/usePermission';
import { UserRole } from '@/lib/api/auth';
import {
  useContextMenuUtilsStore,
  useModalUtilsStore,
  useNotificationUtilsStore,
} from '@/lib/stores';

interface NoteCardProps {
  note: NoteEntity;
  style: React.CSSProperties;
}

const NoteCard = (props: NoteCardProps) => {
  const { note, style } = props;

  const contextMenuUtils = useContextMenuUtilsStore(state => state.utils);

  const { utils: modalUtils } = useModalUtilsStore();

  const { utils: notificationUtils } = useNotificationUtilsStore();

  const isLogin = usePermission([
    UserRole.LOGIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const handleSetting = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
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
              console.log('edit');
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
    [contextMenuUtils, isAdmin, modalUtils, note._id, notificationUtils]
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
          {isLogin ? (
            <button
              className=' group/more flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.5rem] border border-transparent transition-all duration-100 hover:bg-primary-50'
              onClick={handleSetting}>
              <i className='iconfont icon-ellipsis-v text-black-250 group-hover/more:text-white' />
            </button>
          ) : null}
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
