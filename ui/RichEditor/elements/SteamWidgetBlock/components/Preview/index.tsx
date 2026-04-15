import { useMemo } from 'react';
import { SteamWidgetBlockElement } from 'types/slate';
import { useSlate } from 'slate-react';

interface SteamWidgetPreviewProps {
  element: SteamWidgetBlockElement;
}

const SteamWidgetPreview = (props: SteamWidgetPreviewProps) => {
  const { element } = props;

  const editor = useSlate();

  const isSummary = useMemo(() => {
    return editor.isSummary;
  }, [editor.isSummary]);

  const appId = useMemo(() => element.appId, [element.appId]);

  if (!appId) {
    return (
      <div className='flex h-[190px] w-full items-center justify-center rounded bg-gray-100'>
        <span className='text-sm text-gray-400'>App ID not configured</span>
      </div>
    );
  }

  if (isSummary) {
    return (
      <div className='flex h-[190px] w-full items-center justify-center rounded bg-gray-100'>
        <span className='text-sm text-gray-500'>Steam Widget</span>
      </div>
    );
  }

  return (
    <iframe
      className='h-[190px] w-full rounded border-0'
      src={`https://store.steampowered.com/widget/${appId}/`}
    />
  );
};

export default SteamWidgetPreview;
