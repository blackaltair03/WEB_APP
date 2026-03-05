"use client";

import { useState } from "react";
import { PlusCircle, UserCheck, ClipboardList, Activity, Calendar, CheckCircle, Clock, X } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import styles from "./AsignacionesClient.module.css";

interface Asignacion {
  id_asignacion: number;
  tipo_asignacion: string;
  descripcion_actividad?: string;
  fecha_limite: string;
  completado: boolean;
  fecha_creacion: string;
  tecnico?: {
    id_usuario: number;
    nombre_completo: string;
    especialidad?: string;
  };
  beneficiario?: {
    id_beneficiario: number;
    nombre_completo: string;
    municipio: string;
  } | null;
}

interface Props {
  asignaciones: Asignacion[];
  total: number;
  currentPage: number;
  limit: number;
  coordinadores: { id_usuario: number; nombre_completo: string }[];
  tecnicos: { id_usuario: number; nombre_completo: string; especialidad?: string | null }[];
  beneficiariosOpciones: { id_beneficiario: number; nombre_completo: string; municipio: string }[];
}

type ModalType = null | "coordinador-tecnico" | "tecnico-beneficiario" | "actividad-general";

export default function AsignacionesClient({
  asignaciones,
  total,
  currentPage,
  limit,
  coordinadores,
  tecnicos,
  beneficiariosOpciones,
}: Props) {
  const { error, success, warning } = useToast();
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("TODOS");
  const [modalOpen, setModalOpen] = useState<ModalType>(null);

  // Estados para formulario Coordinador-Técnico
  const [coordinadorId, setCoordinadorId] = useState("");
  const [tecnicoIds, setTecnicoIds] = useState<string[]>([]);

  // Estados para formulario Técnico-Beneficiario
  const [tecnicoId, setTecnicoId] = useState("");
  const [beneficiarioId, setBeneficiarioId] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Estados para formulario Actividad General
  const [tecnicoIdActividad, setTecnicoIdActividad] = useState("");
  const [actividadDescripcion, setActividadDescripcion] = useState("");
  const [fechaLimiteActividad, setFechaLimiteActividad] = useState("");
  const [zona, setZona] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tipoFilter !== "TODOS") params.set("tipo", tipoFilter);
    window.location.href = `/admin/asignaciones?${params.toString()}`;
  };

  const handleSubmitCoordinadorTecnico = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coordinadorId || tecnicoIds.length === 0) {
      warning("Campos requeridos", { description: "Selecciona un coordinador y al menos un técnico" });
      return;
    }

    try {
      const res = await fetch("/api/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_asignacion: "COORDINADOR_TECNICO",
          tecnicos_ids: tecnicoIds,
          fecha_limite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          descripcion_actividad: `Supervisión asignada por coordinador ID ${coordinadorId}`,
        }),
      });

      if (res.ok) {
        success("Asignación creada", { description: "La asignación se ha creado correctamente" });
        setModalOpen(null);
        setCoordinadorId("");
        setTecnicoIds([]);
      } else {
        const err = await res.json();
        error(err?.error ?? "No se pudo crear la asignación");
      }
    } catch (err) {
      console.error("Error al crear asignación:", err);
      error("Error de conexión", { description: "No se pudo conectar con el servidor" });
    }
  };

  const handleSubmitTecnicoBeneficiario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tecnicoId || !beneficiarioId || !fechaLimite) {
      warning("Campos requeridos", { description: "Completa todos los campos" });
      return;
    }

    try {
      const res = await fetch("/api/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_asignacion: "BENEFICIARIO",
          id_tecnico: tecnicoId,
          id_beneficiario: beneficiarioId,
          fecha_limite: fechaLimite,
          descripcion_actividad: descripcion,
        }),
      });

      if (res.ok) {
        success("Asignación creada", { description: "La asignación se ha creado correctamente" });
        setModalOpen(null);
        setTecnicoId("");
        setBeneficiarioId("");
        setFechaLimite("");
        setDescripcion("");
      } else {
        const err = await res.json();
        error(err?.error ?? "No se pudo crear la asignación");
      }
    } catch (err) {
      console.error("Error al crear asignación:", err);
      error("Error de conexión", { description: "No se pudo conectar con el servidor" });
    }
  };

  const handleSubmitActividadGeneral = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tecnicoIdActividad || !actividadDescripcion || !fechaLimiteActividad) {
      warning("Campos requeridos", { description: "Completa todos los campos" });
      return;
    }

    try {
      const res = await fetch("/api/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_asignacion: "ACTIVIDAD",
          id_tecnico: tecnicoIdActividad,
          descripcion_actividad: `${actividadDescripcion} ${zona ? `(Zona: ${zona})` : ""}`,
          fecha_limite: fechaLimiteActividad,
        }),
      });

      if (res.ok) {
        success("Asignación creada", { description: "La asignación se ha creado correctamente" });
        setModalOpen(null);
        setTecnicoIdActividad("");
        setActividadDescripcion("");
        setFechaLimiteActividad("");
        setZona("");
      } else {
        const err = await res.json();
        error(err?.error ?? "No se pudo crear la asignación");
      }
    } catch (err) {
      console.error("Error al crear asignación:", err);
      error("Error de conexión", { description: "No se pudo conectar con el servidor" });
    }
  };

  return (
    <>
      {/* Filtros y Botones de Acción */}
      <div className={styles.filtersCard}>
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por técnico, beneficiario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700 transition-colors"
            />
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700 transition-colors"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="BENEFICIARIO">Beneficiario</option>
              <option value="ACTIVIDAD">Actividad General</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Botones de Crear Asignación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setModalOpen("coordinador-tecnico")}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-guinda-700 text-guinda-700 rounded-lg hover:bg-guinda-50 transition-colors font-display"
          >
            <UserCheck className="h-5 w-5" />
            Coordinador a Técnico
          </button>
          <button
            onClick={() => setModalOpen("tecnico-beneficiario")}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-guinda-700 text-guinda-700 rounded-lg hover:bg-guinda-50 transition-colors font-display"
          >
            <ClipboardList className="h-5 w-5" />
            Técnico a Beneficiario
          </button>
          <button
            onClick={() => setModalOpen("actividad-general")}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dorado-600 text-dorado-700 rounded-lg hover:bg-dorado-50 transition-colors font-display"
          >
            <Activity className="h-5 w-5" />
            Actividad General
          </button>
        </div>
      </div>

      {/* Lista de Asignaciones */}
      <div className={styles.tableCard}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-guinda-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Técnico
                </th>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Beneficiario / Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Fecha Límite
                </th>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {asignaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron asignaciones
                  </td>
                </tr>
              ) : (
                asignaciones.map((asignacion) => (
                  <tr key={asignacion.id_asignacion} className="hover:bg-guinda-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          asignacion.tipo_asignacion === "BENEFICIARIO"
                            ? "bg-guinda-100 text-guinda-700 border border-guinda-200"
                            : "bg-dorado-100 text-dorado-700 border border-dorado-200"
                        }`}
                      >
                        {asignacion.tipo_asignacion === "BENEFICIARIO" ? "Beneficiario" : "Actividad"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-guinda-900">
                        {asignacion.tecnico?.nombre_completo}
                      </div>
                      {asignacion.tecnico?.especialidad && (
                        <div className="text-xs text-gray-500">{asignacion.tecnico.especialidad}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {asignacion.beneficiario ? (
                        <div>
                          <div className="text-sm text-gray-900">{asignacion.beneficiario.nombre_completo}</div>
                          <div className="text-xs text-gray-500">{asignacion.beneficiario.municipio}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 italic">
                          {asignacion.descripcion_actividad || "Sin descripción"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                        {new Date(asignacion.fecha_limite).toLocaleDateString("es-MX")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asignacion.completado ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Completado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-guinda-700 hover:text-guinda-900 hover:underline">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {total > limit && (
          <div className={styles.paginationBar}>
            <div className="text-sm text-gray-700">
              Mostrando {(currentPage - 1) * limit + 1} a {Math.min(currentPage * limit, total)} de {total}{" "}
              asignaciones
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <a
                  href={`?page=${currentPage - 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Anterior
                </a>
              )}
              {currentPage * limit < total && (
                <a
                  href={`?page=${currentPage + 1}`}
                  className="px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors"
                >
                  Siguiente
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Coordinador-Técnico */}
      {modalOpen === "coordinador-tecnico" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalPanel}>
            <div className={styles.modalBody}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-guinda-900">Asignar Coordinador a Técnico</h2>
                <button onClick={() => setModalOpen(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitCoordinadorTecnico} className="space-y-4">
                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Coordinador
                  </label>
                  <select
                    value={coordinadorId}
                    onChange={(e) => setCoordinadorId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                  >
                    <option value="">Seleccionar coordinador</option>
                    {coordinadores.map((coordinador) => (
                      <option key={coordinador.id_usuario} value={String(coordinador.id_usuario)}>
                        {coordinador.nombre_completo} (COORDINADOR)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Técnicos (puede seleccionar varios)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {tecnicos.map((tecnico) => (
                      <label key={tecnico.id_usuario} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          value={String(tecnico.id_usuario)}
                          checked={tecnicoIds.includes(String(tecnico.id_usuario))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTecnicoIds([...tecnicoIds, String(tecnico.id_usuario)]);
                            } else {
                              setTecnicoIds(tecnicoIds.filter((id) => id !== String(tecnico.id_usuario)));
                            }
                          }}
                          className="rounded border-gray-300 text-guinda-700 focus:ring-guinda-700"
                        />
                        <span className="text-sm text-gray-700">
                          {tecnico.nombre_completo} <span className="text-xs text-gray-500">({tecnico.especialidad || "SIN_ESPECIALIDAD"})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
                  >
                    Asignar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Técnico-Beneficiario */}
      {modalOpen === "tecnico-beneficiario" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalPanel}>
            <div className={styles.modalBody}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-guinda-900">Asignar Técnico a Beneficiario</h2>
                <button onClick={() => setModalOpen(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitTecnicoBeneficiario} className="space-y-4">
                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Técnico
                  </label>
                  <select
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                  >
                    <option value="">Seleccionar técnico</option>
                    {tecnicos.map((tecnico) => (
                      <option key={tecnico.id_usuario} value={String(tecnico.id_usuario)}>
                        {tecnico.nombre_completo} ({tecnico.especialidad || "SIN_ESPECIALIDAD"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Beneficiario
                  </label>
                  <select
                    value={beneficiarioId}
                    onChange={(e) => setBeneficiarioId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                  >
                    <option value="">Seleccionar beneficiario</option>
                    {beneficiariosOpciones.map((beneficiario) => (
                      <option key={beneficiario.id_beneficiario} value={String(beneficiario.id_beneficiario)}>
                        {beneficiario.nombre_completo} - {beneficiario.municipio}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Descripción de la actividad
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                    placeholder="Describe la actividad a realizar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    value={fechaLimite}
                    onChange={(e) => setFechaLimite(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
                  >
                    Asignar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Actividad General */}
      {modalOpen === "actividad-general" && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalPanel}>
            <div className={styles.modalBody}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-guinda-900">Asignar Actividad General</h2>
                <button onClick={() => setModalOpen(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmitActividadGeneral} className="space-y-4">
                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Técnico
                  </label>
                  <select
                    value={tecnicoIdActividad}
                    onChange={(e) => setTecnicoIdActividad(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                  >
                    <option value="">Seleccionar técnico</option>
                    {tecnicos.map((tecnico) => (
                      <option key={tecnico.id_usuario} value={String(tecnico.id_usuario)}>
                        {tecnico.nombre_completo} ({tecnico.especialidad || "SIN_ESPECIALIDAD"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Descripción de la actividad
                  </label>
                  <textarea
                    value={actividadDescripcion}
                    onChange={(e) => setActividadDescripcion(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                    placeholder="Describe la actividad general a realizar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Zona (opcional)
                  </label>
                  <input
                    type="text"
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                    placeholder="Ej: Zona Norte, Zona Centro..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    value={fechaLimiteActividad}
                    onChange={(e) => setFechaLimiteActividad(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-dorado-600 text-white rounded-lg hover:bg-dorado-700 transition-colors font-display"
                  >
                    Asignar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
