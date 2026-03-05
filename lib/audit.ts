/**
 * Audit logging for tracking user actions
 * 
 * This module provides functions to log user actions to the auditoria table.
 * In a production environment, consider using a more robust solution like
 * an external audit service or database triggers.
 */

import { db } from "./db";
import { auditoria } from "./schema";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "VIEW";

export interface AuditLogParams {
  id_usuario: number;
  tabla: string;
  id_registro?: number;
  accion: AuditAction;
  antes?: Record<string, unknown>;
  despues?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log an audit entry
 * Note: In production, consider using a queue or background job
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditoria).values({
      id_usuario: params.id_usuario,
      tabla: params.tabla,
      id_registro: params.id_registro,
      accion: params.accion,
      antes: params.antes ?? undefined,
      despues: params.despues ?? undefined,
      ip_address: params.ip_address,
      fecha_accion: new Date(),
    });
  } catch (error) {
    // Log to console but don't throw - audit failures shouldn't break user flows
    console.error("Failed to log audit entry:", error);
  }
}

/**
 * Audit helpers for common operations
 */
export const audit = {
  /**
   * Log user login
   */
  login: (id_usuario: number, ip_address?: string) => 
    logAudit({
      id_usuario,
      tabla: "sesion",
      accion: "LOGIN",
      ip_address,
    }),

  /**
   * Log user logout
   */
  logout: (id_usuario: number, ip_address?: string) => 
    logAudit({
      id_usuario,
      tabla: "sesion",
      accion: "LOGOUT",
      ip_address,
    }),

  /**
   * Log record creation
   */
  create: (params: Omit<AuditLogParams, "accion">) => 
    logAudit({ ...params, accion: "CREATE" }),

  /**
   * Log record update
   */
  update: (params: Omit<AuditLogParams, "accion">) => 
    logAudit({ ...params, accion: "UPDATE" }),

  /**
   * Log record deletion
   */
  delete: (params: Omit<AuditLogParams, "accion">) => 
    logAudit({ ...params, accion: "DELETE" }),

  /**
   * Log data export
   */
  export: (params: Omit<AuditLogParams, "accion">) => 
    logAudit({ ...params, accion: "EXPORT" }),

  /**
   * Log sensitive view (e.g., viewing PII)
   */
  view: (params: Omit<AuditLogParams, "accion">) => 
    logAudit({ ...params, accion: "VIEW" }),
};

/**
 * Get client IP from request headers
 * Note: This should be handled at the API level for accuracy
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
