import PageHeader from "@/components/layout/PageHeader";
import ReportesClient from "./ReportesClient";
import { db } from "@/lib/db";
import { usuarios } from "@/lib/schema";
import { and, eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReportesPage() {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "COORDINADOR"].includes(session.rol)) redirect("/login");

  const tecnicos = await db
    .select({
      id_usuario: usuarios.id_usuario,
      nombre_completo: usuarios.nombre_completo,
      especialidad: usuarios.especialidad,
    })
    .from(usuarios)
    .where(and(eq(usuarios.rol, "TECNICO"), eq(usuarios.activo, true)))
    .orderBy(asc(usuarios.nombre_completo));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes de Bitácoras"
        subtitle="Genera reportes PDF de las bitácoras de los técnicos"
      />
      
      <ReportesClient tecnicos={tecnicos.map((t) => ({ ...t, especialidad: t.especialidad ?? "SIN_ESPECIALIDAD" })) as any} />
    </div>
  );
}
