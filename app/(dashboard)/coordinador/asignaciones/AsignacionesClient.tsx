"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import DataTable from "@/components/tables/DataTable";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, AlertCircle, User, MapPin, Calendar } from "lucide-react";
import styles from "../SharedListPage.module.css";

interface Asignacion {
  id_asignacion: number;
  id_tecnico: number;
  id_beneficiario: number;
  descripcion: string | null;
  tipo_asignacion: string;
  fecha_asignacion: string;
  fecha_limite: string;
  fecha_completado: string | null;
  completado: boolean;
  tecnico_nombre: string | null;
  beneficiario_nombre: string | null;
  beneficiario_municipio: string | null;
}

interface Props {
  initialData: Asignacion[];
  total: number;
  page: number;
  limit: number;
  estatus: string;
  search: string;
}

export default function AsignacionesClient({
  initialData, total, page, limit, estatus, search,
}: Props) {
  const router = useRouter();

  const updateQuery = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams({ estatus, search, page: String(page) });
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v); else sp.delete(k);
    });
    if (!params.page) sp.set("page", "1");
    router.push(`?${sp.toString()}`);
  }, [router, estatus, search, page]);

  const totalPages = Math.ceil(total / limit);

  const columns = [
    {
      key: "descripcion" as keyof Asignacion,
      label: "Descripción",
      sortable: true,
      render: (v: unknown, row: Asignacion) => (
        <div>
          <p className="font-medium text-guinda-900 mb-1">{String(v)}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{row.tecnico_nombre || "Sin asignar"}</span>
            </div>
            {row.beneficiario_nombre && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{row.beneficiario_nombre}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "fecha_asignacion" as keyof Asignacion,
      label: "Asignada",
      sortable: true,
      render: (v: unknown) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(new Date(String(v)), "d MMM yyyy")}</span>
        </div>
      ),
    },
    {
      key: "fecha_limite" as keyof Asignacion,
      label: "Límite",
      render: (v: unknown, row: Asignacion) => {
        if (!v) return <span className="text-xs text-gray-400">Sin límite</span>;
        const limite = new Date(String(v));
        const hoy = new Date();
        const vencida = limite < hoy && !row.completado;
        return (
          <div className={cn(
            "flex items-center gap-1 text-sm",
            vencida ? "text-red-600 font-medium" : "text-gray-600"
          )}>
            <Clock className="w-3 h-3" />
            <span>{formatDate(limite, "d MMM yyyy")}</span>
            {vencida && <AlertCircle className="w-3 h-3 ml-1" />}
          </div>
        );
      },
    },
    {
      key: "tipo_asignacion" as keyof Asignacion,
      label: "Tipo",
      render: (v: unknown) => {
        const tipo = String(v || "GENERAL");
        return (
          <span className="text-xs px-2 py-1 rounded-full border bg-guinda-100 text-guinda-700 border-guinda-200 font-medium">
            {tipo}
          </span>
        );
      },
    },
    {
      key: "completado" as keyof Asignacion,
      label: "Estatus",
      render: (v: unknown, row: Asignacion) => {
        if (v) {
          return (
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-1 rounded-full border bg-green-100 text-green-700 border-green-200 font-medium">
                Completado
              </span>
              {row.fecha_completado && (
                <span className="text-xs text-gray-500">
                  {formatDate(new Date(row.fecha_completado), "d MMM")}
                </span>
              )}
            </div>
          );
        }
        return (
          <span className="text-xs px-2 py-1 rounded-full border bg-amber-100 text-amber-700 border-amber-200 font-medium">
            Pendiente
          </span>
        );
      },
    },
  ];

  return (
    <div className={styles.root}>
      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar técnico o beneficiario..."
              defaultValue={search}
              onChange={(e) => updateQuery({ search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-guinda-700 focus:ring-2 focus:ring-guinda-700/10 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateQuery({ estatus: "" })}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                estatus === "" 
                  ? "bg-guinda-700 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => updateQuery({ estatus: "pendiente" })}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                estatus === "pendiente" 
                  ? "bg-guinda-700 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Pendientes
            </button>
            <button
              onClick={() => updateQuery({ estatus: "completado" })}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                estatus === "completado" 
                  ? "bg-guinda-700 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Completadas
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <DataTable
          columns={columns as any}
          data={initialData as any}
          rowKey="id_asignacion"
          emptyMessage="No hay asignaciones registradas"
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
