import type { Metadata } from "next";
import { db } from "@/lib/db";
import { bitacoras, usuarios } from "@/lib/schema";
import { eq, and, desc, count, or, ilike, gte, sql } from "drizzle-orm";
import PageHeader from "@/components/layout/PageHeader";
import BitacorasClient from "./BitacorasClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Bitácoras" };
export const revalidate = 30;

export default async function BitacorasPage({
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
  const tipo = params.tipo ?? "";
  const search = params.search ?? "";
  const offset = (page - 1) * limit;

  const conditions = [];
  if (estatus) conditions.push(eq(bitacoras.estatus_sincronizacion, estatus as any));
  if (tipo) conditions.push(eq(bitacoras.tipo_bitacora, tipo));
  if (search) {
    conditions.push(
      or(
        ilike(usuarios.nombre_completo, `%${search}%`),
        ilike(bitacoras.tipo_bitacora, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id_bitacora: bitacoras.id_bitacora,
        id_usuario: bitacoras.id_usuario,
        tipo_bitacora: bitacoras.tipo_bitacora,
        fecha_hora_inicio: bitacoras.fecha_hora_inicio,
        fecha_hora_fin: bitacoras.fecha_hora_fin,
        latitud: bitacoras.latitud,
        longitud: bitacoras.longitud,
        datos_extendidos: bitacoras.datos_extendidos,
        estatus_sincronizacion: bitacoras.estatus_sincronizacion,
        fecha_registro_servidor: bitacoras.fecha_registro_servidor,
        tecnico_nombre: usuarios.nombre_completo,
      })
      .from(bitacoras)
      .leftJoin(usuarios, eq(bitacoras.id_usuario, usuarios.id_usuario))
      .where(where)
      .orderBy(desc(bitacoras.fecha_registro_servidor))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(bitacoras).where(where),
  ]);

  // Stats
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const [hoy] = await db
    .select({ count: count() })
    .from(bitacoras)
    .where(gte(bitacoras.fecha_registro_servidor, startOfToday));

  const [pendientes] = await db
    .select({ count: count() })
    .from(bitacoras)
    .where(eq(bitacoras.estatus_sincronizacion, "PENDIENTE"));

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Bitácoras de Campo"
        subtitle={`${Number(total).toLocaleString("es-MX")} registros • ${Number(hoy.count)} hoy • ${Number(pendientes.count)} pendientes`}
      />

      <div className="p-8 bg-gray-50">
        <BitacorasClient
          initialData={JSON.parse(JSON.stringify(rows))}
          total={Number(total)}
          page={page}
          limit={limit}
          estatus={estatus}
          tipo={tipo}
          search={search}
        />
      </div>
    </div>
  );
}
