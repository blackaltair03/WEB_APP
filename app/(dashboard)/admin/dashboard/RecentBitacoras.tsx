import { formatDateTime } from "@/lib/utils";
import { MapPin, Smartphone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface BitacoraItem {
  id_bitacora: number;
  tipo_bitacora: string;
  fecha_hora_inicio: Date;
  estatus_sincronizacion: string;
  nombre_tecnico: string | null;
}

export default function RecentBitacoras({ items }: { items: BitacoraItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        Sin bitácoras recientes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <a
          key={item.id_bitacora}
          href={`/admin/bitacoras/${item.id_bitacora}`}
          className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-guinda-200 hover:shadow-sm hover:bg-guinda-50/30 transition-all group"
        >
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
            item.tipo_bitacora === "BENEFICIARIO"
              ? "bg-guinda-100 text-guinda-700"
              : "bg-dorado-100 text-dorado-700"
          )}>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-guinda-900">
              {item.nombre_tecnico ?? "Técnico desconocido"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDateTime(item.fecha_hora_inicio)}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={cn(
              "text-[10px] font-medium px-2 py-1 rounded-full border",
              item.estatus_sincronizacion === "SINCRONIZADO"
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-yellow-100 text-yellow-700 border-yellow-200"
            )}>
              {item.estatus_sincronizacion === "SINCRONIZADO" ? "✓ Sync" : "Recibido"}
            </span>
          </div>
        </a>
      ))}
      <a
        href="/admin/bitacoras"
        className="block text-center text-xs font-medium text-guinda-700 hover:text-guinda-900 hover:underline pt-3 transition-colors"
      >
        Ver todas las bitácoras →
      </a>
    </div>
  );
}
