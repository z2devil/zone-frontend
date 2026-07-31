import type { NoteVisibility } from '@/lib/api/notes';
import clsx from 'clsx';

interface VisibilitySelectorProps {
  value: NoteVisibility;
  onChange: (value: NoteVisibility) => void;
}

const choices: Array<{
  value: NoteVisibility;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'public',
    label: '公开',
    description: '所有人可见',
    icon: 'icon-eye',
  },
  {
    value: 'private',
    label: '私密',
    description: '仅自己可见',
    icon: 'icon-lock-filled',
  },
];

const VisibilitySelector = ({ value, onChange }: VisibilitySelectorProps) => (
  <fieldset className='flex flex-col'>
    <legend className='text-17 font-semibold text-black-600'>谁可以看</legend>
    <div className='mt-2 grid grid-cols-2 gap-2'>
      {choices.map(choice => {
        const checked = choice.value === value;
        return (
          <label
            className={clsx(
              'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
              checked
                ? 'border-primary-50 bg-primary-50/5 text-primary-50'
                : 'border-black-80 bg-gray-50 text-black-400 hover:border-black-250'
            )}
            key={choice.value}>
            <input
              checked={checked}
              className='sr-only'
              name='note-visibility'
              type='radio'
              value={choice.value}
              onChange={() => onChange(choice.value)}
            />
            <i className={clsx('iconfont text-xl', choice.icon)} />
            <span className='flex flex-col'>
              <span className='text-15 font-semibold'>{choice.label}</span>
              <span className='text-xs text-black-250'>
                {choice.description}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);

export default VisibilitySelector;
