// Usa este helper en TODOS los catch del proyecto
// Registra automáticamente en error_log sin romper el flujo

export async function logError(params: {
  error: unknown;
  origen: "WEB" | "MOVIL" | "API" | "SYNC" | "SISTEMA";
  endpoint?: string;
  metodo?: string;
  codigo?: number;
  id_usuario?: number;
  uuid_movil?: string;
  payload?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}) {
  const err =
    params.error instanceof Error
      ? params.error
      : new Error(String(params.error));

  if (process.env.NODE_ENV === "development") {
    console.error(`[${params.origen}] ${err.message}`, err.stack);
  }

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dev/errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origen: params.origen,
        endpoint: params.endpoint,
        metodo_http: params.metodo,
        mensaje_error: err.message,
        stack_trace: err.stack,
        codigo_http: params.codigo,
        id_usuario: params.id_usuario,
        uuid_movil: params.uuid_movil,
        payload_entrada: params.payload ?? {},
        info_extra: params.extra ?? {},
        ip_address: params.ip,
        user_agent: params.userAgent,
      }),
    });
  } catch {
    console.error("[logError] No se pudo registrar en DB");
  }
}

// ── Uso en cualquier catch ─────────────────────────────────────────────
//
// import { logError } from '@/lib/log-error'
//
// try {
//   ...lógica...
// } catch (err) {
//   await logError({
//     error:    err,
//     origen:   'API',
//     endpoint: '/api/bitacoras',
//     codigo:   500,
//   })
//   return apiError('Error interno', 500)
// }
