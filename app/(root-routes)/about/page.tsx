'use client';

import { NoteInfo, getNoteAPI } from '@/lib/api/notes';
import { UserRole } from '@/lib/api/user';
import usePermission from '@/lib/hooks/usePermission';
import useRequest from '@/lib/hooks/useRequest';
import { useContextMenuUtilsStore } from '@/lib/stores';
import dayjs from 'dayjs';
import { notFound, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SiteRecord from '@/ui/SiteRecord/SiteRecord';
import { withReact } from 'slate-react';
import { createEditor } from 'slate';
import { Slate as SlateProvider } from 'slate-react';
import RichEditor from '@/ui/RichEditor';
import { withPluginSetup } from '@/ui/RichEditor/plugins';

const ABOUT_ID = '65ebc4f8f3cdb3499f7c32bb';

const About = () => {
  const navigation = useRouter();

  const [request] = useRequest();

  const contextMenuUtils = useContextMenuUtilsStore(state => state.utils);

  const isLogin = usePermission([
    UserRole.LOGIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
  ]);

  const isAdmin = usePermission([UserRole.ADMIN, UserRole.MANAGER]);

  const [note, setNote] = useState<NoteInfo | null>(null);

  const editor = useMemo(() => {
    const enhancers = [withReact, withPluginSetup];
    return enhancers.reduce(
      (editor, enhancer) => enhancer(editor),
      createEditor()
    );
  }, []);

  /************************************************
   * ✨ 初始化
   ************************************************/

  const init = useCallback(async () => {
    try {
      const res = await getNoteAPI(request)(ABOUT_ID);
      setNote(res);
    } catch (error) {
      return notFound();
    }
  }, [request]);

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
        ],
        { x: e.clientX, y: e.clientY },
        document.querySelector('body') as HTMLElement
      );
    },
    [contextMenuUtils, isAdmin, navigation, note]
  );

  if (!note) return null;

  return (
    <>
      <div
        className='mx-auto flex gap-8 md:w-fit'
        style={{
          minHeight: 'calc(100vh - 3.625rem)',
        }}>
        <div className='flex w-full flex-col overflow-hidden md:w-[45rem]'>
          <div className='flex flex-col gap-4 p-8'>
            {/* 顶部 */}
            {isAdmin ? (
              <div className='flex items-center justify-between gap-10'>
                <div className='flex items-center gap-1'>
                  <i className='iconfont icon-calender-filled text-17 text-black-250' />
                  <span
                    className='text-[0.75rem] leading-[0.75rem] text-black-250'
                    title={dayjs(note.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                    {dayjs(note.createdAt).format('YYYY-MM-DD')}
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
            ) : null}
            {/* 内容 */}
            <div className='relative flex flex-1 flex-col overflow-hidden'>
              <SlateProvider
                editor={editor}
                initialValue={JSON.parse(note.content)}>
                <RichEditor readonly />
              </SlateProvider>
            </div>
            {/* 底部 */}
            <div className='flex items-center justify-between gap-1'>
              <div className='flex items-center gap-1'>
                <i className='iconfont icon-calender-filled text-17 text-black-250' />
                <span className='text-[0.75rem] leading-[0.75rem] text-black-250'>
                  {dayjs(note.createdAt).format('YYYY-MM-DD')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteRecord />
    </>
  );
};

export default About;
