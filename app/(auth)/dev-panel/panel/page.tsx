"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Tab = "errores" | "admin" | "reset";

export default function DevPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("errores");
  const [loading, setLoading] = useState(true);

  // Verificar autenticación del panel
  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/dev/errors?page=1&limit=1");
        if (!res.ok) {
          router.push("/dev-panel");
          return;
        }
        setLoading(false);
      } catch {
        router.push("/dev-panel");
      }
    };
    verify();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Verificando acceso...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-guinda-900">
                Panel DevOps SADERH
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Monitoreo y administración del sistema
              </p>
            </div>
            <button
              onClick={() => {
                document.cookie =
                  "dev_panel_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                router.push("/dev-panel");
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-guinda-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setTab("errores")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  tab === "errores"
                    ? "border-guinda-700 text-guinda-700"
                    : "border-transparent text-gray-600 hover:text-guinda-700 hover:border-gray-300"
                }`}
              >
                📊 Logs de Errores
              </button>
              <button
                onClick={() => setTab("admin")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  tab === "admin"
                    ? "border-guinda-700 text-guinda-700"
                    : "border-transparent text-gray-600 hover:text-guinda-700 hover:border-gray-300"
                }`}
              >
                🚨 Admin de Emergencia
              </button>
              <button
                onClick={() => setTab("reset")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  tab === "reset"
                    ? "border-guinda-700 text-guinda-700"
                    : "border-transparent text-gray-600 hover:text-guinda-700 hover:border-gray-300"
                }`}
              >
                🔑 Reset de Contraseña
              </button>
            </nav>
          </div>

          {/* Contenido de los tabs */}
          <div className="p-6">
            {tab === "errores" && <TabErrores />}
            {tab === "admin" && <TabEmergencyAdmin />}
            {tab === "reset" && <TabResetPassword />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabErrores() {
  const [errores, setErrores] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({
    origen: "",
    entorno: "",
    resuelto: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarErrores();
    cargarStats();
  }, [page, filtros]);

  const cargarErrores = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      ...(filtros.origen && { origen: filtros.origen }),
      ...(filtros.entorno && { entorno: filtros.entorno }),
      ...(filtros.resuelto && { resuelto: filtros.resuelto }),
    });

    const res = await fetch(`/api/dev/errors?${params}`);
    const data = await res.json();
    setErrores(data.errors || []);
    setLoading(false);
  };

  const cargarStats = async () => {
    const res = await fetch("/api/dev/errors/stats");
    const data = await res.json();
    setStats(data);
  };

  const marcarResuelto = async (id: number, notas: string) => {
    await fetch(`/api/dev/errors/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notas }),
    });
    cargarErrores();
    cargarStats();
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Stats */}
      {stats?.resumen && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Total</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {stats.resumen.total}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">Sin Resolver</div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {stats.resumen.sin_resolver}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Móvil</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">
              {stats.resumen.de_movil}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Web</div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {stats.resumen.de_web}
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">Sync</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">
              {stats.resumen.de_sync}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filtros.origen}
          onChange={(e) =>
            setFiltros({ ...filtros, origen: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
        >
          <option value="">Todos los orígenes</option>
          <option value="WEB">WEB</option>
          <option value="MOVIL">MÓVIL</option>
          <option value="API">API</option>
          <option value="SYNC">SYNC</option>
          <option value="SISTEMA">SISTEMA</option>
        </select>

        <select
          value={filtros.entorno}
          onChange={(e) =>
            setFiltros({ ...filtros, entorno: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
        >
          <option value="">Todos los entornos</option>
          <option value="development">Development</option>
          <option value="production">Production</option>
        </select>

        <select
          value={filtros.resuelto}
          onChange={(e) =>
            setFiltros({ ...filtros, resuelto: e.target.value })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
        >
          <option value="">Estado: Todos</option>
          <option value="false">Sin Resolver</option>
          <option value="true">Resueltos</option>
        </select>
      </div>

      {/* Tabla de Errores */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Origen
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Entorno
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Mensaje
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : errores.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay errores registrados
                </td>
              </tr>
            ) : (
              errores.map((error) => (
                <tr key={error.id_error} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(error.fecha_error).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        error.origen === "MOVIL"
                          ? "bg-purple-100 text-purple-700"
                          : error.origen === "WEB"
                          ? "bg-green-100 text-green-700"
                          : error.origen === "API"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {error.origen}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        error.entorno === "production"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {error.entorno}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-md truncate">
                    {error.mensaje_error}
                  </td>
                  <td className="px-4 py-3">
                    {error.resuelto ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                        ✓ Resuelto
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!error.resuelto && (
                      <button
                        onClick={() => {
                          const notas = prompt("Notas de resolución (opcional):");
                          if (notas !== null) {
                            marcarResuelto(error.id_error, notas);
                          }
                        }}
                        className="text-sm text-guinda-700 hover:text-guinda-900 font-medium"
                      >
                        Resolver
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-600">Página {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={errores.length < 20}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

function TabEmergencyAdmin() {
  const [form, setForm] = useState({
    master_key: "",
    nombre_completo: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/dev/emergency-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear admin");
        setLoading(false);
        return;
      }

      setSuccess(data.mensaje);
      setForm({
        master_key: "",
        nombre_completo: "",
        email: "",
        password: "",
      });
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              ⚠️ Acción de Emergencia
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Esta funcionalidad solo debe usarse cuando NO exista ningún
                Super Admin activo en el sistema.
              </p>
              <p className="mt-1">
                Requiere la clave maestra (DEV_MASTER_KEY) de 20+ caracteres.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clave Maestra *
          </label>
          <input
            type="password"
            value={form.master_key}
            onChange={(e) =>
              setForm({ ...form, master_key: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
            placeholder="Mínimo 20 caracteres"
            required
            minLength={20}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={form.nombre_completo}
            onChange={(e) =>
              setForm({ ...form, nombre_completo: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña Temporal *
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
            placeholder="Mínimo 10 caracteres"
            required
            minLength={10}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creando..." : "Crear Super Admin de Emergencia"}
        </button>
      </form>
    </div>
  );
}

function TabResetPassword() {
  const [email, setEmail] = useState("");
  const [duracion, setDuracion] = useState("24");
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generarToken = async () => {
    setError("");
    setResultado(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/generate-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, duracion_horas: parseInt(duracion) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al generar token");
        setLoading(false);
        return;
      }

      setResultado(data);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            🔑 Generación Manual de Token
          </h3>
          <p className="mt-2 text-sm text-blue-700">
            Permite crear un enlace de recuperación que puedes compartir al
            usuario por WhatsApp, SMS u otro canal seguro.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email del Usuario
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duración del Token (horas)
          </label>
          <select
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-guinda-500"
          >
            <option value="1">1 hora</option>
            <option value="6">6 horas</option>
            <option value="24">24 horas (recomendado)</option>
            <option value="48">48 horas</option>
            <option value="72">72 horas</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={generarToken}
          disabled={!email || loading}
          className="w-full bg-guinda-700 hover:bg-guinda-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generando..." : "Generar Token"}
        </button>

        {resultado && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-green-900 mb-3">
              ✓ Token Generado Exitosamente
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Usuario:
                </label>
                <div className="text-sm text-gray-900">{resultado.usuario}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Válido hasta:
                </label>
                <div className="text-sm text-gray-900">
                  {new Date(resultado.valido_hasta).toLocaleString("es-MX")}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Enlace para compartir:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resultado.url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resultado.url);
                      alert("¡Enlace copiado al portapapeles!");
                    }}
                    className="px-4 py-2 bg-guinda-700 text-white text-sm rounded hover:bg-guinda-800 transition"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {resultado.mensaje}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
