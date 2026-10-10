import { useCallback, useMemo, useRef } from 'react';
import { useAuthStore } from '../stores';
import { configs } from '../constants';
import { usePathname, useRouter } from 'next/navigation';
import { useNotesStore } from '../stores/notes';
import { clearAllNoteDrafts } from '../note-draft';

type RequestConfig = Omit<RequestInit, 'method'> & {
  /** 401 时不清理会话、不跳转登录页（用于退出登录本身） */
  skipAuthRedirect?: boolean;
};

interface IResponse<T> {
  code: number;
  data: T;
  message:
    | string
    | {
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

const isEnvelope = <T>(body: unknown): body is IResponse<T> =>
  typeof body === 'object' &&
  body !== null &&
  typeof (body as { code?: unknown }).code === 'number';

const envelopeMessage = (message: unknown) => {
  if (Array.isArray(message)) {
    return message[0]?.message || 'Unknown error';
  }
  return typeof message === 'string' && message ? message : 'Unknown error';
};

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
   * @param skipAuthRedirect 401 时不清理会话、不跳转登录页
   */
  const handleError = useCallback(
    (error: string, status: number, skipAuthRedirect = false): never => {
      // 未登录或登录态失效：清理会话、笔记缓存与本地草稿并重新登录
      if (status === 401 && !skipAuthRedirect) {
        clear();
        useNotesStore.getState().clear();
        clearAllNoteDrafts();
        router.push('/login');
        throw new Error('您的登录状态已过期，请重新登录');
      }

      // 已登录但权限不足：保留会话，交给调用方处理
      if (status === 403) {
        throw new Error('无权限');
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
      {
        skipAuthRedirect,
        isLocal,
        ...config
      }: Omit<RequestInit, 'url'> & {
        isLocal?: boolean;
        skipAuthRedirect?: boolean;
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
            isLocal
            ? url
            : configs.request.baseURL + url,
          requestConfig
        );

        const contentType = response.headers.get('Content-Type') || '';
        // 任意状态码都先尝试读取 JSON body：后端的 HTTP 状态码与 envelope code 一致，
        // 旧后端则恒为 HTTP 200，两者都以 body 的 code 为准
        const body: unknown = contentType.includes('application/json')
          ? await response.json().catch(() => undefined)
          : undefined;
        const genericError = `请求失败（HTTP ${response.status}）`;

        // 本地 Next API（如 /api/external-image）不是后端 envelope，不走登录/权限语义
        if (isLocal && !response.ok) {
          const localError = (body as { error?: unknown } | undefined)?.error;
          throw new Error(
            typeof localError === 'string' ? localError : genericError
          );
        }

        if (isEnvelope<T>(body)) {
          if (body.code === 200 && response.ok) {
            return body.data;
          }
          return handleError(
            envelopeMessage(body.message),
            body.code === 200 ? response.status : body.code,
            skipAuthRedirect
          );
        }

        // 非 envelope 的错误响应（如网关返回的 HTML）：按 HTTP 状态处理
        if (!response.ok) {
          return handleError(genericError, response.status, skipAuthRedirect);
        }

        if (body !== undefined) {
          throw new Error('Unknown error');
        }

        if (
          contentType.includes('image') ||
          contentType.includes('octet-stream')
        ) {
          // 如果是二进制数据，直接返回 blob
          const blob = await response.blob();
          console.log('[ Blob Response ]', blob);
          return blob as T;
        }

        throw new Error('Unsupported Content-Type');
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
