import { useCallback, useMemo, useState } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { SteamVideoBlockElement } from 'types/slate';
import { Transforms } from 'slate';
import clsx from 'clsx';
import Image from 'next/image';

interface SteamVideoEditProps {
  element: SteamVideoBlockElement;
}

const SteamVideoEdit = (props: SteamVideoEditProps) => {
  const { element } = props;

  const editor = useSlate();

  const [appId, setAppId] = useState(element.appId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hlsUrl = useMemo(() => element.hlsUrl, [element.hlsUrl]);
  const thumbnailUrl = useMemo(
    () => element.thumbnailUrl,
    [element.thumbnailUrl]
  );
  const title = useMemo(() => element.title, [element.title]);

  const handleFetchVideo = useCallback(async () => {
    if (!appId.trim()) {
      setError('Please enter a Steam App ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/steam-video?appId=${appId}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      Transforms.setNodes(
        editor,
        {
          appId: appId,
          hlsUrl: data.hlsUrl,
          thumbnailUrl: data.thumbnailUrl,
          title: data.title,
        },
        { at: ReactEditor.findPath(editor, element) }
      );
    } catch (err) {
      setError('Failed to fetch video data');
    } finally {
      setLoading(false);
    }
  }, [appId, editor, element]);

  const handleReset = useCallback(() => {
    Transforms.setNodes(
      editor,
      {
        hlsUrl: undefined,
        thumbnailUrl: undefined,
        title: undefined,
      },
      { at: ReactEditor.findPath(editor, element) }
    );
    setError('');
  }, [editor, element]);

  return (
    <div className='group flex w-full flex-col gap-4'>
      <div
        className={clsx(
          'absolute inset-0 flex flex-col items-center justify-center gap-2',
          hlsUrl &&
            'bg-white bg-opacity-50 opacity-0 transition-all duration-100 group-hover:opacity-100'
        )}>
        <div className='flex w-1/2 flex-col items-center justify-center gap-3 rounded-lg bg-white p-4 ring-1 ring-black-50'>
          <i className='iconfont icon-film text-2xl text-black-600'></i>
          <span className='text-17 font-bold text-black-600'>Steam Video</span>

          {!hlsUrl ? (
            <>
              <input
                className='w-full rounded border border-black-50 px-2 py-1 text-sm font-bold text-black-600'
                placeholder='Enter Steam App ID (e.g., 2239770)'
                value={appId}
                onChange={e => setAppId(e.target.value)}
              />
              <button
                className='bg-primary-500 hover:bg-primary-600 w-full rounded px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300'
                disabled={loading}
                onClick={handleFetchVideo}>
                {loading ? 'Fetching...' : 'Fetch Video'}
              </button>
              {error && <span className='text-xs text-red-500'>{error}</span>}
            </>
          ) : (
            <button
              className='w-full rounded bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600'
              onClick={handleReset}>
              Reset
            </button>
          )}
        </div>
      </div>

      {hlsUrl && thumbnailUrl ? (
        <div className='w-full'>
          <Image
            alt={title || 'Steam video'}
            className='aspect-video w-full rounded object-cover'
            height={360}
            src={thumbnailUrl}
            width={640}
          />
          {title && <div className='mt-1 text-xs text-gray-500'>{title}</div>}
        </div>
      ) : (
        <div className='flex aspect-video w-full items-center justify-center rounded bg-gray-100'>
          <span className='text-sm text-gray-400'>No video configured</span>
        </div>
      )}
    </div>
  );
};

export default SteamVideoEdit;
