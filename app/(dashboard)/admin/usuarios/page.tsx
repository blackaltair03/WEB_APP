import PageHeader from "@/components/layout/PageHeader";
import UsuariosClient from "./UsuariosClient";
import { db } from "@/lib/db";
import { usuarios, zonas } from "@/lib/schema";
import { and, eq, ilike, or, count, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session || session.rol !== "SUPER_ADMIN") redirect("/login");

  const params = await searchParams;
  const search = params.search as string | undefined;
  const rol = params.rol as string | undefined;
  const page = params.page ? parseInt(params.page as string) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(usuarios.nombre_completo, `%${search}%`),
        ilike(usuarios.email, `%${search}%`)
      )
    );
  }
  if (rol && rol !== "TODOS") {
    conditions.push(eq(usuarios.rol, rol as any));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id_usuario: usuarios.id_usuario,
        nombre_completo: usuarios.nombre_completo,
        email: usuarios.email,
        rol: usuarios.rol,
        especialidad: usuarios.especialidad,
        activo: usuarios.activo,
        fecha_creacion: usuarios.fecha_creacion,
        zona_id: zonas.id_zona,
        zona_nombre: zonas.nombre,
      })
      .from(usuarios)
      .leftJoin(zonas, eq(usuarios.id_zona, zonas.id_zona))
      .where(where)
      .orderBy(asc(usuarios.nombre_completo))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(usuarios).where(where),
  ]);

  const usuariosData = rows.map((row) => ({
    id_usuario: row.id_usuario,
    nombre_completo: row.nombre_completo,
    email: row.email,
    rol: row.rol,
    especialidad: row.especialidad,
    activo: row.activo,
    fecha_creacion: row.fecha_creacion?.toISOString?.() ?? String(row.fecha_creacion),
    zona: row.zona_id
      ? {
          id_zona: row.zona_id,
          nombre: row.zona_nombre ?? "Sin nombre",
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        subtitle="Gestiona los usuarios del sistema (SUPER_ADMIN, COORDINADOR, TECNICO)"
      />
      
      <UsuariosClient
        usuarios={usuariosData as any}
        total={Number(total)}
        currentPage={page}
        limit={limit}
      />
    </div>
  );
}
