import { NextRequest } from "next/server";
import { getTokenFromHeader } from "@/lib/auth";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/schema";
import { eq } from "drizzle-orm";

export type AppSession = {
  id_usuario: number;
  email: string;
  nombre_completo: string;
  rol: string;
  especialidad?: string;
  id_zona?: number;
};

export async function getAppSession(req: NextRequest): Promise<AppSession | null> {
  const session = await getTokenFromHeader(req.headers.get("authorization"));
  if (!session) return null;

  return {
    id_usuario: session.id_usuario,
    email: session.email,
    nombre_completo: session.nombre_completo,
    rol: session.rol,
    especialidad: session.especialidad,
    id_zona: session.id_zona,
  };
}

export async function getActiveUser(idUsuario: number) {
  const [user] = await db
    .select({
      id_usuario: usuarios.id_usuario,
      rol: usuarios.rol,
      activo: usuarios.activo,
      bloqueado_revision: usuarios.bloqueado_revision,
      puede_registrar_beneficiarios: usuarios.puede_registrar_beneficiarios,
    })
    .from(usuarios)
    .where(eq(usuarios.id_usuario, idUsuario))
    .limit(1);

  return user ?? null;
}
