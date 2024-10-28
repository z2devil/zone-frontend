import { useCallback, useMemo, useRef } from 'react';
import { useAuthStore } from '../stores';
import { configs } from '../constants';
import { isArray } from 'lodash';
import { usePathname, useRouter } from 'next/navigation';

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

  const fetcher = useCallback(
    async <T = any>(
      url: string,
      config: Omit<RequestInit, 'url'> = {},
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
          url.startsWith('http') ? url : configs.request.baseURL + url,
          requestConfig
        );

        // 检查响应状态
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            clear();
            router.push('/login');
          }
          if (response.status === 429 && pathname !== '/too-many-requests') {
            router.push('/too-many-requests');
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        // 根据 Content-Type 处理响应
        const contentType = response.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
          const { code, data, message } = (await response.json()) as IResponse<T>;
  
          console.log('[ JSON Response ]', url, code, data, message);
  
          if (code !== 200) {
            if (isArray(message)) {
              const { message: msg } = message[0];
              throw new Error(msg);
            } else {
              throw new Error(message as any || 'Unknown error');
            }
          }
          
          return data;
        } else if (contentType.includes('image') || contentType.includes('octet-stream')) {
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
    [clear, pathname, router, token]
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
        console.log('[ searchParams ]', searchParams);
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
