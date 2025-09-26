'use client';

import { configs } from "@/lib/constants";

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

const imageLoader = ({ src, width }: ImageLoaderProps) => {
  return `${configs.request.downloadUrl}${src}?x-oss-process=image/resize,w_${width}`;
};

export default imageLoader;
