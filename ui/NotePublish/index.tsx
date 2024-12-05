import { NoteTypeEnum } from '@/lib/api/notes';
import { useCallback, useMemo, useRef, useState } from 'react';
import Button from '../Button';
import clsx from 'clsx';
import { TagInfo, getTagsAPI, postTagAPI, putTagAPI } from '@/lib/api/tags';
import useRequest from '@/lib/hooks/useRequest';
import Tag from '../Tag';
import { upload } from '@/lib/api/oss';
import Image from 'next/image';
import imageLoader from 'config/image/loader';
import { getRandomRgbDataURL } from '@/lib/utils/rgbDataURL';
import { produce } from 'immer';
import { useLoading } from '@/lib/hooks/useLoading';
import { useMount } from 'react-use';
import { useSlate } from 'slate-react';
import { twMerge } from 'tailwind-merge';
import { generateSummary } from '@/lib/ai';

export interface NoteOptions {
  type: NoteTypeEnum;
  bannerPath?: string;
  title?: string;
  summary?: string;
  tags: string[];
}

interface NotePublishProps {
  options: NoteOptions;
  onPublish: (options: NoteOptions) => void;
}

const NotePublish = (props: NotePublishProps) => {
  const { options, onPublish } = props;

  const [request, fetcher] = useRequest();

  const editor = useSlate();

  /************************************************
   * ✨ 类型
   ************************************************/

  const [type, setType] = useState<NoteTypeEnum>(
    options.type || NoteTypeEnum.NOTE
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
   * ✨ 摘要
   ************************************************/

  const [summary, setSummary] = useState(options.summary || '');

  const handleSummaryChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSummary(e.target.value);
    },
    []
  );

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateSummary = useCallback(async () => {
    if (isGeneratingSummary) return;
    setIsGeneratingSummary(true);
    try {
      const text = await generateSummary(editor.string([]));
      setSummary(text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [editor, isGeneratingSummary]);

  /************************************************
   * ✨ 标签
   ************************************************/

  const {
    isLoading: isTagLoading,
    isUiLoading: isTagUiLoading,
    setLoading: setTagLoading,
  } = useLoading('tag');

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    options.tags || []
  );

  const tagCurrent = useRef(1);

  const tagTotal = useRef(0);

  const [tags, setTags] = useState<TagInfo[]>([]);

  const loadTags = useCallback(async () => {
    console.log('[ loadTags ]', isTagLoading, isTagUiLoading);
    if (isTagLoading || isTagUiLoading) return;
    setTagLoading(true);
    if (tagTotal.current !== 0 && tags.length >= tagTotal.current) {
      return;
    }
    const res = await getTagsAPI(request)({
      current: tagCurrent.current,
      size: 20,
    });
    setTagLoading(false);
    setTags(prev => [...prev, ...res.list]);
    tagTotal.current = res.total;
  }, [isTagLoading, isTagUiLoading, request, setTagLoading, tags.length]);

  useMount(() => {
    loadTags();
  });

  const getMoreTags = useCallback(() => {
    tagCurrent.current += 1;
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

  const handleAddTag = useCallback(
    async (tag: Partial<TagInfo>) => {
      console.log('[ handleAddTag ]', tag);
      if (tag._id) {
        // 修改
        const nextTag = await putTagAPI(request)({
          _id: tag._id,
          label: tag.label || '',
        });
        console.log('[ nextTag ]', nextTag);
        setTags(
          produce(draft => {
            const index = draft.findIndex(t => t._id === tag._id);
            if (index !== -1) {
              draft[index] = nextTag;
            }
          })
        );
      } else {
        // 创建
        const nextTag = await postTagAPI(request)({
          label: tag.label || '',
        });
        setTags(prev => [nextTag, ...prev]);
      }
    },
    [request]
  );

  const [editingTags, setEditingTags] = useState(false);

  const handleEditTagToggle = useCallback(() => {
    setEditingTags(prev => !prev);
  }, []);

  /************************************************
   * ✨ 发布
   ************************************************/

  const handlePublish = useCallback(() => {
    onPublish({
      type,
      bannerPath,
      title,
      summary,
      tags: selectedTagIds,
    });
  }, [bannerPath, onPublish, selectedTagIds, summary, title, type]);

  return (
    <div className='flex flex-col gap-5 p-6'>
      {/* 类型 */}
      <div className='flex flex-col gap-1'>
        <span className='text-17 font-semibold text-black-600'>类型</span>
        <div className='flex gap-5'>
          <Button
            className={clsx(
              'relative h-12 flex-grow rounded-xl border text-17',
              type === NoteTypeEnum.NOTE
                ? 'border-primary-50 font-medium text-primary-50'
                : 'border-black-80 text-black-600'
            )}
            onClick={() => setType(NoteTypeEnum.NOTE)}>
            笔记
          </Button>
          <Button
            className={clsx(
              'relative h-12 flex-grow rounded-xl border text-17',
              type === NoteTypeEnum.ARTICLE
                ? 'border-primary-50 font-medium text-primary-50'
                : 'border-black-80 text-black-600'
            )}
            onClick={() => setType(NoteTypeEnum.ARTICLE)}>
            文章
          </Button>
        </div>
      </div>
      {type === NoteTypeEnum.ARTICLE ? (
        <>
          {/* 封图 */}
          <div className='flex flex-col gap-1'>
            <span className='text-17 font-semibold text-black-600'>封图</span>
            <div className='group relative aspect-[3/1] w-full overflow-hidden rounded-xl border-black-300'>
              <div className='relative h-full w-full bg-gray-50'>
                {bannerPath ? (
                  <Image
                    fill
                    alt='封图'
                    blurDataURL={blurDataURL}
                    className='block object-cover group-hover:blur-lg'
                    loader={imageLoader}
                    placeholder='blur'
                    sizes='100vw'
                    src={bannerPath}
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
                    <span className='text-17 font-bold text-black-600'>
                      {!bannerPath ? '点击上传图片' : '点击更换图片'}
                    </span>
                    <span className='text-xs font-bold text-black-250'>
                      最大支持 25MB
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 标题 */}
          <div className='flex flex-col gap-1'>
            <div className='flex items-end justify-between'>
              <span className='text-17 font-semibold text-black-600'>标题</span>
              <span className='text-xs font-medium text-black-250'>
                {title.length}/50
              </span>
            </div>
            <div className='flex h-10 w-full gap-5 rounded-xl bg-gray-50 px-4'>
              <input
                className='h-full w-full flex-grow bg-transparent text-17 font-medium text-black-600 outline-none'
                maxLength={50}
                value={title}
                onInput={handleTitleChange}
              />
            </div>
          </div>
          {/* 摘要 */}
          <div className='flex flex-col gap-1'>
            <div className='flex items-end justify-between'>
              <span className='text-17 font-semibold text-black-600'>摘要</span>
              <span className='text-xs font-medium text-black-250'>
                {summary.length}/300
              </span>
            </div>
            <div className='relative flex w-full gap-5 rounded-xl bg-gray-50 p-4'>
              <textarea
                className='min-h-10 w-full flex-grow resize-none bg-transparent text-justify text-17 font-medium text-black-600 outline-none'
                maxLength={300}
                rows={4}
                value={summary}
                onInput={handleSummaryChange}
              />
              {/* 内容为空时显示自动生成的按钮 */}
              {!summary.length ? (
                <button
                  className={clsx(
                    twMerge(
                      'absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-2 rounded-full bg-purple-50 px-4 py-2 text-15 font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 hover:bg-purple-100',
                      isGeneratingSummary
                        ? 'pointer-events-none cursor-not-allowed bg-black-50 text-black-250 ring-black-80'
                        : 'cursor-pointer'
                    )
                  )}
                  onClick={handleGenerateSummary}>
                  <span className='iconfont icon-magic text-17'></span>
                  <span>自动生成</span>
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
      {/* 标签 */}
      <div className='flex flex-col gap-1'>
        <div className='flex w-full items-end justify-between'>
          <span className='text-17 font-semibold text-black-600'>标签</span>
          <span
            className={clsx(
              'cursor-pointer text-15 transition-colors duration-100',
              editingTags
                ? 'text-primary-50'
                : 'text-black-250 hover:text-black-600'
            )}
            onClick={handleEditTagToggle}>
            编辑
          </span>
        </div>
        <div className='flex w-full flex-wrap gap-2'>
          {/* 添加标签 */}
          <Tag isEdit onSubmit={handleAddTag}>
            <i className='iconfont icon-plus text-17 text-black-600'></i>
          </Tag>
          {/* 标签列表 */}
          {tags.map(tag => (
            <Tag
              checked={getTagChecked(tag._id)}
              isEdit={editingTags}
              key={tag._id}
              tag={tag}
              onClick={() => handleTagClick(tag._id)}
              onSubmit={handleAddTag}>
              {tag.label}
            </Tag>
          ))}
          {/* 加载更多 */}
          {tagTotal.current > tags.length && (
            <Tag onClick={getMoreTags}>
              <i
                className={clsx(
                  'iconfont text-17 text-black-600',
                  isTagUiLoading
                    ? 'icon-spinner animate-spin'
                    : 'icon-ellipsis-h'
                )}></i>
            </Tag>
          )}
        </div>
      </div>
      <div className='flex w-full'>
        <Button
          className={clsx(
            'relative flex h-11 flex-shrink-0 flex-grow items-center justify-center rounded-xl border border-black-80 bg-primary-50 text-17 text-white hover:bg-primary-100'
          )}
          onClick={handlePublish}>
          继续发布
        </Button>
      </div>
    </div>
  );
};

export default NotePublish;
