"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw, Mail } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
    
    // Here you could send to an error tracking service like Sentry
    // Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Algo salió mal
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {error.message || "Ha ocurrido un error inesperado. Por favor, intenta de nuevo."}
        </p>

        {/* Error Code */}
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6">
            Código de error: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>
          
          <button
            onClick={() => window.location.href = "/admin/dashboard"}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-display"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </button>
        </div>

        {/* Support Contact */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿El problema persiste?{" "}
            <a 
              href="mailto:soporte@saderh.gob.mx?subject=Error%20en%20Sistema%20SADERH"
              className="text-guinda-700 hover:underline inline-flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              Contactar soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
