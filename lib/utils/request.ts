import { isArray } from 'lodash';
import settings from '../constant/settings';
import auth from './auth';

interface Response<T> {
  code: number;
  data: T;
  message: {
    code: string;
    message: string;
    path: string[];
  }[];
}

const baseConfig = {
  baseURL: settings.request.baseURL,
  timeout: settings.request.timeout,
};

const headers = {
  'Content-Type': settings.request.contentType,
};

export const fetchService = async <T = any>(
  url: string,
  config: Omit<RequestInit, 'url'> = {}
) => {
  try {
    // 构建请求配置
    const requestConfig: RequestInit = {
      ...baseConfig,
      ...config,
      headers: {
        ...headers,
        ...config.headers,
      },
    };

    // 添加 token
    if (auth.isAuthenticated()) {
      (requestConfig.headers as Record<string, string>)[
        settings.request.header
      ] = auth.getToken();
    }

    // 发送请求
    const response = await fetch(settings.request.baseURL + url, requestConfig);

    // 解析响应
    const { code, data, message } = (await response.json()) as Response<T>;

    if (code !== 200) {
      if (isArray(message)) {
        const { message: msg } = message[0];
        throw new Error(msg);
      } else {
        throw new Error(message as any);
      }
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const request = {
  get: <T = any>(
    url: string,
    params: Record<string, any> = {},
    config: Omit<RequestInit, 'method'> = {}
  ) => {
    const searchParams = new URLSearchParams(params).toString();
    return fetchService<T>(`${url}?${searchParams}`, {
      ...config,
      method: 'GET',
    });
  },
  post: <T = any>(url: string, config: Omit<RequestInit, 'method'> = {}) => {
    return fetchService<T>(url, {
      ...config,
      method: 'POST',
    });
  },
  put: <T = any>(url: string, config: Omit<RequestInit, 'method'> = {}) => {
    return fetchService<T>(url, {
      ...config,
      method: 'PUT',
    });
  },
  delete: async <T = any>(
    url: string,
    config: Omit<RequestInit, 'method'> = {}
  ) => {
    return fetchService<T>(url, {
      ...config,
      method: 'DELETE',
    });
  },
};

export default request;
