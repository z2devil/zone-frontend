import {
  CSSProperties,
  ReactEventHandler,
  useCallback,
  useEffect,
  useMemo,
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
}

const ImageEdit = (props: ImageEditProps) => {
  const { element } = props;

  const editor = useSlate();

  const selected = useSelected();

  const [request, fetcher] = useRequest();

  const [overrideWidth, setOverrideWidth] = useState<number | null>(null);

  const hasUrl = useMemo(() => {
    return element.url;
  }, [element]);

  const styles = useMemo(() => {
    const res: CSSProperties = {};
    if (element.width) res.width = `${element.width}px`;
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

  const handleResizing = useCallback((size: { width: number }) => {
    console.log('[ handleResizing ]');
    setOverrideWidth(size.width);
  }, []);

  const handleResized = useCallback(
    (size: { width: number }) => {
      console.log('[ handleResized ]');
      Transforms.setNodes(
        editor,
        {
          width: size.width,
        },
        { at: ReactEditor.findPath(editor, element) }
      );
      requestAnimationFrame(() => {
        setOverrideWidth(null);
      });
    },
    [editor, element]
  );

  return (
    <Resizable
      className={clsx(
        twMerge(
          'group flex h-full min-h-32 w-full min-w-16 max-w-full select-none overflow-hidden rounded-lg',
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
          className='block object-cover'
          fill={true}
          loader={imageLoader}
          placeholder='blur'
          src={element.url || ''}
          onLoad={handleLoad}
        />
      ) : null}
      {isLoading ? (
        <div className='absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 bg-white bg-opacity-50'>
          <span className='text-17 font-bold text-black-600'>上传中...</span>
        </div>
      ) : (
        <div
          className={clsx(
            'absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1',
            hasUrl &&
              'bg-white bg-opacity-50 opacity-0 transition-all duration-100 group-hover:opacity-100'
          )}
          onClick={handleUpload}>
          <i className='iconfont icon-image-plus text-xl text-black-600'></i>
          <span className='text-17 font-bold text-black-600'>
            {!hasUrl ? '点击上传图片' : '点击更换图片'}
          </span>
          <span className='text-xs font-bold text-black-250'>
            最大支持 25MB
          </span>
        </div>
      )}
    </Resizable>
  );
};

export default ImageEdit;
