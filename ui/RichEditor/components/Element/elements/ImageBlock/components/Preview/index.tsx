import { CSSProperties, useMemo } from 'react';
import Image from 'next/image';
import { ImageBlockElement } from 'types/slate';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import imageLoader from 'config/image/loader';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { Editor, Path } from 'slate';
import { BlockElementType } from '@/lib/constants';
import { useImagePreviewUtilsStore } from '@/lib/stores';

interface ImagePreviewProps {
  element: ImageBlockElement;
}

const ImagePreview = (props: ImagePreviewProps) => {
  const { element } = props;

  const editor = useSlateStatic();

  const { utils: imagePreviewUtils } = useImagePreviewUtilsStore();

  const styles = useMemo(() => {
    const res: CSSProperties = {};
    if (element.width) res.width = `${element.width}%`;
    if (element.originHeight && element.originWidth) {
      res.aspectRatio = element.originWidth / element.originHeight;
    }
    return res;
  }, [element.originHeight, element.originWidth, element.width]);

  const isLegalImageUrl = useMemo(() => {
    return (
      element.url &&
      (element.url.startsWith(`https://${process.env.OSS_BUCKET}`) ||
        element.url.startsWith('zone/image/'))
    );
  }, [element.url]);

  const blurDataURL = useMemo(() => getRandomRgbDataURL(), []);

  const handleClick = () => {
    const images: ImageBlockElement[] = [];
    const currentPath = ReactEditor.findPath(editor, element);
    let index = 0;
    const enties = Editor.nodes(editor, {
      at: [],
      match: n => n.type === BlockElementType.IMAGE,
    });
    Array.from(enties).forEach(([node, path], i) => {
      const image = node as ImageBlockElement;
      images.push(image);
      if (Path.equals(path, currentPath)) {
        index = i;
      }
    });
    imagePreviewUtils?.open({
      images,
      index,
    });
  };

  return (
    <div
      className='relative flex h-full min-h-32 w-full min-w-16 max-w-full cursor-pointer select-none overflow-hidden rounded-lg'
      style={styles}
      onClick={handleClick}>
      {isLegalImageUrl ? (
        <Image
          fill
          alt='图片'
          blurDataURL={blurDataURL}
          className='block object-contain'
          loader={imageLoader}
          placeholder='blur'
          sizes='100vw'
          src={element.url || ''}
        />
      ) : null}
    </div>
  );
};

export default ImagePreview;
