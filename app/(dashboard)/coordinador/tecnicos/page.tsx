import type { Metadata } from "next";
import { db } from "@/lib/db";
import { usuarios, bitacoras } from "@/lib/schema";
import { eq, and, count, desc, sql } from "drizzle-orm";
import PageHeader from "@/components/layout/PageHeader";
import TecnicosClient from "./TecnicosClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Técnicos" };
export const revalidate = 30;

export default async function TecnicosPage() {
  const session = await getSession();
  if (!session || session.rol !== "COORDINADOR") redirect("/login");

  // Get all technicians
  const tecnicos = await db
    .select({
      id_usuario: usuarios.id_usuario,
      nombre_completo: usuarios.nombre_completo,
      email: usuarios.email,
      especialidad: usuarios.especialidad,
      activo: usuarios.activo,
      fecha_creacion: usuarios.fecha_creacion,
    })
    .from(usuarios)
    .where(eq(usuarios.rol, "TECNICO"))
    .orderBy(desc(usuarios.activo), usuarios.nombre_completo);

  // Get bitacoras count for each tecnico
  const bitacorasCounts = await db
    .select({
      id_usuario: bitacoras.id_usuario,
      total: count(),
    })
    .from(bitacoras)
    .groupBy(bitacoras.id_usuario);

  const bitacorasMap = new Map(
    bitacorasCounts.map(b => [b.id_usuario, Number(b.total)])
  );

  const tecnicosConStats = tecnicos.map(t => ({
    ...t,
    totalBitacoras: bitacorasMap.get(t.id_usuario) || 0,
  }));

  const [activos] = await db
    .select({ count: count() })
    .from(usuarios)
    .where(and(eq(usuarios.rol, "TECNICO"), eq(usuarios.activo, true)));

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Equipo de Técnicos"
        subtitle={`${tecnicosConStats.length} técnicos • ${Number(activos.count)} activos`}
      />

      <div className="p-8 bg-gray-50">
        <TecnicosClient
          tecnicos={JSON.parse(JSON.stringify(tecnicosConStats))}
        />
      </div>
    </div>
  );
}
