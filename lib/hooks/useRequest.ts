import { useCallback, useMemo, useRef } from 'react';
import { useAuthStore } from '../stores';
import { configs } from '../constants';
import { isArray } from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import { useNotesStore } from '../stores/notes';

type RequestConfig = Omit<RequestInit, 'method'>;

interface IResponse<T> {
  code: number;
  data: T;
  message: {
    code: string;
    message: string;
    path: string[];
  }[];
}

export interface IFetcher<T = any> {
  (
    url: string,
    config?: Omit<RequestInit, 'url'>,
    enabledToken?: boolean
  ): Promise<T>;
}

export interface IRequest {
  get: <T = any>(
    url: string,
    params?: Record<string, any>,
    config?: RequestConfig
  ) => Promise<T>;
  post: <T = any>(url: string, config?: RequestConfig) => Promise<T>;
  put: <T = any>(url: string, config?: RequestConfig) => Promise<T>;
  delete: <T = any>(url: string, config?: RequestConfig) => Promise<T>;
}

const useRequest = () => {
  const router = useRouter();

  const pathname = usePathname();

  const { token, clear } = useAuthStore();

  const headers = useRef({
    'Content-Type': configs.request.contentType,
  });

  /**
   * 统一异常处理函数
   * @param error 错误信息
   * @param status HTTP状态码或业务状态码
   */
  const handleError = useCallback(
    (error: string, status: number) => {
      // 需要重新登录的情况
      if (status === 401 || status === 403) {
        clear();
        useNotesStore.getState().clear();
        router.push('/login');
        throw new Error('您的登录状态已过期，请重新登录');
      }

      // 请求过于频繁的情况
      if (status === 429 && pathname !== '/too-many-requests') {
        router.push('/too-many-requests');
        throw new Error('您的请求过于频繁，请稍后再试');
      }

      // 其他错误情况，直接抛出错误
      throw new Error(error);
    },
    [clear, router, pathname]
  );

  const fetcher = useCallback(
    async <T = any>(
      url: string,
      config: Omit<RequestInit, 'url'> & {
        isLocal?: boolean;
      } = {},
      enabledToken = true
    ) => {
      try {
        // 构建请求配置
        const requestConfig: RequestInit = {
          ...config,
          headers: {
            ...headers.current,
            ...config.headers,
          },
        };

        // 添加 token
        if (enabledToken && token) {
          (requestConfig.headers as Record<string, string>)[
            configs.request.header
          ] = token;
        }

        // 发送请求
        const response = await fetch(
          ['https://', 'http://'].some(prefix => url.startsWith(prefix)) ||
            config.isLocal
            ? url
            : configs.request.baseURL + url,
          requestConfig
        );

        // 检查 http 响应状态
        if (!response.ok) {
          handleError(
            `Request failed with status ${response.status}`,
            response.status
          );
        }

        // 根据 Content-Type 处理响应
        const contentType = response.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
          const { code, data, message } =
            (await response.json()) as IResponse<T>;

          if (code !== 200) {
            const errorMessage = isArray(message)
              ? message[0]?.message || 'Unknown error'
              : (message as any) || 'Unknown error';

            handleError(errorMessage, code);
          }

          return data;
        } else if (
          contentType.includes('image') ||
          contentType.includes('octet-stream')
        ) {
          // 如果是二进制数据，直接返回 blob
          const blob = await response.blob();
          console.log('[ Blob Response ]', blob);
          return blob as T;
        } else {
          throw new Error('Unsupported Content-Type');
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [handleError, token]
  );

  const request: IRequest = useMemo(
    () => ({
      get: <T = any>(
        url: string,
        params: Record<string, any> = {},
        config: RequestConfig = {}
      ) => {
        // 过滤 undefined 参数
        Object.keys(params).forEach(key => {
          if (params[key] === void 0) {
            delete params[key];
          }
        });
        const searchParams = new URLSearchParams(params).toString();
        return fetcher<T>(`${url}?${searchParams}`, {
          ...config,
          method: 'GET',
        });
      },
      post: <T = any>(url: string, config: RequestConfig = {}) => {
        return fetcher<T>(url, {
          ...config,
          method: 'POST',
        });
      },
      put: <T = any>(url: string, config: RequestConfig = {}) => {
        return fetcher<T>(url, {
          ...config,
          method: 'PUT',
        });
      },
      delete: async <T = any>(url: string, config: RequestConfig = {}) => {
        return fetcher<T>(url, {
          ...config,
          method: 'DELETE',
        });
      },
    }),
    [fetcher]
  );

  return [request, fetcher] as const;
};

export default useRequest;
