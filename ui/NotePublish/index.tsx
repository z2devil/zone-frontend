import { NoteTypeEnum } from '@/lib/api/notes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../Button';
import clsx from 'clsx';
import { TagInfo, getTagsAPI } from '@/lib/api/tags';
import useRequest from '@/lib/hooks/useRequest';
import Tag from '../Tag';
import { upload } from '@/lib/api/oss';
import Image from 'next/image';
import imageLoader from 'config/image/loader';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';

export interface NoteOptions {
  type: NoteTypeEnum;
  tags: string[];
  title?: string;
  bannerPath?: string;
}

interface NotePublishProps {
  options: NoteOptions;
  onPublish: (options: NoteOptions) => void;
}

const NotePublish = (props: NotePublishProps) => {
  const { options, onPublish } = props;

  const [request, fetcher] = useRequest();

  /************************************************
   * ✨ 类型
   ************************************************/

  const [type, setType] = useState<NoteTypeEnum>(
    options.type || NoteTypeEnum.NOTE
  );

  /************************************************
   * ✨ 标签
   ************************************************/

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    options.tags || []
  );

  const [tags, setTags] = useState<TagInfo[]>([]);

  const loadTags = useCallback(async () => {
    const res = await getTagsAPI(request)({
      current: 1,
      size: 10,
    });
    setTags(res.list);
  }, [request]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const getTagChecked = useCallback(
    (tagId: string) => {
      return selectedTagIds.includes(tagId);
    },
    [selectedTagIds]
  );

  const handleTagClick = useCallback((tagId: string) => {
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      }
      return [...prev, tagId];
    });
  }, []);

  /************************************************
   * ✨ 标题
   ************************************************/

  const [title, setTitle] = useState(
    options.title || (type === NoteTypeEnum.ARTICLE ? '' : '无标题')
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    []
  );

  /************************************************
   * ✨ 封图
   ************************************************/

  const [bannerPath, setBannerPath] = useState(options.bannerPath || '');

  const [isLoading, setIsLoading] = useState(false);

  const blurDataURL = useMemo(() => {
    return getRandomRgbDataURL();
  }, []);

  const handleUpload = useCallback(async () => {
    if (bannerPath) {
      setBannerPath('');
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
        setBannerPath(`${process.env.OSS_ROOT}/image/${fileName}`);
        setIsLoading(false);
        resolve(null);
      };
      input.click();
    });
  }, [bannerPath, fetcher]);

  const handlePublish = useCallback(() => {
    onPublish({
      type,
      tags: selectedTagIds,
      title,
      bannerPath,
    });
  }, [bannerPath, onPublish, selectedTagIds, title, type]);

  return (
    <div className='flex flex-col gap-5 p-6'>
      {/* 类型 */}
      <span className=' text-17 font-semibold text-black-600'>类型</span>
      <div className='flex gap-5'>
        <Button
          className={clsx(
            ' relative h-12 flex-grow rounded-xl border text-17',
            type === NoteTypeEnum.NOTE
              ? 'border-primary-50 font-medium text-primary-50'
              : 'border-black-80 text-black-600'
          )}
          onClick={() => setType(NoteTypeEnum.NOTE)}>
          笔记
        </Button>
        <Button
          className={clsx(
            ' relative h-12 flex-grow rounded-xl border text-17',
            type === NoteTypeEnum.ARTICLE
              ? 'border-primary-50 font-medium text-primary-50'
              : 'border-black-80 text-black-600'
          )}
          onClick={() => setType(NoteTypeEnum.ARTICLE)}>
          文章
        </Button>
      </div>
      {/* 标签 */}
      <span className=' text-17 font-semibold text-black-600'>标签</span>
      <div className=' flex w-full flex-wrap gap-2'>
        {tags.map(tag => (
          <Tag
            key={tag._id}
            checked={getTagChecked(tag._id)}
            onClick={() => handleTagClick(tag._id)}>
            {tag.label}
          </Tag>
        ))}
      </div>
      {type === NoteTypeEnum.ARTICLE ? (
        <>
          {/* 标题 */}
          <span className=' text-17 font-semibold text-black-600'>标题</span>
          <div className='flex h-10 w-full gap-5 rounded-xl bg-gray-50 px-4'>
            <input
              className=' h-full w-full flex-grow bg-transparent text-17 font-medium text-black-600 outline-none'
              value={title}
              onInput={handleTitleChange}
            />
          </div>
          {/* 封图 */}
          <span className=' text-17 font-semibold text-black-600'>封图</span>
          <div className='group relative aspect-[3/1] w-full overflow-hidden rounded-xl border-black-300'>
            <div className='relative h-full w-full bg-gray-50'>
              {bannerPath ? (
                <Image
                  className='block object-cover group-hover:blur-lg'
                  src={bannerPath}
                  alt='封图'
                  fill
                  loader={imageLoader}
                  placeholder='blur'
                  blurDataURL={blurDataURL}
                />
              ) : null}
              {isLoading ? (
                <div className='absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1'>
                  <span className='text-17 font-bold text-black-600'>
                    上传中...
                  </span>
                </div>
              ) : (
                <div
                  className={clsx(
                    'absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 transition-all duration-100 group-hover:opacity-100',
                    !bannerPath
                      ? 'opacity-1'
                      : 'bg-white bg-opacity-50 opacity-0'
                  )}
                  onClick={handleUpload}>
                  <i className='iconfont icon-image-plus text-xl text-black-600'></i>
                  <span className=' text-17 font-bold text-black-600'>
                    {!bannerPath ? '点击上传图片' : '点击更换图片'}
                  </span>
                  <span className=' text-xs font-bold text-black-250'>
                    最大支持 25MB
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
      <div className='flex w-full'>
        <Button
          className={clsx(
            ' relative flex h-11 flex-shrink-0 flex-grow items-center justify-center rounded-xl border border-black-80 bg-primary-50 text-17 text-white hover:bg-primary-100'
          )}
          onClick={handlePublish}>
          继续发布
        </Button>
      </div>
    </div>
  );
};

export default NotePublish;
