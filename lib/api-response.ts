import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string, errors?: unknown) {
  return NextResponse.json({ ok: false, message, errors }, { status: 400 });
}

export function unauthorized(message = "No autorizado") {
  return NextResponse.json({ ok: false, message }, { status: 401 });
}

export function forbidden(message = "Sin permisos") {
  return NextResponse.json({ ok: false, message }, { status: 403 });
}

export function notFound(message = "Recurso no encontrado") {
  return NextResponse.json({ ok: false, message }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 409 });
}

export function serverError(message = "Error interno del servidor", error?: unknown) {
  console.error("[API Error]", message, error);
  return NextResponse.json({ ok: false, message }, { status: 500 });
}

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

// Helper para wrappear route handlers con manejo de errores
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error: any) {
      return serverError(error?.message || "Error inesperado", error);
    }
  };
}
