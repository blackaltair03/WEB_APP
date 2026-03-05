"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import DataTable from "@/components/tables/DataTable";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, User, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import styles from "../SharedListPage.module.css";

interface Bitacora {
  id_bitacora: number;
  id_usuario: number;
  tipo_bitacora: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string | null;
  latitud: number | null;
  longitud: number | null;
  datos_extendidos: any;
  estatus_sincronizacion: string;
  fecha_registro_servidor: string;
  tecnico_nombre: string | null;
}

interface Props {
  initialData: Bitacora[];
  total: number;
  page: number;
  limit: number;
  estatus: string;
  tipo: string;
  search: string;
}

export default function BitacorasClient({
  initialData, total, page, limit, estatus, tipo, search,
}: Props) {
  const router = useRouter();

  const updateQuery = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams({ estatus, tipo, search, page: String(page) });
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v); else sp.delete(k);
    });
    if (!params.page) sp.set("page", "1");
    router.push(`?${sp.toString()}`);
  }, [router, estatus, tipo, search, page]);

  const totalPages = Math.ceil(total / limit);

  const columns = [
    {
      key: "tipo_bitacora" as keyof Bitacora,
      label: "Tipo",
      sortable: true,
      render: (v: unknown, row: Bitacora) => (
        <div>
          <p className="font-medium text-guinda-900 mb-1">{String(v)}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>{row.tecnico_nombre || "—"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "fecha_hora_inicio" as keyof Bitacora,
      label: "Fecha/Hora",
      sortable: true,
      render: (v: unknown, row: Bitacora) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-900">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(new Date(String(v)), "d MMM yyyy")}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDate(new Date(String(v)), "HH:mm")}</span>
            {row.fecha_hora_fin && (
              <>
                <span>→</span>
                <span>{formatDate(new Date(row.fecha_hora_fin), "HH:mm")}</span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "latitud" as keyof Bitacora,
      label: "Ubicación",
      render: (v: unknown, row: Bitacora) => {
        if (!v || !row.longitud) {
          return <span className="text-xs text-gray-400">Sin coordenadas</span>;
        }
        return (
          <a
            href={`https://maps.google.com/?q=${v},${row.longitud}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-guinda-600 hover:text-guinda-700 hover:underline"
          >
            <MapPin className="w-3 h-3" />
            <span className="font-mono text-xs">
              {Number(v).toFixed(4)}, {Number(row.longitud).toFixed(4)}
            </span>
          </a>
        );
      },
    },
    {
      key: "datos_extendidos" as keyof Bitacora,
      label: "Datos",
      render: (v: unknown) => {
        if (!v || typeof v !== 'object') {
          return <span className="text-xs text-gray-400">Sin datos</span>;
        }
        const datos = v as Record<string, unknown>;
        const keys = Object.keys(datos);
        if (keys.length === 0) {
          return <span className="text-xs text-gray-400">Sin datos</span>;
        }
        return (
          <span className="text-sm text-gray-600" title={JSON.stringify(datos, null, 2)}>
            {keys.length} campo{keys.length !== 1 ? 's' : ''}
          </span>
        );
      },
    },
    {
      key: "estatus_sincronizacion" as keyof Bitacora,
      label: "Sincronización",
      render: (v: unknown) => {
        const estatus = String(v);
        const configs = {
          SINCRONIZADO: {
            icon: CheckCircle2,
            className: "bg-green-100 text-green-700 border-green-200",
          },
          PENDIENTE: {
            icon: Clock,
            className: "bg-yellow-100 text-yellow-700 border-yellow-200",
          },
          ERROR: {
            icon: AlertCircle,
            className: "bg-red-100 text-red-700 border-red-200",
          },
        };
        
        const config = configs[estatus as keyof typeof configs] || configs.PENDIENTE;
        const Icon = config.icon;
        
        return (
          <div className="flex items-center gap-1">
            <span className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium",
              config.className
            )}>
              <Icon className="w-3 h-3" />
              {estatus}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.root}>
      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar técnico o tipo de bitácora..."
              defaultValue={search}
              onChange={(e) => updateQuery({ search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-guinda-700 focus:ring-2 focus:ring-guinda-700/10 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={estatus}
              onChange={(e) => updateQuery({ estatus: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-guinda-700 focus:ring-2 focus:ring-guinda-700/10 transition-colors text-sm"
            >
              <option value="">Todos los estatus</option>
              <option value="SINCRONIZADO">Sincronizado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ERROR">Error</option>
            </select>
            <select
              value={tipo}
              onChange={(e) => updateQuery({ tipo: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-guinda-700 focus:ring-2 focus:ring-guinda-700/10 transition-colors text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="VISITA">Visita</option>
              <option value="SUPERVISION">Supervisión</option>
              <option value="CAPACITACION">Capacitación</option>
              <option value="ASISTENCIA">Asistencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <DataTable
          columns={columns as any}
          data={initialData as any}
          rowKey="id_bitacora"
          emptyMessage="No hay bitácoras registradas"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.paginationCard}>
          <div className={styles.paginationInfo}>
            Página {page} de {totalPages} • {total.toLocaleString("es-MX")} total
          </div>
          <div className={styles.paginationActions}>
            <button
              onClick={() => updateQuery({ page: String(page - 1) })}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => updateQuery({ page: String(page + 1) })}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
