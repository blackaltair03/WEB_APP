/**
 * Cliente de Redis para caché y verificación de códigos
 * Usa @upstash/redis para Serverless/Next.js
 */

import { Redis } from "@upstash/redis";

// Inicializar cliente de Redis
export const redis = Redis.fromEnv({
  // @ts-ignore - Las variables de entorno ya están configuradas
});

/**
 * Genera un código aleatorio de 5 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/**
 * Almacena un código de verificación en Redis
 * @param email - Email del usuario
 * @param code - Código de 5 dígitos
 * @param expiresIn - Tiempo de expiración en segundos (default: 5 minutos)
 */
export async function storeVerificationCode(
  email: string,
  code: string,
  expiresIn: number = 300 // 5 minutos
): Promise<void> {
  const key = `verification:${email}`;
  await redis.set(key, code, { ex: expiresIn });
}

/**
 * Verifica si un código es válido
 * @returns true si el código es válido, false si no existe o no coincide
 */
export async function verifyCode(email: string, code: string): Promise<boolean> {
  const key = `verification:${email}`;
  const storedCode = await redis.get<string>(key);
  
  if (!storedCode) {
    return false;
  }
  
  if (storedCode === code) {
    // Eliminar el código después de un uso exitoso
    await redis.del(key);
    return true;
  }
  
  return false;
}

/**
 * Obtiene el número de intentos fallidos para un email
 */
export async function getFailedAttempts(email: string): Promise<number> {
  const key = `failed_attempts:${email}`;
  const attempts = await redis.get<number>(key);
  return attempts ?? 0;
}

/**
 * Incrementa el contador de intentos fallidos
 */
export async function incrementFailedAttempts(email: string): Promise<number> {
  const key = `failed_attempts:${email}`;
  const attempts = await redis.incr(key);
  
  // Reset después de 15 minutos
  await redis.expire(key, 900);
  
  return attempts;
}

/**
 * Resetea el contador de intentos fallidos
 */
export async function resetFailedAttempts(email: string): Promise<void> {
  const key = `failed_attempts:${email}`;
  await redis.del(key);
}

/**
 * Almacena el token de sesión en Redis
 */
export async function storeSessionToken(
  token: string,
  userId: number,
  expiresIn: number = 86400 // 24 horas
): Promise<void> {
  const key = `session:${token}`;
  await redis.set(key, userId.toString(), { ex: expiresIn });
}

/**
 * Obtiene el userId de una sesión
 */
export async function getSessionUserId(token: string): Promise<number | null> {
  const key = `session:${token}`;
  const userId = await redis.get<string>(key);
  return userId ? parseInt(userId, 10) : null;
}

/**
 * Elimina una sesión
 */
export async function deleteSession(token: string): Promise<void> {
  const key = `session:${token}`;
  await redis.del(key);
}
