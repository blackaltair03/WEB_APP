/**
 * API Client for external backend communication
 * Provides centralized error handling and authentication
 */

import { cookies } from "next/headers";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
    public isNetworkError = false
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  retry?: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Get the external API URL from environment
 */
function getApiUrl(): string {
  return process.env.EXTERNAL_API_URL?.replace(/\/$/, "") ?? "";
}

/**
 * Get authentication token from cookies
 */
async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("campo_session")?.value;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(408, "Request timeout", undefined, true);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Main API fetch function
 */
export async function fetchApi<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retry = 0,
    ...fetchOptions
  } = options;

  const baseUrl = getApiUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
  
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          ...fetchOptions,
          headers,
        },
        timeout
      );

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");

      if (!response.ok) {
        let errorData: unknown = null;
        let errorMessage = `HTTP error ${response.status}`;

        if (isJson) {
          errorData = await response.json();
          errorMessage = (errorData as Record<string, unknown>)?.message as string ?? errorMessage;
        }

        throw new ApiError(response.status, errorMessage, errorData);
      }

      if (isJson) {
        return response.json() as Promise<T>;
      }

      return {} as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (except 429)
      if (error instanceof ApiError && error.isClientError && !error.isRateLimited) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < retry) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // All retries exhausted
  if (lastError instanceof ApiError) {
    throw lastError;
  }

  throw new ApiError(500, "Request failed after retries", undefined, true);
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: <T = unknown>(endpoint: string, options?: FetchOptions) =>
    fetchApi<T>(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Check if API response is successful and typed
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success === true && response.data !== undefined;
}
