import { TagInfo } from '@/lib/api/tags';
import clsx from 'clsx';
import { useCallback, useState } from 'react';

interface TagProps {
  children?: React.ReactNode;
  tag?: Partial<TagInfo>;
  isEdit?: boolean;
  checked?: boolean;
  onClick?: () => void;
  onSubmit?: (tag: Partial<TagInfo>) => void;
}

const Tag = (props: TagProps) => {
  const { children, tag, isEdit, checked, onClick, onSubmit } = props;

  const [editing, setEditing] = useState(false);

  const [tagName, setTagName] = useState(tag?.label || '');

  const handleClick = useCallback(() => {
    if (isEdit) {
      setEditing(true);
    } else {
      onClick?.();
    }
  }, [isEdit, onClick]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  const handleTagNameChange = useCallback(
    (event: React.InputEvent<HTMLInputElement>) => {
      setTagName(event.currentTarget.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        setEditing(false);
        onSubmit?.({
          _id: tag?._id,
          label: tagName,
        });
      }
    },
    [onSubmit, tag?._id, tagName]
  );

  return (
    <div
      className={clsx(
        'relative inline-flex h-8 cursor-pointer items-center justify-center rounded-full border bg-gray-50 px-4 text-17 transition-colors duration-100',
        checked
          ? 'border-primary-50 font-medium text-primary-50'
          : 'border-transparent text-black-400 hover:border-black-250 hover:text-black-600'
      )}
      onClick={handleClick}>
      {editing ? (
        <input
          autoFocus
          className='h-6 w-20 bg-transparent outline-none'
          value={tagName}
          onBlur={handleCancelEdit}
          onInput={handleTagNameChange}
          onKeyDown={handleKeyDown}
        />
      ) : (
        children
      )}
    </div>
  );
};

export default Tag;
