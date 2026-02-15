/**
 * API Client Utilities and Helpers
 * Provides environment detection, storage abstraction, and request helpers
 */

import { mobileApi, MobileApiClient } from './mobile-api-client';

// ============================================================================
// ENVIRONMENT DETECTION
// ============================================================================

export const isReactNative = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    navigator.userAgent.includes('ReactNative')
  );
};

export const isWeb = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

export const isMobile = (): boolean => {
  if (!isWeb()) return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// ============================================================================
// STORAGE ABSTRACTION
// ============================================================================

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Web Storage Adapter (LocalStorage)
 */
export const webStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: async (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
  clear: async () => {
    try {
      localStorage.clear();
    } catch {}
  },
};

/**
 * In-Memory Storage Adapter (for React Native or when localStorage unavailable)
 */
export const memoryStorageAdapter: StorageAdapter = {
  _store: {} as Record<string, string>,

  getItem: async function (key: string) {
    return this._store[key] || null;
  },

  setItem: async function (key: string, value: string) {
    this._store[key] = value;
  },

  removeItem: async function (key: string) {
    delete this._store[key];
  },

  clear: async function () {
    this._store = {};
  },
};

/**
 * Get appropriate storage adapter based on environment
 */
export function getStorageAdapter(): StorageAdapter {
  if (isWeb()) {
    return webStorageAdapter;
  }
  return memoryStorageAdapter;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const STORAGE_KEY = 'singft_session';

export async function saveSession(token: string, expiresIn?: number) {
  const storage = getStorageAdapter();
  const session = {
    token,
    timestamp: Date.now(),
    expiresIn,
  };
  await storage.setItem(STORAGE_KEY, JSON.stringify(session));
  mobileApi.setSessionToken(token);
}

export async function loadSession(): Promise<string | null> {
  const storage = getStorageAdapter();
  const sessionStr = await storage.getItem(STORAGE_KEY);

  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr);
    const isExpired =
      session.expiresIn && Date.now() - session.timestamp > session.expiresIn * 1000;

    if (isExpired) {
      await clearSession();
      return null;
    }

    mobileApi.setSessionToken(session.token);
    return session.token;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession() {
  const storage = getStorageAdapter();
  await storage.removeItem(STORAGE_KEY);
  mobileApi.setSessionToken(null);
}

// ============================================================================
// REQUEST INTERCEPTORS
// ============================================================================

export interface RequestInterceptor {
  onRequest?(config: any): any;
  onResponse?(response: any): any;
  onError?(error: any): any;
}

class InterceptorManager {
  private interceptors: RequestInterceptor[] = [];

  use(interceptor: RequestInterceptor) {
    this.interceptors.push(interceptor);
  }

  async processRequest(config: any) {
    let result = config;
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        result = await interceptor.onRequest(result);
      }
    }
    return result;
  }

  async processResponse(response: any) {
    let result = response;
    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        result = await interceptor.onResponse(result);
      }
    }
    return result;
  }

  async processError(error: any) {
    let result = error;
    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        result = await interceptor.onError(result);
      }
    }
    return result;
  }
}

export const interceptors = new InterceptorManager();

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public endpoint: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please sign in again.';
      case 403:
        return 'Forbidden. You do not have permission for this action.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.message;
    }
  }

  if (error instanceof TypeError) {
    return 'Network error. Please check your connection.';
  }

  return 'An unexpected error occurred.';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize API client with session management
 */
export async function initializeApiClient(baseUrl?: string): Promise<MobileApiClient> {
  const client = new MobileApiClient(baseUrl);

  // Load existing session
  const token = await loadSession();
  if (token) {
    client.setSessionToken(token);
  }

  return client;
}

// ============================================================================
// BATCH REQUESTS
// ============================================================================

/**
 * Execute multiple API calls in parallel with rate limiting
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<any>[] = [];

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];

    const promise = Promise.resolve().then(() => request()).then((result) => {
      results[i] = result;
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

// ============================================================================
// POLLING UTILITY
// ============================================================================

export interface PollingOptions {
  interval: number;
  maxAttempts?: number;
  timeout?: number;
}

/**
 * Poll an endpoint until condition is met
 */
export async function pollUntil<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  options: PollingOptions
): Promise<T | null> {
  const { interval, maxAttempts = 30, timeout = maxAttempts * interval } = options;

  const startTime = Date.now();
  let attempts = 0;

  while (attempts < maxAttempts && Date.now() - startTime < timeout) {
    try {
      const result = await fn();
      if (condition(result)) {
        return result;
      }
    } catch (error) {
      console.error('Polling error:', error);
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return null;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  isReactNative,
  isWeb,
  isMobile,
  getStorageAdapter,
  saveSession,
  loadSession,
  clearSession,
  interceptors,
  handleApiError,
  initializeApiClient,
  batchRequests,
  pollUntil,
};
