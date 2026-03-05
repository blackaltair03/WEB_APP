import type { Metadata } from "next";
import { db } from "@/lib/db";
import { beneficiarios, usuarios } from "@/lib/schema";
import { eq, and, ilike, or, count, asc } from "drizzle-orm";
import PageHeader from "@/components/layout/PageHeader";
import BeneficiariosClient from "@/app/(dashboard)/admin/beneficiarios/BeneficiariosClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Beneficiarios" };
export const revalidate = 30;

export default async function BeneficiariosCoordinadorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await getSession();
  if (!session || session.rol !== "COORDINADOR") redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = 20;
  const search = params.search ?? "";
  const municipio = params.municipio ?? "";
  const cadena = params.cadena ?? "";
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(beneficiarios.nombre_completo, `%${search}%`),
        ilike(beneficiarios.folio_saderh, `%${search}%`),
        ilike(beneficiarios.curp, `%${search}%`)
      )
    );
  }
  if (municipio) conditions.push(ilike(beneficiarios.municipio, `%${municipio}%`));
  if (cadena) conditions.push(eq(beneficiarios.cadena_productiva, cadena as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id_beneficiario: beneficiarios.id_beneficiario,
        folio_saderh: beneficiarios.folio_saderh,
        nombre_completo: beneficiarios.nombre_completo,
        municipio: beneficiarios.municipio,
        localidad: beneficiarios.localidad,
        cadena_productiva: beneficiarios.cadena_productiva,
        telefono_contacto: beneficiarios.telefono_contacto,
        origen_registro: beneficiarios.origen_registro,
        estatus_sync: beneficiarios.estatus_sync,
        fecha_registro: beneficiarios.fecha_registro,
        tecnico_nombre: usuarios.nombre_completo,
      })
      .from(beneficiarios)
      .leftJoin(usuarios, eq(beneficiarios.id_usuario_registro, usuarios.id_usuario))
      .where(where)
      .orderBy(asc(beneficiarios.nombre_completo))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(beneficiarios).where(where),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Beneficiarios"
        subtitle={`${Number(total).toLocaleString("es-MX")} registros en total`}
      />

      <div className="p-8 bg-gray-50">
        <BeneficiariosClient
          initialData={JSON.parse(JSON.stringify(rows))}
          total={Number(total)}
          page={page}
          limit={limit}
          search={search}
          municipio={municipio}
          cadena={cadena}
        />
      </div>
    </div>
  );
}
