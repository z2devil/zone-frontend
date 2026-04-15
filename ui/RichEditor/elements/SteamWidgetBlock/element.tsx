import { useReadOnly, useSelected } from 'slate-react';
import { SteamWidgetBlockElement } from 'types/slate';
import SteamWidgetPreview from './components/Preview';
import SteamWidgetEdit from './components/Edit';
import clsx from 'clsx';
import HiddenPlaceholder from '@/ui/RichEditor/components/HiddenPlaceholder';

interface SteamWidgetBlockProps {
  attributes: any;
  children: any;
  element: SteamWidgetBlockElement;
}

const SteamWidgetBlock = ({
  attributes,
  children,
  element,
}: SteamWidgetBlockProps) => {
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
          <SteamWidgetPreview element={element} />
        ) : (
          <SteamWidgetEdit element={element} />
        )}
      </div>
      <HiddenPlaceholder>{children}</HiddenPlaceholder>
    </div>
  );
};

export default SteamWidgetBlock;
