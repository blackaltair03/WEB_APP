import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { usuarios } from "./schema";
import { eq } from "drizzle-orm";

export type UserRole = "SUPER_ADMIN" | "COORDINADOR" | "TECNICO";

export interface SessionPayload {
  id_usuario: number;
  email: string;
  nombre_completo: string;
  rol: UserRole;
  especialidad?: string;
  id_zona?: number;
}

const WEB_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const APP_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_APP!);

// ─── Web token (dashboard) ────────────────────────────────────────────────────
export async function signWebToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .setIssuedAt()
    .sign(WEB_SECRET);
}

export async function verifyWebToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, WEB_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Mobile token (app) ──────────────────────────────────────────────────────
export async function signAppToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(APP_SECRET);
}

export async function verifyAppToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, APP_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Web session via cookies ──────────────────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("campo_session")?.value;
  if (!token) return null;
  return verifyWebToken(token);
}

export async function setSession(payload: SessionPayload): Promise<void> {
  const token = await signWebToken(payload);
  const cookieStore = await cookies();
  cookieStore.set("campo_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("campo_session");
}

// ─── Get user from DB (fresh data) ───────────────────────────────────────────
export async function getFullUser(id_usuario: number) {
  const [user] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id_usuario, id_usuario))
    .limit(1);
  return user ?? null;
}

// ─── Auth token from request header (for API routes used by mobile) ──────────
export async function getTokenFromHeader(authHeader: string | null): Promise<SessionPayload | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  // Try app token first, then web token
  return (await verifyAppToken(token)) ?? (await verifyWebToken(token));
}
