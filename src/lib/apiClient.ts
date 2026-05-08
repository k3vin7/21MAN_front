type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | Array<string | number | boolean> | null | undefined>;
  auth?: boolean;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY ?? 'worldbuild:access-token';

export const isApiEnabled = import.meta.env.VITE_API_ENABLED === 'true' || Boolean(API_BASE_URL);

const buildUrl = (path: string, query?: ApiRequestOptions['query']) => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, String(item)));
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return API_BASE_URL ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
};

const getAccessToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const apiClient = {
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const method = options.method ?? 'GET';
    const headers = new Headers();
    const token = getAccessToken();

    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }

    if (options.auth !== false && token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const data = (await response.json().catch(() => null)) as (T & ApiErrorBody) | null;

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data?.error?.message ?? 'API request failed.',
        data?.error?.code,
      );
    }

    return data as T;
  },

  get<T>(path: string, query?: ApiRequestOptions['query'], options?: Pick<ApiRequestOptions, 'auth'>) {
    return this.request<T>(path, { method: 'GET', query, auth: options?.auth });
  },

  post<T>(path: string, body?: unknown, options?: Pick<ApiRequestOptions, 'auth'>) {
    return this.request<T>(path, { method: 'POST', body, auth: options?.auth });
  },

  patch<T>(path: string, body?: unknown, options?: Pick<ApiRequestOptions, 'auth'>) {
    return this.request<T>(path, { method: 'PATCH', body, auth: options?.auth });
  },
};
