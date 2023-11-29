import clsx from 'clsx';
import Image from 'next/image';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly, useSelected, useSlate } from 'slate-react';
import { ImageBlockElement } from 'types/slate';
import { ReactEventHandler, useCallback, useMemo, useState } from 'react';
import { upload } from '@/lib/api/oss';
import useRequest from '@/lib/hooks/useRequest';

interface CodeBlockProps {
  attributes: any;
  children: any;
  element: ImageBlockElement;
}

const ImageBlock = ({ attributes, children, element }: CodeBlockProps) => {
  const editor = useSlate();

  const readOnly = useReadOnly();

  const selected = useSelected();

  const [, fetcher] = useRequest();

  const hasSize = useMemo(() => {
    return element.width && element.height;
  }, [element]);

  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = useCallback(async () => {
    if (hasSize) {
      Transforms.setNodes(
        editor,
        {
          url: void 0,
          width: void 0,
          height: void 0,
        },
        { at: ReactEditor.findPath(editor, element) }
      );
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
        Transforms.setNodes(
          editor,
          {
            url: `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT}/${process.env.OSS_ROOT}/image/${fileName}`,
          },
          { at: ReactEditor.findPath(editor, element) }
        );
        setIsLoading(false);
        resolve(null);
      };
      input.click();
    });
  }, [editor, element, fetcher, hasSize]);

  const handleLoad: ReactEventHandler<HTMLImageElement> = useCallback(
    e => {
      const target = e.target as HTMLImageElement;
      Transforms.setNodes(
        editor,
        {
          width: target.naturalWidth,
          height: target.naturalHeight,
        },
        { at: ReactEditor.findPath(editor, element) }
      );
    },
    [editor, element]
  );

  return (
    <div {...attributes}>
      <div
        contentEditable={false}
        className={clsx(
          'group relative w-full overflow-hidden',
          !readOnly
            ? selected
              ? 'border-2 border-dashed border-primary-50'
              : 'border-2 border-dashed border-black-300'
            : '',
          !hasSize && 'aspect-[3/1]'
        )}>
        {element.url ? (
          <Image
            className='block'
            src={element.url + '?x-oss-process=image/resize,l_480'}
            alt='图片'
            fill={!hasSize}
            width={element.width}
            height={element.height}
            onLoad={handleLoad}
          />
        ) : null}
        {!readOnly ? (
          isLoading ? (
            <div className='absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 bg-white bg-opacity-50 backdrop-blur-lg'>
              <span className='text-17 font-bold text-black-600'>
                上传中...
              </span>
            </div>
          ) : (
            <div
              className={clsx(
                'absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1',
                !hasSize
                  ? ''
                  : 'bg-white bg-opacity-50 opacity-0 backdrop-blur-lg transition-all duration-100 group-hover:opacity-100'
              )}
              onClick={handleUpload}>
              <i className='iconfont icon-image-plus text-xl text-black-600'></i>
              <span className=' text-17 font-bold text-black-600'>
                {!hasSize ? '点击上传图片' : '点击更换图片'}
              </span>
              <span className=' text-xs font-bold text-black-250'>
                最大支持 25MB
              </span>
            </div>
          )
        ) : null}
      </div>
      {children}
    </div>
  );
};

export default ImageBlock;
