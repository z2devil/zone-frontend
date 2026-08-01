import { CSSProperties, useMemo } from 'react';
import Image from 'next/image';
import { ImageBlockElement } from 'types/slate';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import imageLoader from 'config/image/loader';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { Editor, Path } from 'slate';
import { BlockElementType, configs } from '@/lib/constants';
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
      (element.url.startsWith(`https://${configs.oss.bucket}`) ||
        element.url.startsWith('zone/image/'))
    );
  }, [element.url]);

  const blurDataURL = useMemo(() => getRandomRgbDataURL(), []);

  const handleClick = () => {
    const images: ImageBlockElement[] = [];
    const currentPath = ReactEditor.findPath(editor, element);
    let index = 0;
    const entries = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: n => n.type === BlockElementType.IMAGE,
      })
    );
    entries.forEach(([node, path], i) => {
      const image = node as ImageBlockElement;
      images.push(image);
      if (Path.equals(path, currentPath)) {
        index = i;
      }
    });
    console.log('[ entries ]', entries, index);
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
          sizes={
            editor.isSummary
              ? '(max-width: 430px) calc(100vw - 80px), 390px'
              : '(max-width: 768px) calc(100vw - 80px), 720px'
          }
          src={element.url || ''}
        />
      ) : null}
    </div>
  );
};

export default ImagePreview;
