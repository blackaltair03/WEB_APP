"use client";

import { toast } from "sonner";

/**
 * Custom toast hook for consistent notifications
 * Uses sonner which is already installed in the project
 */

interface ToastOptions {
  description?: string;
  duration?: number;
}

export function useToast() {
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    toast(message, {
      description: options?.description,
      duration: options?.duration ?? 3000,
    });
  };

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  return {
    success,
    error,
    warning,
    info,
    promise,
  };
}

/**
 * Standalone functions for use outside React components
 */
export const toastService = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...options, duration: options?.duration ?? 4000 });
  },
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...options, duration: options?.duration ?? 5000 });
  },
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...options, duration: options?.duration ?? 4000 });
  },
  info: (message: string, options?: ToastOptions) => {
    toast(message, { ...options, duration: options?.duration ?? 3000 });
  },
};
