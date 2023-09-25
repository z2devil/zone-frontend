import { NoteTypeEnum } from '@/lib/api/note';
import dayjs from '@/lib/utils/dayjs';
import ReactMarkdown from 'react-markdown';

interface NoteCardProps {
  type: NoteTypeEnum;
  title?: string;
  summary?: string;
  content: string;
  date: string;
  tags: string[];
}

const NoteCard = (
  props: NoteCardProps & {
    style: React.CSSProperties;
  }
) => {
  const { type, title, content, date, tags, style } = props;
  return (
    <div
      className=' group flex flex-col gap-2.5 rounded-xl border border-gray-300 bg-gray-100 p-5 transition-colors hover:border-primary-50'
      style={style}>
      <div className='flex flex-col gap-2'>
        {/* 顶部 */}
        <div className='flex items-center justify-between gap-10'>
          {type === NoteTypeEnum.NOTE ? (
            <div className='flex items-center gap-1'>
              <i className='iconfont icon-calender-filled text-black-250 text-[1.06rem] leading-[1.06rem]' />
              <span className='text-black-250 text-[0.75rem] leading-[0.75rem]'>
                {dayjs(date).format('YYYY-MM-DD')}
              </span>
            </div>
          ) : (
            <span className='text-black-900 overflow-hidden text-ellipsis whitespace-nowrap font-semibold group-hover:text-primary-50'>
              {title}
            </span>
          )}
          <button className=' group/more flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.5rem] border border-transparent transition-all duration-100 hover:bg-primary-50'>
            <i className='iconfont icon-ellipsis-v text-black-250 group-hover/more:text-white' />
          </button>
        </div>
        {/* 内容 */}
        <div className='text-black-600 text-justify text-[0.9rem]'>
          {type === NoteTypeEnum.NOTE ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            content
          )}
        </div>
        {/* 底部 */}
        {type === NoteTypeEnum.ARTICLE && (
          <div className='flex items-center justify-between gap-1'>
            <div className='flex items-center gap-1'>
              <i className='iconfont icon-calender-filled text-black-250 text-[1.06rem] leading-[1.06rem]' />
              <span className='text-black-250 text-[0.75rem] leading-[0.75rem]'>
                {dayjs(date).format('YYYY-MM-DD')}
              </span>
            </div>
            <div className='flex gap-2.5'>
              {tags.map((tag, i) => (
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
