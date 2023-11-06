import { isArray } from 'lodash-es';
import settings from '../constant/settings';
import auth from '../utils/auth';

interface Response<T> {
  code: number;
  data: T;
  message: {
    code: string;
    message: string;
    path: string[];
  }[];
}

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
      ...config,
      headers: {
        ...headers,
        ...config.headers,
      },
    };

    console.log('requestConfig', JSON.stringify(requestConfig));

    // 添加 token
    if (auth.isAuthenticated()) {
      (requestConfig.headers as Record<string, string>)[
        settings.request.header
      ] = auth.getToken();
    }

    console.log('requestConfig', requestConfig);

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

type RequestConfig = Omit<RequestInit, 'method'>;

const request = {
  get: <T = any>(
    url: string,
    params: Record<string, any> = {},
    config: RequestConfig = {}
  ) => {
    const searchParams = new URLSearchParams(params).toString();
    return fetchService<T>(`${url}?${searchParams}`, {
      ...config,
      method: 'GET',
    });
  },
  post: <T = any>(url: string, config: RequestConfig = {}) => {
    return fetchService<T>(url, {
      ...config,
      method: 'POST',
    });
  },
  put: <T = any>(url: string, config: RequestConfig = {}) => {
    return fetchService<T>(url, {
      ...config,
      method: 'PUT',
    });
  },
  delete: async <T = any>(url: string, config: RequestConfig = {}) => {
    return fetchService<T>(url, {
      ...config,
      method: 'DELETE',
    });
  },
};

export default request;
