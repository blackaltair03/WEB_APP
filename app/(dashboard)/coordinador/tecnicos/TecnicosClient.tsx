"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { User, Mail, Award, BookOpen, CheckCircle2, XCircle, Calendar } from "lucide-react";
import styles from "../SharedListPage.module.css";

interface Tecnico {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  especialidad: string | null;
  activo: boolean;
  fecha_creacion: string;
  totalBitacoras: number;
}

interface Props {
  tecnicos: Tecnico[];
}

export default function TecnicosClient({ tecnicos }: Props) {
  const [filtro, setFiltro] = useState<"todos" | "activos" | "inactivos">("todos");
  const [busqueda, setBusqueda] = useState("");

  const tecnicosFiltrados = tecnicos.filter((t) => {
    const cumpleFiltro = 
      filtro === "todos" ? true :
      filtro === "activos" ? t.activo :
      !t.activo;
    
    const cumpleBusqueda = busqueda === "" ||
      t.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (t.especialidad && t.especialidad.toLowerCase().includes(busqueda.toLowerCase()));

    return cumpleFiltro && cumpleBusqueda;
  });

  return (
    <div className={styles.root}>
      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar técnico por nombre, email o especialidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-guinda-700 focus:ring-2 focus:ring-guinda-700/10 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro("todos")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filtro === "todos" 
                  ? "bg-guinda-700 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltro("activos")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filtro === "activos" 
                  ? "bg-guinda-700 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Activos
            </button>
            <button
              onClick={() => setFiltro("inactivos")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filtro === "inactivos" 
                  ? "bg-guinda-700 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* Grid de técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tecnicosFiltrados.length > 0 ? (
          tecnicosFiltrados.map((tecnico) => (
            <div
              key={tecnico.id_usuario}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-guinda-300 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-guinda-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-guinda-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-guinda-900 font-display">
                      {tecnico.nombre_completo}
                    </h3>
                    {tecnico.especialidad && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Award className="w-3 h-3" />
                        <span>{tecnico.especialidad}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {tecnico.activo ? (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Activo</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      <XCircle className="w-3 h-3" />
                      <span>Inactivo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a 
                    href={`mailto:${tecnico.email}`}
                    className="hover:text-guinda-700 hover:underline truncate"
                  >
                    {tecnico.email}
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-dorado-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-dorado-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bitácoras</p>
                    <p className="text-lg font-bold text-guinda-700 font-display">
                      {tecnico.totalBitacoras}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Desde</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(new Date(tecnico.fecha_creacion), "MMM yyyy")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <a
                  href={`/coordinador/tecnicos/${tecnico.id_usuario}`}
                  className="flex-1 px-3 py-2 rounded-lg border border-guinda-700 text-guinda-700 text-xs font-medium hover:bg-guinda-50 transition-colors text-center"
                >
                  Ver detalles
                </a>
                <a
                  href={`/coordinador/asignaciones/nueva?tecnico=${tecnico.id_usuario}`}
                  className="flex-1 px-3 py-2 rounded-lg bg-dorado-600 text-white text-xs font-medium hover:bg-dorado-700 transition-colors text-center"
                >
                  Asignar tarea
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 rounded-lg border border-gray-200 bg-white">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron técnicos</p>
          </div>
        )}
      </div>

      {/* Resumen */}
      {tecnicosFiltrados.length > 0 && (
        <div className="rounded-lg border border-guinda-200 bg-guinda-50 p-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-5 h-5 text-guinda-700" />
            <p className="text-guinda-900">
              Mostrando <strong>{tecnicosFiltrados.length}</strong> técnico{tecnicosFiltrados.length !== 1 ? "s" : ""} de <strong>{tecnicos.length}</strong> total
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
