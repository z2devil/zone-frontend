import { IRequest } from '@/lib/hooks/useRequest';

/**
 * AI 生成标题
 */
export const generateTitleAPI =
  (request: IRequest) => async (content: string) => {
    return await request.post<{ title: string }>('/ai/generate-title', {
      body: JSON.stringify({ content }),
    });
  };

/**
 * AI 生成摘要
 */
export const generateSummaryAPI =
  (request: IRequest) => async (content: string) => {
    return await request.post<{ summary: string }>('/ai/generate-summary', {
      body: JSON.stringify({ content }),
    });
  };
