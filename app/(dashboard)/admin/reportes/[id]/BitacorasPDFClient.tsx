"use client";

import { useState } from "react";
import { Calendar, MapPin, Clock, FileText, Save, Download, Edit2, X, Check } from "lucide-react";
import Link from "next/link";

interface Bitacora {
  id_bitacora: number;
  fecha_hora_inicio: string;
  fecha_hora_fin: string | null;
  tipo_bitacora: string;
  latitud: string;
  longitud: string;
  datos_extendidos: Record<string, any>;
}

interface Tecnico {
  id_usuario: number;
  nombre_completo: string;
  especialidad: string;
}

interface Props {
  tecnico: Tecnico;
  bitacoras: Bitacora[];
}

export default function BitacorasPDFClient({ tecnico, bitacoras }: Props) {
  const [bitacorasEditables, setBitacorasEditables] = useState(bitacoras);
  const [editando, setEditando] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const handleEditar = (bitacora: Bitacora) => {
    setEditando(bitacora.id_bitacora);
    setEditData({
      beneficiario_nombre: bitacora.datos_extendidos.beneficiario_nombre || bitacora.datos_extendidos.descripcion || "",
      municipio: bitacora.datos_extendidos.municipio || "",
      localidad: bitacora.datos_extendidos.localidad || "",
      fecha_hora_inicio: bitacora.fecha_hora_inicio,
    });
  };

  const handleGuardar = (idBitacora: number) => {
    setBitacorasEditables(
      bitacorasEditables.map((b) =>
        b.id_bitacora === idBitacora
          ? {
              ...b,
              fecha_hora_inicio: editData.fecha_hora_inicio,
              datos_extendidos: {
                ...b.datos_extendidos,
                beneficiario_nombre: editData.beneficiario_nombre,
                municipio: editData.municipio,
                localidad: editData.localidad,
              },
            }
          : b
      )
    );
    setEditando(null);
  };

  const handleCancelar = () => {
    setEditando(null);
    setEditData({});
  };

  const handleGenerarPDF = () => {
    // TODO: Implementar generación de PDF
    console.log("Generar PDF con datos editados:", bitacorasEditables);
    alert("Generando PDF... (funcionalidad por implementar)");
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearFechaCorta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-MX");
  };

  return (
    <div className="space-y-6">
      {/* Acciones Globales */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-display font-semibold text-guinda-900">
              {bitacorasEditables.length} Bitácoras
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Edita los campos permitidos y genera el PDF
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/reportes"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Volver
            </Link>
            <button
              onClick={handleGenerarPDF}
              className="flex items-center gap-2 px-6 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
            >
              <Download className="h-4 w-4" />
              Generar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Vista Previa PDF */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        {/* Header del PDF */}
        <div className="border-b-4 border-guinda-700 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-guinda-900 mb-2">
                Reporte de Bitácoras
              </h1>
              <p className="text-lg text-gray-700">
                Técnico: <span className="font-semibold">{tecnico.nombre_completo}</span>
              </p>
              <p className="text-sm text-gray-600">
                Especialidad: {tecnico.especialidad} • ID: {tecnico.id_usuario}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Fecha de generación:</div>
              <div className="text-lg font-semibold text-guinda-900">
                {formatearFechaCorta(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>

        {/* Bitácoras */}
        <div className="space-y-6">
          {bitacorasEditables.map((bitacora, index) => (
            <div
              key={bitacora.id_bitacora}
              className="border-2 border-gray-300 rounded-lg p-6 relative"
            >
              {/* Número de bitácora */}
              <div className="absolute -top-3 -left-3 bg-guinda-700 text-white h-10 w-10 rounded-full flex items-center justify-center font-display font-bold">
                {index + 1}
              </div>

              {/* Botón de editar */}
              {editando !== bitacora.id_bitacora && (
                <button
                  onClick={() => handleEditar(bitacora)}
                  className="absolute top-4 right-4 p-2 text-guinda-700 hover:bg-guinda-50 rounded-lg transition-colors"
                  title="Editar información"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              )}

              {editando === bitacora.id_bitacora ? (
                /* Modo Edición */
                <div className="space-y-4 pl-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      Editando información básica (el contenido no se puede modificar)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        {bitacora.tipo_bitacora === "BENEFICIARIO" ? "Beneficiario" : "Descripción"}
                      </label>
                      <input
                        type="text"
                        value={editData.beneficiario_nombre}
                        onChange={(e) => setEditData({ ...editData, beneficiario_nombre: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        Fecha
                      </label>
                      <input
                        type="datetime-local"
                        value={editData.fecha_hora_inicio?.slice(0, 16)}
                        onChange={(e) => setEditData({ ...editData, fecha_hora_inicio: e.target.value + ":00Z" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                      />
                    </div>

                    {bitacora.tipo_bitacora === "BENEFICIARIO" && (
                      <>
                        <div>
                          <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                            Municipio
                          </label>
                          <input
                            type="text"
                            value={editData.municipio}
                            onChange={(e) => setEditData({ ...editData, municipio: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                            Localidad
                          </label>
                          <input
                            type="text"
                            value={editData.localidad}
                            onChange={(e) => setEditData({ ...editData, localidad: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleGuardar(bitacora.id_bitacora)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelar}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo Vista */
                <div className="pl-8">
                  {/* Información del header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-display font-bold text-guinda-900">
                          {bitacora.datos_extendidos.beneficiario_nombre || bitacora.datos_extendidos.descripcion}
                        </h3>
                        <span
                          className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            bitacora.tipo_bitacora === "BENEFICIARIO"
                              ? "bg-guinda-100 text-guinda-700 border-guinda-200"
                              : "bg-dorado-100 text-dorado-700 border-dorado-200"
                          }`}
                        >
                          {bitacora.tipo_bitacora === "BENEFICIARIO" ? "Visita a Beneficiario" : "Actividad General"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-4 w-4 mr-2 text-guinda-700" />
                        <div>
                          <div className="font-medium">Fecha</div>
                          <div className="text-xs text-gray-600">{formatearFecha(bitacora.fecha_hora_inicio)}</div>
                        </div>
                      </div>

                      {bitacora.datos_extendidos.municipio && (
                        <div className="flex items-center text-sm text-gray-700">
                          <MapPin className="h-4 w-4 mr-2 text-guinda-700" />
                          <div>
                            <div className="font-medium">{bitacora.datos_extendidos.municipio}</div>
                            <div className="text-xs text-gray-600">{bitacora.datos_extendidos.localidad}</div>
                          </div>
                        </div>
                      )}

                      {bitacora.fecha_hora_fin && (
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="h-4 w-4 mr-2 text-guinda-700" />
                          <div>
                            <div className="font-medium">Duración</div>
                            <div className="text-xs text-gray-600">
                              {Math.round(
                                (new Date(bitacora.fecha_hora_fin).getTime() -
                                  new Date(bitacora.fecha_hora_inicio).getTime()) /
                                  (1000 * 60)
                              )}{" "}
                              min
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contenido de actividades (NO EDITABLE) */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    {bitacora.datos_extendidos.actividades && (
                      <div>
                        <h4 className="text-sm font-display font-semibold text-gray-900 mb-2">Actividades Realizadas:</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {bitacora.datos_extendidos.actividades}
                        </p>
                      </div>
                    )}

                    {bitacora.datos_extendidos.recomendaciones && (
                      <div className="pt-3 border-t border-gray-300">
                        <h4 className="text-sm font-display font-semibold text-gray-900 mb-2">Recomendaciones:</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {bitacora.datos_extendidos.recomendaciones}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Coordenadas */}
                  <div className="mt-3 text-xs text-gray-500 font-mono">
                    Coordenadas: {bitacora.latitud}, {bitacora.longitud}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer del PDF */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>Sistema de Administración y Gestión de Recursos Humanos (SADERH)</p>
          <p className="text-xs mt-1">Gobierno del Estado de Hidalgo</p>
        </div>
      </div>
    </div>
  );
}
