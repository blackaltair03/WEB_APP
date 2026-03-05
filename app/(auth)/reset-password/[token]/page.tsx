"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
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
              placeholder="Mínimo 8 caracteres"
              required
              autoFocus
            />
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`h-1 flex-1 rounded ${
                      password.length < 8
                        ? "bg-red-300"
                        : password.length < 12
                        ? "bg-yellow-300"
                        : "bg-green-400"
                    }`}
                  />
                </div>
                <p
                  className={`text-xs mt-1 ${
                    password.length < 8
                      ? "text-red-600"
                      : password.length < 12
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {password.length < 8
                    ? "Débil - Mínimo 8 caracteres"
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
