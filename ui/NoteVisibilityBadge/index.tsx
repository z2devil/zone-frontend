import type { NoteVisibility } from '@/lib/api/notes';

interface NoteVisibilityBadgeProps {
  visibility: NoteVisibility;
}

const NoteVisibilityBadge = ({ visibility }: NoteVisibilityBadgeProps) => {
  if (visibility !== 'private') return null;

  return (
    <span
      className='flex shrink-0 items-center gap-1 rounded-full bg-black-50 px-2 py-1 text-xs font-medium text-black-400'
      title='仅自己可见'>
      <i className='iconfont icon-lock-filled text-xs' />
      私密
    </span>
  );
};

export default NoteVisibilityBadge;
