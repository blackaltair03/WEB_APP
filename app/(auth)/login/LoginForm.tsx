"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, client: "web" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Error al iniciar sesión");
        return;
      }

      const roleRoutes: Record<string, string> = {
        SUPER_ADMIN: "/admin/dashboard",
        COORDINADOR: "/coordinador/dashboard",
        TECNICO: "/tecnico/dashboard",
      };

      router.push(roleRoutes[data.data.user.rol] ?? "/");
      router.refresh();
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-guinda-900 mb-1.5 font-display">
          Correo institucional
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="usuario@saderh.gob.mx"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent text-sm transition-shadow"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-guinda-900 mb-1.5 font-display">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPwd ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:border-transparent text-sm transition-shadow"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-guinda-700 transition-colors"
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-guinda-700 text-white font-semibold text-sm hover:bg-guinda-800 focus:outline-none focus:ring-2 focus:ring-guinda-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-display"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Verificando..." : "Ingresar al sistema"}
      </button>
    </form>
  );
}
