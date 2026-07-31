import { NoteInfo } from '@/lib/api/notes';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import imageLoader from 'config/image/loader';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useMemo } from 'react';
import RichEditor from '../RichEditor';
import NoteVisibilityBadge from '../NoteVisibilityBadge';

interface NoteDetailProps {
  note: NoteInfo;
  isLogin: boolean;
  onSetting: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const NoteDetail = (props: NoteDetailProps) => {
  const { note, isLogin, onSetting } = props;

  const blurDataURL = useMemo(() => {
    return getRandomRgbDataURL();
  }, []);

  const detailTime = useMemo(
    () => dayjs(note?.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    [note]
  );

  const summaryTime = useMemo(
    () => dayjs(note?.createdAt).format('YYYY-MM-DD'),
    [note]
  );

  return (
    <div className='flex flex-col gap-4 p-8'>
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
      <div className='mb-4 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 overflow-hidden'>
          <div className='h-5 w-1 flex-shrink-0 rounded-full bg-primary-50'></div>
          <span
            className='overflow-hidden text-ellipsis whitespace-nowrap text-19 font-semibold text-black-900'
            title={note.title}>
            {note.title || '随笔'}
          </span>
          <NoteVisibilityBadge visibility={note.visibility} />
        </div>
        {isLogin ? (
          <button
            className='group/more flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.5rem] border border-transparent transition-all duration-100 hover:bg-primary-50'
            onClick={onSetting}>
            <i className='iconfont icon-ellipsis-v text-black-250 group-hover/more:text-white' />
          </button>
        ) : null}
      </div>
      {/* 内容 */}
      <div className='relative flex flex-1 flex-col'>
        <RichEditor readonly />
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
  );
};
