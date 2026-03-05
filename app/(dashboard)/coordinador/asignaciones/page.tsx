import type { Metadata } from "next";
import { db } from "@/lib/db";
import { asignaciones, usuarios, beneficiarios } from "@/lib/schema";
import { eq, and, desc, count, or, ilike } from "drizzle-orm";
import PageHeader from "@/components/layout/PageHeader";
import AsignacionesClient from "./AsignacionesClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Asignaciones" };
export const revalidate = 30;

export default async function AsignacionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await getSession();
  if (!session || session.rol !== "COORDINADOR") redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = 20;
  const estatus = params.estatus ?? "";
  const search = params.search ?? "";
  const offset = (page - 1) * limit;

  const conditions = [];
  if (estatus === "pendiente") conditions.push(eq(asignaciones.completado, false));
  if (estatus === "completado") conditions.push(eq(asignaciones.completado, true));
  if (search) {
    conditions.push(
      or(
        ilike(usuarios.nombre_completo, `%${search}%`),
        ilike(beneficiarios.nombre_completo, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id_asignacion: asignaciones.id_asignacion,
        id_tecnico: asignaciones.id_tecnico,
        id_beneficiario: asignaciones.id_beneficiario,
        descripcion: asignaciones.descripcion_actividad,
        tipo_asignacion: asignaciones.tipo_asignacion,
        fecha_asignacion: asignaciones.fecha_creacion,
        fecha_limite: asignaciones.fecha_limite,
        fecha_completado: asignaciones.fecha_completado,
        completado: asignaciones.completado,
        tecnico_nombre: usuarios.nombre_completo,
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
    db.select({ total: count() }).from(asignaciones).where(where),
  ]);

  const [pendientes] = await db
    .select({ count: count() })
    .from(asignaciones)
    .where(eq(asignaciones.completado, false));

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Asignaciones"
        subtitle={`${Number(total).toLocaleString("es-MX")} asignaciones • ${Number(pendientes.count)} pendientes`}
      >
        <a
          href="/coordinador/asignaciones/nueva"
          className="px-4 py-2 rounded-lg bg-guinda-700 text-white text-sm font-semibold hover:bg-guinda-800 transition-colors"
        >
          + Nueva asignación
        </a>
      </PageHeader>

      <div className="p-8 bg-gray-50">
        <AsignacionesClient
          initialData={JSON.parse(JSON.stringify(rows))}
          total={Number(total)}
          page={page}
          limit={limit}
          estatus={estatus}
          search={search}
        />
      </div>
    </div>
  );
}
