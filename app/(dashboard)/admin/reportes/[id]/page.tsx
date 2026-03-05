import PageHeader from "@/components/layout/PageHeader";
import BitacorasPDFClient from "./BitacorasPDFClient";
import { db } from "@/lib/db";
import { bitacoras, usuarios } from "@/lib/schema";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function TecnicoBitacorasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "COORDINADOR"].includes(session.rol)) redirect("/login");

  const { id } = await params;
  const idUsuario = parseInt(id);

  if (Number.isNaN(idUsuario)) notFound();

  const [tecnico] = await db
    .select({
      id_usuario: usuarios.id_usuario,
      nombre_completo: usuarios.nombre_completo,
      especialidad: usuarios.especialidad,
    })
    .from(usuarios)
    .where(and(eq(usuarios.id_usuario, idUsuario), eq(usuarios.rol, "TECNICO")))
    .limit(1);

  if (!tecnico) notFound();

  const bitacorasData = await db
    .select({
      id_bitacora: bitacoras.id_bitacora,
      fecha_hora_inicio: bitacoras.fecha_hora_inicio,
      fecha_hora_fin: bitacoras.fecha_hora_fin,
      tipo_bitacora: bitacoras.tipo_bitacora,
      latitud: bitacoras.latitud,
      longitud: bitacoras.longitud,
      datos_extendidos: bitacoras.datos_extendidos,
    })
    .from(bitacoras)
    .where(eq(bitacoras.id_usuario, idUsuario))
    .orderBy(desc(bitacoras.fecha_hora_inicio));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bitácoras de ${tecnico.nombre_completo}`}
        subtitle="Revisa y edita los datos antes de generar el PDF"
      />
      
      <BitacorasPDFClient
        tecnico={{ ...tecnico, especialidad: tecnico.especialidad ?? "SIN_ESPECIALIDAD" } as any}
        bitacoras={bitacorasData.map((b) => ({
          ...b,
          fecha_hora_inicio: b.fecha_hora_inicio?.toISOString?.() ?? String(b.fecha_hora_inicio),
          fecha_hora_fin: b.fecha_hora_fin?.toISOString?.() ?? null,
          latitud: String(b.latitud),
          longitud: String(b.longitud),
          datos_extendidos: (b.datos_extendidos ?? {}) as Record<string, unknown>,
        })) as any}
      />
    </div>
  );
}
