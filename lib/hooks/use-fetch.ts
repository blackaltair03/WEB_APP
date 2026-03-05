"use client";

import { useState, useCallback } from "react";
import { useToast } from "./use-toast";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

/**
 * Custom hook for handling fetch operations with loading, error, and success states
 */
export function useFetch<T = unknown>(url: string, options?: UseFetchOptions<T>) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const toast = useToast();

  const execute = useCallback(async (body?: unknown, method: string = "POST"): Promise<T | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || result.error || `Error ${response.status}`;
        throw new Error(errorMessage);
      }

      setState({
        data: result,
        loading: false,
        error: null,
      });

      if (options?.showToast !== false && result.success !== false) {
        toast.success("Operación exitosa");
      }

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      if (options?.showToast !== false) {
        toast.error("Error", { description: errorMessage });
      }

      options?.onError?.(errorMessage);
      return null;
    }
  }, [url, options, toast]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isIdle: !state.loading && !state.error && !state.data,
    isSuccess: !state.loading && !state.error && state.data !== null,
  };
}

/**
 * Hook for handling async operations with confirmation
 */
export function useAsyncAction<T = unknown>(options?: UseFetchOptions<T>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const execute = useCallback(async (
    action: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    setIsProcessing(true);

    try {
      const result = await action();
      
      if (successMessage && options?.showToast !== false) {
        toast.success(successMessage);
      }

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : (errorMessage || "Error desconocido");
      
      if (options?.showToast !== false) {
        toast.error("Error", { description: message });
      }

      options?.onError?.(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [options, toast]);

  return {
    isProcessing,
    execute,
  };
}

/**
 * Hook for debounced search
 */
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    // Using setTimeout directly for simplicity
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(null);
        return;
      }

      setLoading(true);
      setError(null);

      const timer = setTimeout(async () => {
        try {
          const result = await searchFn(searchQuery);
          setResults(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Search failed");
        } finally {
          setLoading(false);
        }
      }, delay);

      return () => clearTimeout(timer);
    },
    [searchFn, delay]
  );

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search: debouncedSearch,
  };
}
