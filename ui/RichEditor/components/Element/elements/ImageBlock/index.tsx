import clsx from 'clsx';
import NextImage from 'next/image';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly, useSelected, useSlate } from 'slate-react';
import { ImageBlockElement } from 'types/slate';
import {
  ReactEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { upload } from '@/lib/api/oss';
import useRequest from '@/lib/hooks/useRequest';
import imageLoader from 'config/image/loader';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import { HistoryEditor } from 'slate-history';

interface CodeBlockProps {
  attributes: any;
  children: any;
  element: ImageBlockElement;
}

const ImageBlock = ({ attributes, children, element }: CodeBlockProps) => {
  const editor = useSlate();

  const readOnly = useReadOnly();

  const selected = useSelected();

  const [request, fetcher] = useRequest();

  const hasSize = useMemo(() => {
    return element.width && element.height;
  }, [element]);

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
        ['https://', 'http://'].some(prefix => element.url!.startsWith(prefix))
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
    if (hasSize) {
      HistoryEditor.withoutSaving(editor, () => {
        Transforms.setNodes(
          editor,
          {
            url: void 0,
            width: void 0,
            height: void 0,
          },
          { at: ReactEditor.findPath(editor, element) }
        );
      });
    }
    await new Promise(resolve => {
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
    });
  }, [editor, element, fetcher, hasSize]);

  const handleLoad: ReactEventHandler<HTMLImageElement> = useCallback(
    e => {
      if (readOnly) return;
      const target = e.target as HTMLImageElement;
      console.log('[ target ]', target.naturalWidth, target.naturalHeight);
      HistoryEditor.withoutSaving(editor, () => {
        Transforms.setNodes(
          editor,
          {
            width: target.naturalWidth,
            height: target.naturalHeight,
          },
          { at: ReactEditor.findPath(editor, element) }
        );
      });
    },
    [editor, element, readOnly]
  );

  const blurDataURL = useMemo(() => getRandomRgbDataURL(), []);

  return (
    <div {...attributes}>
      <div
        className={clsx(
          'group relative overflow-hidden rounded-lg',
          hasSize ? 'w-fit' : 'aspect-[3/1] w-full',
          !readOnly
            ? selected
              ? 'border border-primary-50'
              : 'border border-black-200'
            : ''
        )}
        contentEditable={false}>
        {isLegalImageUrl ? (
          <NextImage
            alt='图片'
            blurDataURL={blurDataURL}
            className='block'
            fill={!hasSize}
            height={element.height}
            loader={imageLoader}
            placeholder='blur'
            src={element.url || ''}
            width={element.width}
            onLoad={handleLoad}
          />
        ) : null}
        {!readOnly ? (
          isLoading ? (
            <div className='absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 bg-white bg-opacity-50'>
              <span className='text-17 font-bold text-black-600'>
                上传中...
              </span>
            </div>
          ) : (
            <div
              className={clsx(
                'absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1',
                hasSize &&
                  'bg-white bg-opacity-50 opacity-0 transition-all duration-100 group-hover:opacity-100'
              )}
              onClick={handleUpload}>
              <i className='iconfont icon-image-plus text-xl text-black-600'></i>
              <span className='text-17 font-bold text-black-600'>
                {!hasSize ? '点击上传图片' : '点击更换图片'}
              </span>
              <span className='text-xs font-bold text-black-250'>
                最大支持 25MB
              </span>
            </div>
          )
        ) : null}
      </div>
      <div
        style={{
          fontSize: '0',
        }}>
        {children}
      </div>
    </div>
  );
};

export default ImageBlock;
