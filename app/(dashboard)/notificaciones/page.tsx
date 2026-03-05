import PageHeader from "@/components/layout/PageHeader";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notificaciones } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export const revalidate = 30;

export default async function NotificacionesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = await db
    .select({
      id_notificacion: notificaciones.id_notificacion,
      titulo: notificaciones.titulo,
      mensaje: notificaciones.mensaje,
      tipo: notificaciones.tipo,
      leida: notificaciones.leida,
      fecha_creacion: notificaciones.fecha_creacion,
    })
    .from(notificaciones)
    .where(eq(notificaciones.id_usuario, session.id_usuario))
    .orderBy(desc(notificaciones.fecha_creacion))
    .limit(100);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Notificaciones"
        subtitle={`${items.length} notificaciones`}
      />

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tienes notificaciones.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id_notificacion} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-guinda-900">{item.titulo}</p>
                    <p className="text-sm text-gray-700 mt-1">{item.mensaje}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(item.fecha_creacion).toLocaleString("es-MX")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      item.leida
                        ? "bg-gray-100 text-gray-600 border-gray-200"
                        : "bg-dorado-100 text-dorado-700 border-dorado-200"
                    }`}
                  >
                    {item.leida ? "Leída" : "Nueva"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
