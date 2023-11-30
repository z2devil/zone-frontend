'use client';

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

const imageLoader = ({ src, width }: ImageLoaderProps) => {
  return `https://${process.env.OSS_BUCKET}.${process.env.OSS_ENDPOINT}/${src}?x-oss-process=image/resize,w_${width}`;
};

export default imageLoader;
