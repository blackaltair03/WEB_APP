import PageHeader from "@/components/layout/PageHeader";
import AsignacionesClient from "./AsignacionesClient";
import { db } from "@/lib/db";
import { asignaciones, usuarios, beneficiarios } from "@/lib/schema";
import { and, eq, ilike, or, count, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AsignacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "COORDINADOR"].includes(session.rol)) redirect("/login");

  // Obtener parámetros de búsqueda
  const params = await searchParams;
  const search = params.search as string | undefined;
  const tipo = params.tipo as string | undefined;
  const page = params.page ? parseInt(params.page as string) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(usuarios.nombre_completo, `%${search}%`),
        ilike(beneficiarios.nombre_completo, `%${search}%`),
        ilike(asignaciones.descripcion_actividad, `%${search}%`)
      )
    );
  }
  if (tipo && tipo !== "TODOS") {
    conditions.push(eq(asignaciones.tipo_asignacion, tipo));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id_asignacion: asignaciones.id_asignacion,
        tipo_asignacion: asignaciones.tipo_asignacion,
        descripcion_actividad: asignaciones.descripcion_actividad,
        fecha_limite: asignaciones.fecha_limite,
        completado: asignaciones.completado,
        fecha_creacion: asignaciones.fecha_creacion,
        tecnico_id: usuarios.id_usuario,
        tecnico_nombre: usuarios.nombre_completo,
        tecnico_especialidad: usuarios.especialidad,
        beneficiario_id: beneficiarios.id_beneficiario,
        beneficiario_nombre: beneficiarios.nombre_completo,
        beneficiario_municipio: beneficiarios.municipio,
      })
      .from(asignaciones)
      .leftJoin(usuarios, eq(asignaciones.id_tecnico, usuarios.id_usuario))
      .leftJoin(beneficiarios, eq(asignaciones.id_beneficiario, beneficiarios.id_beneficiario))
      .where(where)
      .orderBy(desc(asignaciones.fecha_creacion))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(asignaciones).leftJoin(usuarios, eq(asignaciones.id_tecnico, usuarios.id_usuario)).leftJoin(beneficiarios, eq(asignaciones.id_beneficiario, beneficiarios.id_beneficiario)).where(where),
  ]);

  const [coordinadores, tecnicos, beneficiariosOpciones] = await Promise.all([
    db
      .select({
        id_usuario: usuarios.id_usuario,
        nombre_completo: usuarios.nombre_completo,
      })
      .from(usuarios)
      .where(and(eq(usuarios.rol, "COORDINADOR"), eq(usuarios.activo, true)))
      .orderBy(usuarios.nombre_completo),
    db
      .select({
        id_usuario: usuarios.id_usuario,
        nombre_completo: usuarios.nombre_completo,
        especialidad: usuarios.especialidad,
      })
      .from(usuarios)
      .where(and(eq(usuarios.rol, "TECNICO"), eq(usuarios.activo, true)))
      .orderBy(usuarios.nombre_completo),
    db
      .select({
        id_beneficiario: beneficiarios.id_beneficiario,
        nombre_completo: beneficiarios.nombre_completo,
        municipio: beneficiarios.municipio,
      })
      .from(beneficiarios)
      .orderBy(beneficiarios.nombre_completo)
      .limit(500),
  ]);

  const asignacionesData = rows.map((row) => ({
    id_asignacion: row.id_asignacion,
    tipo_asignacion: row.tipo_asignacion,
    descripcion_actividad: row.descripcion_actividad ?? undefined,
    fecha_limite: String(row.fecha_limite),
    completado: row.completado,
    fecha_creacion: row.fecha_creacion?.toISOString?.() ?? String(row.fecha_creacion),
    tecnico: row.tecnico_id
      ? {
          id_usuario: row.tecnico_id,
          nombre_completo: row.tecnico_nombre ?? "Sin técnico",
          especialidad: row.tecnico_especialidad ?? undefined,
        }
      : undefined,
    beneficiario: row.beneficiario_id
      ? {
          id_beneficiario: row.beneficiario_id,
          nombre_completo: row.beneficiario_nombre ?? "Sin beneficiario",
          municipio: row.beneficiario_municipio ?? "-",
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asignaciones"
        subtitle="Gestiona las asignaciones de técnicos a beneficiarios y actividades"
      />
      
      <AsignacionesClient
        asignaciones={asignacionesData as any}
        total={Number(total)}
        currentPage={page}
        limit={limit}
        coordinadores={coordinadores as any}
        tecnicos={tecnicos as any}
        beneficiariosOpciones={beneficiariosOpciones as any}
      />
    </div>
  );
}
