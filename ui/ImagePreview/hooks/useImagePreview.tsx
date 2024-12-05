import { useCallback, useMemo, useState } from 'react';
import ImagePreview, { ImagePreviewProps } from '../components/ImagePreview';
import { ImageBlockElement } from 'types/slate';

export type ImagePreviewConfig = Omit<ImagePreviewProps, 'visible' | 'onClose'>;

export interface ImagePreviewUtils {
  open: (config: ImagePreviewConfig) => void;
  close: () => void;
}

enum ImagePreviewTaskType {
  OPEN,
  CLOSE,
}

const useImagePreview = () => {
  const [visible, setVisible] = useState(false);

  const [index, setIndex] = useState(0);

  const [images, setImages] = useState<ImageBlockElement[]>([]);

  const utils = useMemo<ImagePreviewUtils>(() => {
    const actions = {
      [ImagePreviewTaskType.OPEN]: (config: ImagePreviewConfig) => {
        const { images, index } = config;
        setImages(images);
        setIndex(index);
        setVisible(true);
      },
      [ImagePreviewTaskType.CLOSE]: () => {
        setVisible(false);
      },
    };

    return {
      open: config => {
        return actions[ImagePreviewTaskType.OPEN](config);
      },
      close: () => {
        actions[ImagePreviewTaskType.CLOSE]();
      },
    };
  }, []);

  const handleClose = useCallback(() => {
    utils.close();
  }, [utils]);

  const contextHolder = (
    <ImagePreview
      images={images}
      index={index}
      visible={visible}
      onClose={handleClose}
    />
  );

  return [utils, contextHolder] as const;
};

export default useImagePreview;
