"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { resetPasswordSchema } from "@/lib/validations/usuario";
import { isValidToken } from "@/lib/sanitize";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [validatingToken, setValidatingToken] = useState(true);

  // Validar token con el servidor al cargar la página
  useEffect(() => {
    (async () => {
      if (!token || !isValidToken(token)) {
        setError("Enlace de recuperación inválido o expirado");
        setIsTokenValid(false);
        setValidatingToken(false);
        return;
      }

      try {
        const res = await fetch(`/api/validate-reset-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        
        if (!res.ok || !data.valid) {
          setError(data.error || "Enlace de recuperación inválido o expirado");
          setIsTokenValid(false);
        } else {
          setIsTokenValid(true);
        }
      } catch {
        setError("Error al validar el enlace. Intenta de nuevo.");
        setIsTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("La contraseña es requerida");
      return;
    }

    // Validar usando el esquema del servidor para mantener consistencia
    const validation = resetPasswordSchema.safeParse({ token, nueva_password: password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nueva_password: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Token inválido o expirado. Solicita uno nuevo."
        );
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  // Mostrar pantalla de carga mientras se valida el token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-guinda-200 border-t-guinda-600 rounded-full mx-auto mb-4 animate-spin"></div>
            <p className="text-gray-600">Validando enlace de recuperación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si el token es inválido
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Enlace Inválido
            </h2>
            <p className="text-gray-600 mb-6">
              El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block px-6 py-3 bg-guinda-700 hover:bg-guinda-800 text-white font-semibold rounded-lg transition"
            >
              Solicitar Nuevo Enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Contraseña Actualizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido restablecida exitosamente.
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo al login en 3 segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-guinda-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-guinda-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-guinda-900 mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-gray-600 text-sm">
            Crea una contraseña segura para tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
              placeholder="Mínimo 10 caracteres, mayúscula, minúscula, número y especial"
              required
              autoFocus
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`h-1 flex-1 rounded ${
                      password.length < 10
                        ? "bg-red-300"
                        : password.length < 12
                        ? "bg-yellow-300"
                        : "bg-green-400"
                    }`}
                  />
                </div>
                <p
                  className={`text-xs mt-1 ${
                    password.length < 10
                      ? "text-red-600"
                      : password.length < 12
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {password.length < 10
                    ? "Débil - Mínimo 10 caracteres"
                    : password.length < 12
                    ? "Aceptable - Usa 12+ caracteres"
                    : "Segura"}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
              placeholder="Repite la contraseña"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-guinda-700 hover:bg-guinda-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Actualizando..." : "Restablecer Contraseña"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Este enlace es de un solo uso y expira después de usarlo o 2 horas
            después de generarse.
          </p>
        </div>
      </div>
    </div>
  );
}
