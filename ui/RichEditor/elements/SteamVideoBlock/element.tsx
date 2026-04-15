import { useReadOnly, useSelected } from 'slate-react';
import { SteamVideoBlockElement } from 'types/slate';
import SteamVideoPreview from './components/Preview';
import SteamVideoEdit from './components/Edit';
import clsx from 'clsx';
import HiddenPlaceholder from '@/ui/RichEditor/components/HiddenPlaceholder';

interface SteamVideoBlockProps {
  attributes: any;
  children: any;
  element: SteamVideoBlockElement;
}

const SteamVideoBlock = ({
  attributes,
  children,
  element,
}: SteamVideoBlockProps) => {
  const readOnly = useReadOnly();

  const selected = useSelected();

  return (
    <div {...attributes} className='my-2' contentEditable={false}>
      <div
        className={clsx(
          'flex min-h-6 gap-2 overflow-hidden rounded-lg bg-gray-50',
          {
            border: !readOnly,
            'border-primary-50': !readOnly && selected,
            'border-transparent': readOnly || (!readOnly && !selected),
            'hover:border-gray-300': !readOnly && !selected,
          }
        )}>
        {readOnly ? (
          <SteamVideoPreview element={element} />
        ) : (
          <SteamVideoEdit element={element} />
        )}
      </div>
      <HiddenPlaceholder>{children}</HiddenPlaceholder>
    </div>
  );
};

export default SteamVideoBlock;
