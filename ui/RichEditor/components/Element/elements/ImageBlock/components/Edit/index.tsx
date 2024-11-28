import {
  CSSProperties,
  ReactEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import NextImage from 'next/image';
import { ImageBlockElement } from 'types/slate';
import { ReactEditor, useSelected, useSlate } from 'slate-react';
import { Transforms } from 'slate';
import useRequest from '@/lib/hooks/useRequest';
import { upload } from '@/lib/api/oss';
import { HistoryEditor } from 'slate-history';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import Resizable, { ResizeDirection } from '@/ui/Resizable';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import imageLoader from 'config/image/loader';

interface ImageEditProps {
  element: ImageBlockElement;
  containerRef: React.RefObject<HTMLDivElement>;
}

const ImageEdit = (props: ImageEditProps) => {
  const { element, containerRef } = props;

  const editor = useSlate();

  const selected = useSelected();

  const [request, fetcher] = useRequest();

  const [overrideWidth, setOverrideWidth] = useState<number | null>(null);

  const hasUrl = useMemo(() => {
    return element.url;
  }, [element]);

  const styles = useMemo(() => {
    const res: CSSProperties = {};
    if (element.width) res.width = `${element.width}%`;
    if (overrideWidth) res.width = `${overrideWidth}px`;
    if (element.originHeight && element.originWidth) {
      res.aspectRatio = element.originWidth / element.originHeight;
    }
    return res;
  }, [element.originHeight, element.originWidth, element.width, overrideWidth]);

  const [isLoading, setIsLoading] = useState(false);

  const isLegalImageUrl = useMemo(() => {
    return (
      element.url &&
      (element.url.startsWith(`https://${process.env.OSS_BUCKET}`) ||
        element.url.startsWith('zone/image/'))
    );
  }, [element.url]);

  useEffect(() => {
    // 上传外部图片函数
    const uploadExternalImage = async (url: string) => {
      try {
        // 通过代理请求下载外部图片
        const response = await fetcher(`/api/external-image?url=${url}`, {
          method: 'GET',
          isLocal: true,
        });
        console.log('[ response ]', response);
        const file = new File([response], 'downloaded-image', {
          type: response.type,
        });

        // 上传文件并获取文件名
        const fileName = await upload(fetcher)({ file, fileType: 'image' });
        return `${process.env.OSS_ROOT}/image/${fileName}`;
      } catch (error) {
        console.error('Failed to download or upload external image:', error);
        return null;
      }
    };

    const processImageUpload = async () => {
      if (
        element.url &&
        ['https://', 'http://'].some(
          prefix => element.url && element.url.startsWith(prefix)
        )
      ) {
        setIsLoading(true);
        try {
          const newUrl = await uploadExternalImage(element.url);
          if (newUrl) {
            // 更新 Slate editor 节点的 URL
            HistoryEditor.withoutSaving(editor, () => {
              Transforms.setNodes(
                editor,
                { url: newUrl },
                { at: ReactEditor.findPath(editor, element) }
              );
            });
          }
        } catch (error) {
          console.error('Failed to process external image upload:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    // 调用上传函数
    processImageUpload();
  }, [element.url, editor, element, fetcher, request]);

  const handleUpload = useCallback(async () => {
    const { promise, resolve } = Promise.withResolvers();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      setIsLoading(true);
      let fileName = '';
      try {
        fileName = await upload(fetcher)({
          file,
          fileType: 'image',
        });
      } catch (error) {
        setIsLoading(false);
        return resolve(null);
      }
      HistoryEditor.withoutSaving(editor, () => {
        Transforms.setNodes(
          editor,
          {
            url: `${process.env.OSS_ROOT}/image/${fileName}`,
          },
          { at: ReactEditor.findPath(editor, element) }
        );
      });
      setIsLoading(false);
      resolve(null);
    };
    input.click();
    await promise;
  }, [editor, element, fetcher]);

  const handleLoad: ReactEventHandler<HTMLImageElement> = useCallback(
    e => {
      const target = e.target as HTMLImageElement;
      console.log('[ target ]', target.naturalWidth, target.naturalHeight);
      HistoryEditor.withoutSaving(editor, () => {
        Transforms.setNodes(
          editor,
          {
            originWidth: target.naturalWidth,
            originHeight: target.naturalHeight,
          },
          { at: ReactEditor.findPath(editor, element) }
        );
      });
    },
    [editor, element]
  );

  const blurDataURL = useMemo(() => getRandomRgbDataURL(), []);

  /************************************************
   * ✨ 缩放
   ************************************************/

  const containerWidth = useRef(0);

  useEffect(() => {
    if (containerRef.current) {
      containerWidth.current = containerRef.current.offsetWidth;
    }
  }, [containerRef]);

  const [isResizing, setIsResizing] = useState(false);

  const currentWidth = useMemo(() => {
    return overrideWidth
      ? Math.round((overrideWidth / containerWidth.current) * 100)
      : element.width;
  }, [element.width, overrideWidth]);

  const handleResizing = useCallback(
    (size: { width: number }) => {
      const width = Math.round((size.width / containerWidth.current) * 100);
      if (width < 10 || width > 100) return;
      setOverrideWidth(size.width);
      if (!isResizing) {
        setIsResizing(true);
      }
    },
    [isResizing]
  );

  const handleResized = useCallback(
    (size: { width: number }) => {
      const width = Math.round((size.width / containerWidth.current) * 100);
      Transforms.setNodes(
        editor,
        {
          width: Math.min(Math.max(width, 10), 100),
        },
        { at: ReactEditor.findPath(editor, element) }
      );
      requestAnimationFrame(() => {
        setOverrideWidth(null);
        setIsResizing(false);
      });
    },
    [editor, element]
  );

  /************************************************
   * ✨ 对齐
   ************************************************/

  const handleAlign = useCallback(
    (align: 'left' | 'center' | 'right') => {
      Transforms.setNodes(
        editor,
        { align },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  return (
    <Resizable
      className={clsx(
        twMerge(
          'group flex h-full min-h-32 w-full min-w-16 max-w-full select-none rounded-lg',
          selected ? 'border border-primary-50' : 'border border-black-200'
        )
      )}
      directions={[ResizeDirection.RIGHT, ResizeDirection.LEFT]}
      style={styles}
      onResized={handleResized}
      onResizing={handleResizing}>
      {isLegalImageUrl ? (
        <NextImage
          alt='图片'
          blurDataURL={blurDataURL}
          className='block rounded-lg object-cover'
          fill={true}
          loader={imageLoader}
          placeholder='blur'
          src={element.url || ''}
          onLoad={handleLoad}
        />
      ) : null}
      {isLoading ? (
        <div className='absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 bg-white bg-opacity-50'>
          <span className='text-17 font-bold text-black-600'>上传中...</span>
        </div>
      ) : (
        <div className=''>
          <div
            className={clsx(
              'absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2',
              hasUrl &&
                'bg-white bg-opacity-50 opacity-0 transition-all duration-100 group-hover:opacity-100'
            )}>
            <div
              className='flex flex-col items-center justify-center rounded-lg bg-white px-4 py-2 ring-1 ring-black-50'
              onClick={handleUpload}>
              <i className='iconfont icon-image-plus text-xl text-black-600'></i>
              <span className='text-17 font-bold text-black-600'>
                {!hasUrl ? '上传图片' : '更换图片'}
              </span>
              <span className='border-t border-black-50 pt-2 text-xs font-bold text-black-250'>
                最大支持 25MB
              </span>
            </div>
            <div className='flex items-center justify-center gap-1 rounded-md bg-white p-1 ring-1 ring-black-50'>
              <div
                className='flex h-6 w-6 cursor-pointer items-center justify-center rounded p-1 text-black-600 hover:bg-black-50 hover:text-black-900'
                title='居左'
                onClick={() => handleAlign('left')}>
                <i className='iconfont icon-align-left-bold text-xl'></i>
              </div>
              <div
                className='flex h-6 w-6 cursor-pointer items-center justify-center rounded p-1 text-black-600 hover:bg-black-50 hover:text-black-900'
                title='居中'
                onClick={() => handleAlign('center')}>
                <i className='iconfont icon-align-horizontal-center-bold text-xl'></i>
              </div>
              <div
                className='flex h-6 w-6 cursor-pointer items-center justify-center rounded p-1 text-black-600 hover:bg-black-50 hover:text-black-900'
                title='居右'
                onClick={() => handleAlign('right')}>
                <i className='iconfont icon-align-right-bold text-xl'></i>
              </div>
            </div>
          </div>
        </div>
      )}
      {isResizing ? (
        <div className='absolute -top-9 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-lg bg-white px-2 ring-1 ring-black-50'>
          <span className='text-13 font-bold text-black-600'>{`${currentWidth}%`}</span>
        </div>
      ) : null}
    </Resizable>
  );
};

export default ImageEdit;
