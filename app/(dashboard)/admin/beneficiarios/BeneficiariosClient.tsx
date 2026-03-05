"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import DataTable from "@/components/tables/DataTable";
import { formatDate, getCadenaLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Smartphone, Globe, ChevronLeft, ChevronRight, PlusCircle, X, User, MapPin, FileText, Phone } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { MUNICIPIOS_HIDALGO } from "@/lib/utils";
import styles from "./BeneficiariosClient.module.css";

interface Beneficiario {
  id_beneficiario: number;
  folio_saderh: string | null;
  nombre_completo: string;
  municipio: string;
  localidad: string;
  cadena_productiva: string | null;
  origen_registro: string;
  estatus_sync: string;
  fecha_registro: string;
  tecnico_nombre: string | null;
}

interface Props {
  initialData: Beneficiario[];
  total: number;
  page: number;
  limit: number;
  search: string;
  municipio: string;
  cadena: string;
}

export default function BeneficiariosClient({
  initialData, total, page, limit, search, municipio, cadena,
}: Props) {
  const { error, success } = useToast();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  // Estados del formulario - Sección 1: Datos Personales
  const [curp, setCurp] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");

  // Sección 2: Ubicación
  const [municipioForm, setMunicipioForm] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [latitudPredio, setLatitudPredio] = useState("");
  const [longitudPredio, setLongitudPredio] = useState("");

  // Sección 3: Información Productiva
  const [cadenaProductiva, setCadenaProductiva] = useState("");
  const [folioSaderh, setFolioSaderh] = useState("");

  const updateQuery = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams({ search, municipio, cadena, page: String(page) });
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v); else sp.delete(k);
    });
    if (!params.page) sp.set("page", "1");
    router.push(`?${sp.toString()}`);
  }, [router, search, municipio, cadena, page]);

  const totalPages = Math.ceil(total / limit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/beneficiarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curp: curp || undefined,
          nombre_completo: nombreCompleto,
          telefono_contacto: telefonoContacto || undefined,
          municipio: municipioForm,
          localidad,
          latitud_predio: latitudPredio || undefined,
          longitud_predio: longitudPredio || undefined,
          cadena_productiva: (cadenaProductiva as "AGRICOLA" | "AGROPECUARIO") || undefined,
          folio_saderh: folioSaderh || undefined,
          origen_registro: "WEB",
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        error(err?.message ?? "No se pudo registrar el beneficiario");
        return;
      }

      success("Beneficiario registrado", { description: "El beneficiario ha sido registrado correctamente" });
      setModalOpen(false);
      setCurp("");
      setNombreCompleto("");
      setTelefonoContacto("");
      setMunicipioForm("");
      setLocalidad("");
      setLatitudPredio("");
      setLongitudPredio("");
      setCadenaProductiva("");
      setFolioSaderh("");
      setCurrentSection(1);
      window.location.reload();
    } catch {
      error("Error de red", { description: "No se pudo conectar con el servidor" });
    }
  };

  const nextSection = () => {
    if (currentSection < 3) setCurrentSection(currentSection + 1);
  };

  const prevSection = () => {
    if (currentSection > 1) setCurrentSection(currentSection - 1);
  };

  const columns = [
    {
      key: "folio_saderh" as keyof Beneficiario,
      label: "Folio",
      sortable: true,
      render: (v: unknown) => (
        <span className="font-mono text-xs text-muted-foreground">{String(v ?? "Sin folio")}</span>
      ),
    },
    {
      key: "nombre_completo" as keyof Beneficiario,
      label: "Nombre",
      sortable: true,
      render: (v: unknown) => (
        <span className="font-medium text-guinda-900">{String(v)}</span>
      ),
    },
    {
      key: "municipio" as keyof Beneficiario,
      label: "Municipio",
      sortable: true,
    },
    {
      key: "cadena_productiva" as keyof Beneficiario,
      label: "Cadena",
      render: (v: unknown) => {
        const cadena = String(v ?? "");
        const colors =
          cadena === "AGRICOLA" ? "bg-guinda-100 text-guinda-700 border-guinda-200" :
          cadena === "AGROPECUARIO" ? "bg-dorado-100 text-dorado-700 border-dorado-200" :
          "bg-gray-100 text-gray-700 border-gray-200";
        return (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full border",
            colors
          )}>
            {getCadenaLabel(cadena)}
          </span>
        );
      },
    },
    {
      key: "origen_registro" as keyof Beneficiario,
      label: "Origen",
      render: (v: unknown) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {v === "MOVIL"
            ? <><Smartphone className="w-3 h-3" /> Móvil</>
            : <><Globe className="w-3 h-3" /> Web</>}
        </div>
      ),
    },
    {
      key: "tecnico_nombre" as keyof Beneficiario,
      label: "Registrado por",
      render: (v: unknown) => (
        <span className="text-sm text-gray-600">{String(v ?? "—")}</span>
      ),
    },
    {
      key: "fecha_registro" as keyof Beneficiario,
      label: "Fecha",
      sortable: true,
      render: (v: unknown) => (
        <span className="text-xs text-muted-foreground">{formatDate(String(v))}</span>
      ),
    },
    {
      key: "id_beneficiario" as keyof Beneficiario,
      label: "Acciones",
      render: (_: unknown, row: Beneficiario) => (
        <div className="flex items-center gap-2">
          <a
            href={`/admin/beneficiarios/${row.id_beneficiario}`}
            className="text-xs px-2 py-1 rounded-lg border border-guinda-700 text-guinda-700 hover:bg-guinda-50 font-medium transition-colors"
          >
            Ver detalles
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.root}>
      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display whitespace-nowrap"
          >
            <PlusCircle className="h-5 w-5" />
            Nuevo Beneficiario
          </button>
          <input
            type="text"
            placeholder="Buscar nombre, folio, CURP..."
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateQuery({ search: (e.target as HTMLInputElement).value });
            }}
            className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-guinda-700 focus:ring-2 focus:ring-guinda-700/10 transition-colors"
          />
          <select
            value={municipio}
            onChange={(e) => updateQuery({ municipio: e.target.value })}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-guinda-700 focus:ring-2 focus:ring-guinda-700/10 transition-colors"
          >
            <option value="">Todos los municipios</option>
            {MUNICIPIOS_HIDALGO.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={cadena}
            onChange={(e) => updateQuery({ cadena: e.target.value })}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-guinda-700 focus:ring-2 focus:ring-guinda-700/10 transition-colors"
          >
            <option value="">Todas las cadenas</option>
            <option value="AGRICOLA">Agrícola</option>
            <option value="AGROPECUARIO">Agropecuario</option>
          </select>
          {(search || municipio || cadena) && (
            <button
              onClick={() => updateQuery({ search: "", municipio: "", cadena: "" })}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors whitespace-nowrap"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={initialData as any}
        searchable={false}
        rowKey="id_beneficiario"
        pageSize={limit}
      />

      {/* Server-side pagination */}
      {totalPages > 1 && (
        <div className={styles.paginationCard}>
          <span className={styles.paginationInfo}>
            Página {page} de {totalPages} • {total.toLocaleString("es-MX")} total
          </span>
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
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de Crear Beneficiario */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalPanel}>
            <div className={styles.modalBody}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-guinda-900">
                    Registrar Nuevo Beneficiario
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Sección {currentSection} de 3
                  </p>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Indicador de progreso */}
              <div className="flex items-center justify-center mb-6 gap-2">
                {[1, 2, 3].map((section) => (
                  <div
                    key={section}
                    className={cn(
                      "flex items-center",
                      section < 3 && "flex-1"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-display font-semibold transition-colors",
                        currentSection === section
                          ? "bg-guinda-700 text-white"
                          : currentSection > section
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      )}
                    >
                      {section}
                    </div>
                    {section < 3 && (
                      <div
                        className={cn(
                          "flex-1 h-1 mx-2 rounded",
                          currentSection > section ? "bg-green-600" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección 1: Datos Personales */}
                {currentSection === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-guinda-200">
                      <User className="h-5 w-5 text-guinda-700" />
                      <h3 className="text-lg font-display font-semibold text-guinda-900">
                        Datos Personales
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        CURP *
                      </label>
                      <input
                        type="text"
                        value={curp}
                        onChange={(e) => setCurp(e.target.value.toUpperCase())}
                        required
                        maxLength={18}
                        pattern="[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700 uppercase font-mono"
                        placeholder="CURP de 18 caracteres"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={nombreCompleto}
                        onChange={(e) => setNombreCompleto(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                        placeholder="Nombre completo del beneficiario"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Teléfono de Contacto
                      </label>
                      <input
                        type="tel"
                        value={telefonoContacto}
                        onChange={(e) => setTelefonoContacto(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                        placeholder="10 dígitos"
                        maxLength={10}
                      />
                    </div>
                  </div>
                )}

                {/* Sección 2: Ubicación */}
                {currentSection === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-guinda-200">
                      <MapPin className="h-5 w-5 text-guinda-700" />
                      <h3 className="text-lg font-display font-semibold text-guinda-900">
                        Ubicación
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                          Municipio *
                        </label>
                        <select
                          value={municipioForm}
                          onChange={(e) => setMunicipioForm(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                        >
                          <option value="">Seleccionar municipio</option>
                          {MUNICIPIOS_HIDALGO.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                          Localidad *
                        </label>
                        <input
                          type="text"
                          value={localidad}
                          onChange={(e) => setLocalidad(e.target.value)}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                          placeholder="Nombre de la localidad"
                        />
                      </div>
                    </div>

                    <div className="bg-dorado-50 border border-dorado-200 rounded-lg p-4">
                      <p className="text-sm font-display font-medium text-dorado-900 mb-3">
                        Coordenadas del Predio (opcional)
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Latitud
                          </label>
                          <input
                            type="text"
                            value={latitudPredio}
                            onChange={(e) => setLatitudPredio(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                            placeholder="Ej: 20.123456"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Longitud
                          </label>
                          <input
                            type="text"
                            value={longitudPredio}
                            onChange={(e) => setLongitudPredio(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                            placeholder="Ej: -98.234567"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sección 3: Información Productiva */}
                {currentSection === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-guinda-200">
                      <FileText className="h-5 w-5 text-guinda-700" />
                      <h3 className="text-lg font-display font-semibold text-guinda-900">
                        Información Productiva
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        Cadena Productiva
                      </label>
                      <select
                        value={cadenaProductiva}
                        onChange={(e) => setCadenaProductiva(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                      >
                        <option value="">Seleccionar cadena</option>
                        <option value="AGRICOLA">Agrícola</option>
                        <option value="AGROPECUARIO">Agropecuario</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        Folio SADERH (opcional)
                      </label>
                      <input
                        type="text"
                        value={folioSaderh}
                        onChange={(e) => setFolioSaderh(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700 font-mono"
                        placeholder="Folio del sistema SADERH"
                      />
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Listo para registrar:</strong> Revisa que todos los datos sean correctos antes de guardar.
                      </p>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className={styles.modalActions}>
                  {currentSection > 1 && (
                    <button
                      type="button"
                      onClick={prevSection}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-display"
                    >
                      Anterior
                    </button>
                  )}
                  {currentSection === 1 && (
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-display"
                    >
                      Cancelar
                    </button>
                  )}
                  {currentSection < 3 ? (
                    <button
                      type="button"
                      onClick={nextSection}
                      className="flex-1 px-4 py-3 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-display"
                    >
                      Registrar Beneficiario
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
