import { IRequest } from '@/lib/hooks/useRequest';
import { StatisticsInfo } from './types';
import { cache } from 'react';

/**
 * 获取 statistics
 */
export const getStatisticsAPI = (request: IRequest) =>
  cache(async () => {
    return await request.get<StatisticsInfo>('/statistics');
  });
