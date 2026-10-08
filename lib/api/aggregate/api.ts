import { IRequest } from '@/lib/hooks/useRequest';
import { CategoryEntity } from './types';

/**
 * 获取 标签分类 列表
 */
export const getCategoriesAPI = (request: IRequest) => async () => {
  return await request.get<CategoryEntity[]>('/aggregate/category');
};
