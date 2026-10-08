import { IRequest } from '@/lib/hooks/useRequest';
import { StatisticsInfo } from './types';

/**
 * 获取 statistics
 */
export const getStatisticsAPI = (request: IRequest) => async () => {
  return await request.get<StatisticsInfo>('/statistics');
};
