import dayjs from '@/utils/dayjs';
import ReactMarkdown from 'react-markdown';

export enum NoteCardType {
  Note = 0,
  ARTICLE,
}

interface NoteCardProps {
  type: NoteCardType;
  title: string;
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
      className=' flex w-[30rem] flex-col gap-2.5 rounded-xl border border-gray-300 bg-gray-100 p-7 transition-colors hover:border-primary-50'
      style={style}>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-10'>
          {type === NoteCardType.Note ? (
            <div className='flex items-center gap-1'>
              <i className='iconfont icon-calendar text-[1.06rem] leading-[1.06rem] text-black-400' />
              <span className='text-[0.75rem] leading-[0.75rem] text-black-400'>
                {dayjs(date).format('YYYY-MM-DD')}
              </span>
            </div>
          ) : (
            <span className='overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-black-900'>
              {title}
            </span>
          )}
          <button className=' flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[0.5rem] border border-transparent transition-all duration-100 hover:border-primary-50 hover:bg-gray-200'>
            <i className='iconfont icon-more text-black-400 hover:text-black-600' />
          </button>
        </div>
        <div className='text-justify text-[0.9rem] text-black-600'>
          {type === NoteCardType.Note ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            content
          )}
        </div>
        {type === NoteCardType.ARTICLE && (
          <div className='flex items-center justify-between gap-1'>
            <div className='flex items-center gap-1'>
              <i className='iconfont icon-calendar text-[1.06rem] leading-[1.06rem] text-black-400' />
              <span className='text-[0.75rem] leading-[0.75rem] text-black-400'>
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
