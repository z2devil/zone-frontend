'use client';

import Button from '@/ui/Button';
import clsx from 'clsx';
import Image from 'next/image';
import { Transforms } from 'slate';
import { ReactEditor, useReadOnly, useSelected, useSlate } from 'slate-react';
import { ImageBlockElement } from 'types/slate';
import defaultImg from '../../../../../../public/tip/default-img.jpg';
import { useCallback } from 'react';
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

  const handleRemove = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    console.log('[ path ]', path);
    Transforms.removeNodes(editor, { at: path });
  }, [editor, element]);

  const handleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fileName = await upload(fetcher)({
        file,
        fileType: 'image',
      });
      Transforms.setNodes(
        editor,
        {
          url: `https://z2devil-bucket.oss-cn-beijing.aliyuncs.com/zone/image/${fileName}?x-oss-process=image/resize,s_480`,
        },
        { at: ReactEditor.findPath(editor, element) }
      );
    };
    input.click();
  }, [editor, element, fetcher]);

  return (
    <div {...attributes}>
      {children}
      <div contentEditable={false} className='relative'>
        <Image
          className='block'
          src={element.url || defaultImg}
          alt='图片'
          width={480}
          height={480}
        />
        {!readOnly ? (
          <>
            <Button
              className={clsx(
                ' group/insert absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-300 bg-white px-2 py-1 hover:border-primary-50'
              )}
              onClick={handleUpload}>
              <span className=' text-15 text-black-600 duration-100 group-hover/insert:text-primary-50'>
                上传图片
              </span>
            </Button>
            <Button
              className={clsx(
                ' group/remove absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white hover:border-danger-50',
                selected ? 'block' : 'hidden'
              )}
              onClick={handleRemove}>
              <i className='iconfont icon-trash text-black-600 duration-100 group-hover/remove:text-danger-50'></i>
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ImageBlock;
