import { IRequest } from '@/lib/hooks/useRequest';
import { CategoryEntity } from './types';
import { cache } from 'react';

/**
 * 获取 标签分类 列表
 */
export const getCategoriesAPI = (request: IRequest) =>
  cache(async () => {
    return await request.get<CategoryEntity[]>('/aggregate/category');
  });
