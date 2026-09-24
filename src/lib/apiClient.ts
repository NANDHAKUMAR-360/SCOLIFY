import { ENV } from '../config/env.config';
import { ApiResponse, ApiErrorResponse } from '../types/api';

export class ApiClientError extends Error {
  code: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${ENV.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Get token from localStorage if present
  const token = localStorage.getItem('scolify_auth_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      const err = (data as ApiErrorResponse).error || {
        code: `HTTP_${response.status}`,
        message: response.statusText || 'An unexpected error occurred',
      };
      throw new ApiClientError(err.code, err.message, err.details);
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError('NETWORK_ERROR', error?.message || 'Failed to connect to Scolify server');
  }
}
