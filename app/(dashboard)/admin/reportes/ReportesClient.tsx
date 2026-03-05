"use client";

import { FileText, Download, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/hooks/use-toast";

interface Tecnico {
  id_usuario: number;
  nombre_completo: string;
  especialidad: string;
}

interface Props {
  tecnicos: Tecnico[];
}

export default function ReportesClient({ tecnicos }: Props) {
  const { info } = useToast();

  const handleDescargarTodas = (idUsuario: number, nombreTecnico: string) => {
    // TODO: Implementar descarga de todas las bitácoras
    console.log(`Descargar todas las bitácoras del técnico ${idUsuario}`);
    info(`Descargando bitácoras de ${nombreTecnico}...`, { duration: 3000 });
  };

  return (
    <div className="space-y-6">
      {/* Filtros y Opciones */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-display font-semibold text-guinda-900 mb-4">
          Seleccionar Técnico
        </h3>
        <p className="text-sm text-gray-600">
          Selecciona un técnico para ver sus bitácoras o descargar todas en formato PDF.
        </p>
      </div>

      {/* Tarjetas de Técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tecnicos.map((tecnico) => (
          <div
            key={tecnico.id_usuario}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Header con especialidad */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-display font-semibold text-guinda-900 mb-1">
                    {tecnico.nombre_completo}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      tecnico.especialidad === "AGRICOLA"
                        ? "bg-guinda-100 text-guinda-700 border-guinda-200"
                        : "bg-dorado-100 text-dorado-700 border-dorado-200"
                    }`}
                  >
                    {tecnico.especialidad}
                  </span>
                </div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-guinda-100">
                  <FileText className="h-6 w-6 text-guinda-700" />
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Acciones */}
              <div className="space-y-2">
                <Link
                  href={`/admin/reportes/${tecnico.id_usuario}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
                >
                  <Eye className="h-4 w-4" />
                  Ver Bitácoras
                </Link>
                <button
                  onClick={() => handleDescargarTodas(tecnico.id_usuario, tecnico.nombre_completo)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-dorado-600 text-dorado-700 rounded-lg hover:bg-dorado-50 transition-colors font-display"
                >
                  <Download className="h-4 w-4" />
                  Descargar Todas
                </button>
              </div>

              {/* Info adicional */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  ID: {tecnico.id_usuario}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-guinda-50 border border-guinda-200 rounded-lg p-4">
        <h4 className="text-sm font-display font-semibold text-guinda-900 mb-2">
          Información sobre los reportes
        </h4>
        <ul className="text-sm text-guinda-800 space-y-1">
          <li>• Al ver las bitácoras, podrás editarlas antes de generar el PDF</li>
          <li>• Solo podrás editar: nombre, beneficiario, fecha, localidad</li>
          <li>• El contenido de las actividades no se puede modificar</li>
          <li>• Los PDFs incluyen todas las evidencias fotográficas</li>
        </ul>
      </div>
    </div>
  );
}
