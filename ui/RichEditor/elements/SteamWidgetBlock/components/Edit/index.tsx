import { useCallback, useMemo } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { SteamWidgetBlockElement } from 'types/slate';
import { Transforms } from 'slate';

interface SteamWidgetEditProps {
  element: SteamWidgetBlockElement;
}

const SteamWidgetEdit = (props: SteamWidgetEditProps) => {
  const { element } = props;

  const editor = useSlate();

  const appId = useMemo(() => element.appId, [element.appId]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const appId = e.target.value;
      Transforms.setNodes(
        editor,
        { appId },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  return (
    <div className='flex w-full flex-col gap-3 p-4'>
      <div className='flex items-center gap-2'>
        <i className='iconfont icon-steam text-xl text-black-600'></i>
        <span className='text-sm font-bold text-black-600'>Steam Widget</span>
      </div>

      <input
        className='w-full rounded border border-black-50 px-3 py-2 text-sm text-black-600'
        defaultValue={appId}
        placeholder='Enter Steam App ID (e.g., 2239770)'
        onInput={handleInput}
      />

      {appId && (
        <iframe
          className='h-[190px] w-full rounded border-0'
          src={`https://store.steampowered.com/widget/${appId}/`}
        />
      )}

      {!appId && (
        <div className='flex h-[190px] w-full items-center justify-center rounded bg-gray-100'>
          <span className='text-sm text-gray-400'>
            Enter an App ID to preview
          </span>
        </div>
      )}
    </div>
  );
};

export default SteamWidgetEdit;
