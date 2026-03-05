import PageHeader from "@/components/layout/PageHeader";
import ConfiguracionClient from "./ConfiguracionClient";
import { db } from "@/lib/db";
import { configuracion_sistema, plantillas_pdf } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export default async function ConfiguracionPage() {
  const [localidadesRows, plantillasRows, formatosRows] = await Promise.all([
    db
      .select({
        id: configuracion_sistema.id_config,
        clave: configuracion_sistema.clave,
        valor: configuracion_sistema.valor,
        descripcion: configuracion_sistema.descripcion,
      })
      .from(configuracion_sistema)
      .where(eq(configuracion_sistema.tipo, "LOCALIDAD"))
      .orderBy(asc(configuracion_sistema.clave)),
    db
      .select({
        id_plantilla: plantillas_pdf.id_plantilla,
        nombre: plantillas_pdf.nombre,
        tipo: plantillas_pdf.tipo,
        activo: plantillas_pdf.activo,
      })
      .from(plantillas_pdf)
      .orderBy(asc(plantillas_pdf.nombre)),
    db
      .select({
        id: configuracion_sistema.id_config,
        clave: configuracion_sistema.clave,
        valor: configuracion_sistema.valor,
        descripcion: configuracion_sistema.descripcion,
      })
      .from(configuracion_sistema)
      .where(eq(configuracion_sistema.tipo, "FORMATO"))
      .orderBy(asc(configuracion_sistema.clave)),
  ]);

  const localidades = localidadesRows.map((row) => {
    let nombre = row.descripcion || row.clave;
    let municipio = "Sin municipio";

    if (row.valor) {
      try {
        const parsed = JSON.parse(row.valor);
        if (parsed?.nombre) nombre = String(parsed.nombre);
        if (parsed?.municipio) municipio = String(parsed.municipio);
      } catch {
        nombre = row.valor;
      }
    }

    return { id: row.id, nombre, municipio };
  });

  const plantillas = plantillasRows;

  const formatos = formatosRows.map((row) => {
    let nombre = row.descripcion || row.clave;
    let extension = "";
    let max_size = "";

    if (row.valor) {
      try {
        const parsed = JSON.parse(row.valor);
        if (parsed?.nombre) nombre = String(parsed.nombre);
        if (parsed?.extension) extension = String(parsed.extension);
        if (parsed?.max_size) max_size = String(parsed.max_size);
      } catch {
        extension = row.valor;
      }
    }

    return { id: row.id, nombre, extension, max_size };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración del Sistema"
        subtitle="Gestiona localidades, plantillas PDF, formatos de archivos y notificaciones"
      />
      
      <ConfiguracionClient
        localidades={localidades}
        plantillas={plantillas}
        formatos={formatos}
      />
    </div>
  );
}
