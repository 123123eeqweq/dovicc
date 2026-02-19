const BACKEND_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const API_URL = typeof window !== 'undefined' ? '/api' : BACKEND_URL;

export function getUploadUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return url;
  }
  return url;
}

export function getImageSrc(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

let global401Handler: ((intent: { type: string; [key: string]: any }) => void) | null = null;

export function setGlobal401Handler(handler: (intent: { type: string; [key: string]: any }) => void) {
  global401Handler = handler;
}

export async function fetchAPI<T>(
  endpoint: string,
  options?: {
    revalidate?: number;
    tags?: string[];
    cache?: RequestCache;
  }
): Promise<T> {
  try {
    const { revalidate, tags, cache } = options || {};
    
    const fetchOptions: RequestInit = {};

    if (revalidate !== undefined || tags) {
      fetchOptions.next = {};
      if (revalidate !== undefined) {
        fetchOptions.next.revalidate = revalidate;
      }
      if (tags) {
        fetchOptions.next.tags = tags;
      }
      fetchOptions.cache = cache || 'default';
    } else {
      fetchOptions.cache = cache || 'no-store';
    }

    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('NOT_FOUND');
      }
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'fetch failed' || error.cause && typeof error.cause === 'object' && 'code' in error.cause && error.cause.code === 'ECONNREFUSED') {
        throw new Error(`CONNECTION_ERROR`);
      }
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED') {
      throw new Error(`CONNECTION_ERROR`);
    }
    throw error;
  }
}

export async function fetchAPIAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401 && global401Handler) {
        const isProtectedAction = options?.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method);
        const isAuthCheck = endpoint.includes('/auth/me');
        
        if (isProtectedAction && !isAuthCheck) {
          let intentType = 'VIEW_PROFILE';
          if (endpoint.includes('/companies/propose')) {
            intentType = 'ADD_COMPANY';
          } else if (endpoint.includes('/reviews') && options?.method === 'POST') {
            intentType = 'ADD_REVIEW';
          } else if (endpoint.includes('/react')) {
            intentType = 'REACT_REVIEW';
          } else if (endpoint.includes('/report')) {
            intentType = 'REPORT_REVIEW';
          }
          
          global401Handler({ type: intentType });
        }

        const res = await response.json();
        const errorCode = res.error;
        
        const error = new Error(errorCode || 'Unauthorized') as any;
        error.status = 401;
        error.errorCode = errorCode || 'UNAUTHORIZED';
        throw error;
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const error = new Error(errorData.error || `API error: ${response.status}`) as any;
      error.status = response.status;
      error.errorCode = errorData.error;
      error.error = errorData.error;
      error.message = errorData.message;
      if (errorData.remainingSeconds !== undefined) {
        error.remainingSeconds = errorData.remainingSeconds;
      }
      if (errorData.remainingMinutes !== undefined) {
        error.remainingMinutes = errorData.remainingMinutes;
      }
      if (errorData.cooldownMinutes !== undefined) {
        error.cooldownMinutes = errorData.cooldownMinutes;
      }
      if (errorData.canCreateAfter !== undefined) {
        error.canCreateAfter = errorData.canCreateAfter;
      }
      if (errorData.reviewsPerWindow !== undefined) {
        error.reviewsPerWindow = errorData.reviewsPerWindow;
      }
      if (errorData.reviewWindowHours !== undefined) {
        error.reviewWindowHours = errorData.reviewWindowHours;
      }
      if (errorData.minReviewLength !== undefined) {
        error.minReviewLength = errorData.minReviewLength;
      }
      if (errorData.currentLength !== undefined) {
        error.currentLength = errorData.currentLength;
      }
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (parseError) {
        const error = new Error('Invalid JSON response') as any;
        error.status = response.status;
        error.errorCode = 'PARSE_ERROR';
        throw error;
      }
    }
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      const error = new Error('Invalid response format') as any;
      error.status = response.status;
      error.errorCode = 'PARSE_ERROR';
      throw error;
    }
  } catch (error) {
    const isConnectionError = error instanceof Error && (
      error.message === 'fetch failed' || 
      (error.cause && typeof error.cause === 'object' && 'code' in error.cause && error.cause.code === 'ECONNREFUSED') ||
      error.name === 'TypeError'
    ) || (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED');
    
    if (isConnectionError) {
      const connectionError = new Error('CONNECTION_ERROR');
      (connectionError as { status?: number; errorCode?: string }).status = 0;
      (connectionError as { status?: number; errorCode?: string }).errorCode = 'CONNECTION_ERROR';
      throw connectionError;
    }
    throw error;
  }
}
