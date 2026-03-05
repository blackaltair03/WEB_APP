"use client";

import { useState } from "react";
import {
  MapPin,
  FileText,
  Upload,
  Bell,
  Mail,
  PlusCircle,
  X,
  Trash2,
  Edit2,
  CheckCircle,
  Settings,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import styles from "./ConfiguracionClient.module.css";

interface Localidad {
  id: number;
  nombre: string;
  municipio: string;
}

interface Plantilla {
  id_plantilla: number;
  nombre: string;
  tipo: string;
  activo: boolean;
}

interface Formato {
  id: number;
  nombre: string;
  extension: string;
  max_size: string;
}

interface Props {
  localidades: Localidad[];
  plantillas: Plantilla[];
  formatos: Formato[];
}

type ModalType = null | "localidad" | "plantilla" | "formato" | "notificacion" | "correo";

export default function ConfiguracionClient({ localidades, plantillas, formatos }: Props) {
  const { error, success, warning } = useToast();
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [seccionActiva, setSeccionActiva] = useState<"localidades" | "plantillas" | "formatos" | "notificaciones">(
    "localidades"
  );

  // Estados formulario localidad
  const [nombreLocalidad, setNombreLocalidad] = useState("");
  const [municipioLocalidad, setMunicipioLocalidad] = useState("");

  // Estados formulario plantilla
  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [tipoPlantilla, setTipoPlantilla] = useState("BITACORA");

  // Estados formulario formato
  const [nombreFormato, setNombreFormato] = useState("");
  const [extensionFormato, setExtensionFormato] = useState("");
  const [maxSizeFormato, setMaxSizeFormato] = useState("");

  // Estados formulario notificación
  const [tituloNotif, setTituloNotif] = useState("");
  const [mensajeNotif, setMensajeNotif] = useState("");
  const [tipoNotif, setTipoNotif] = useState("INFO");
  const [usuariosNotif, setUsuariosNotif] = useState("todos");
  const [enviarPush, setEnviarPush] = useState(true);

  // Estados formulario correo
  const [asuntoCorreo, setAsuntoCorreo] = useState("");
  const [mensajeCorreo, setMensajeCorreo] = useState("");
  const [destinatarios, setDestinatarios] = useState("");
  const [emailPersonalizado, setEmailPersonalizado] = useState("");

  const handleSubmitLocalidad = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreLocalidad || !municipioLocalidad) {
      warning("Campos requeridos", { description: "Completa todos los campos" });
      return;
    }

    fetch("/api/configuracion/localidades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreLocalidad, municipio: municipioLocalidad }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          success("Localidad creada", { description: "La localidad ha sido creada correctamente" });
          setModalOpen(null);
          setNombreLocalidad("");
          setMunicipioLocalidad("");
        } else {
          error(data?.error ?? "No se pudo crear la localidad");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        error("Error de conexión", { description: "No se pudo conectar con el servidor" });
      });
  };

  const handleSubmitPlantilla = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombrePlantilla || !tipoPlantilla) {
      warning("Campos requeridos", { description: "Completa todos los campos" });
      return;
    }

    fetch("/api/configuracion/plantillas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombrePlantilla, tipo: tipoPlantilla }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          success("Plantilla creada", { description: "La plantilla ha sido creada correctamente" });
          setModalOpen(null);
          setNombrePlantilla("");
          setTipoPlantilla("BITACORA");
        } else {
          error(data?.error ?? "No se pudo crear la plantilla");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        error("Error de conexión", { description: "No se pudo conectar con el servidor" });
      });
  };

  const handleSubmitFormato = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreFormato || !extensionFormato || !maxSizeFormato) {
      warning("Campos requeridos", { description: "Completa todos los campos" });
      return;
    }

    fetch("/api/configuracion/formatos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombreFormato, extension: extensionFormato, max_size: maxSizeFormato }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          success("Formato creado", { description: "El formato ha sido creado correctamente" });
          setModalOpen(null);
          setNombreFormato("");
          setExtensionFormato("");
          setMaxSizeFormato("");
        } else {
          error(data?.error ?? "No se pudo crear el formato");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        error("Error de conexión", { description: "No se pudo conectar con el servidor" });
      });
  };

  const handleEnviarNotificacion = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tituloNotif || !mensajeNotif) {
      warning("Campos requeridos", { description: "Completa todos los campos" });
      return;
    }

    fetch("/api/notificaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        titulo: tituloNotif, 
        mensaje: mensajeNotif, 
        tipo: tipoNotif, 
        usuarios: usuariosNotif, 
        push: enviarPush 
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          success("Notificación enviada", { description: `Enviada a ${data.data.count} usuarios` });
          setModalOpen(null);
          setTituloNotif("");
          setMensajeNotif("");
          setTipoNotif("INFO");
          setUsuariosNotif("todos");
          setEnviarPush(true);
        } else {
          error(data?.error ?? "No se pudo enviar la notificación");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        error("Error de conexión", { description: "No se pudo conectar con el servidor" });
      });
  };

  const handleEnviarCorreo = (e: React.FormEvent) => {
    e.preventDefault();
    if (destinatarios === "separado" && !emailPersonalizado) {
      warning("Campo requerido", { description: "Ingresa el email del destinatario" });
      return;
    }

    if (!asuntoCorreo || !mensajeCorreo || !destinatarios) {
      warning("Campos requeridos", { description: "Completa todos los campos" });
      return;
    }

    fetch("/api/correos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        asunto: asuntoCorreo, 
        mensaje: mensajeCorreo, 
        destinatarios, 
        email: emailPersonalizado 
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          success("Correo enviado", { description: `Enviado a ${data.data.count} destinatarios` });
          setModalOpen(null);
          setAsuntoCorreo("");
          setMensajeCorreo("");
          setDestinatarios("");
          setEmailPersonalizado("");
        } else {
          error(data?.error ?? "No se pudo enviar el correo");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        error("Error de conexión", { description: "No se pudo conectar con el servidor" });
      });
  };

  return (
    <div className="space-y-6">
      {/* Navegación de secciones */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSeccionActiva("localidades")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display transition-colors ${
              seccionActiva === "localidades"
                ? "bg-guinda-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Localidades
          </button>
          <button
            onClick={() => setSeccionActiva("plantillas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display transition-colors ${
              seccionActiva === "plantillas"
                ? "bg-guinda-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Plantillas PDF
          </button>
          <button
            onClick={() => setSeccionActiva("formatos")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display transition-colors ${
              seccionActiva === "formatos"
                ? "bg-guinda-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Upload className="h-4 w-4" />
            Formatos de Archivos
          </button>
          <button
            onClick={() => setSeccionActiva("notificaciones")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-display transition-colors ${
              seccionActiva === "notificaciones"
                ? "bg-guinda-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Bell className="h-4 w-4" />
            Notificaciones y Correos
          </button>
        </div>
      </div>

      {/* Sección de Localidades */}
      {seccionActiva === "localidades" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-display font-bold text-guinda-900">Localidades</h3>
              <p className="text-sm text-gray-600 mt-1">Gestiona las localidades del sistema</p>
            </div>
            <button
              onClick={() => setModalOpen("localidad")}
              className="flex items-center gap-2 px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
            >
              <PlusCircle className="h-5 w-5" />
              Nueva Localidad
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localidades.map((loc) => (
              <div
                key={loc.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-guinda-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-guinda-900">{loc.nombre}</h4>
                    <p className="text-sm text-gray-600">{loc.municipio}</p>
                  </div>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de Plantillas PDF */}
      {seccionActiva === "plantillas" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-display font-bold text-guinda-900">Plantillas PDF</h3>
              <p className="text-sm text-gray-600 mt-1">Configura las plantillas para reportes</p>
            </div>
            <button
              onClick={() => setModalOpen("plantilla")}
              className="flex items-center gap-2 px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
            >
              <PlusCircle className="h-5 w-5" />
              Nueva Plantilla
            </button>
          </div>

          <div className="space-y-3">
            {plantillas.map((plantilla) => (
              <div
                key={plantilla.id_plantilla}
                className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:border-guinda-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-guinda-700" />
                  <div>
                    <h4 className="font-semibold text-guinda-900">{plantilla.nombre}</h4>
                    <p className="text-sm text-gray-600">{plantilla.tipo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {plantilla.activo ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      Inactivo
                    </span>
                  )}
                  <button className="text-guinda-700 hover:text-guinda-900">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de Formatos de Archivos */}
      {seccionActiva === "formatos" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-display font-bold text-guinda-900">Formatos de Archivos</h3>
              <p className="text-sm text-gray-600 mt-1">Configuración de archivos permitidos</p>
            </div>
            <button
              onClick={() => setModalOpen("formato")}
              className="flex items-center gap-2 px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
            >
              <PlusCircle className="h-5 w-5" />
              Nuevo Formato
            </button>
          </div>

          <div className="space-y-3">
            {formatos.map((formato) => (
              <div
                key={formato.id}
                className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:border-guinda-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-dorado-600" />
                  <div>
                    <h4 className="font-semibold text-guinda-900">{formato.nombre}</h4>
                    <p className="text-sm text-gray-600">
                      {formato.extension} • Máx: {formato.max_size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-guinda-700 hover:text-guinda-900">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de Notificaciones y Correos */}
      {seccionActiva === "notificaciones" && (
        <div className="space-y-6">
          {/* Enviar Notificación */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-guinda-900">Notificaciones del Sistema</h3>
                <p className="text-sm text-gray-600 mt-1">Envía notificaciones a usuarios de la app</p>
              </div>
              <button
                onClick={() => setModalOpen("notificacion")}
                className="flex items-center gap-2 px-4 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
              >
                <Bell className="h-5 w-5" />
                Enviar Notificación
              </button>
            </div>
            <div className="bg-guinda-50 border border-guinda-200 rounded-lg p-4">
              <p className="text-sm text-guinda-800">
                Las notificaciones aparecerán en la app móvil y web de los usuarios seleccionados.
              </p>
            </div>
          </div>

          {/* Enviar Correo */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-guinda-900">Correos Electrónicos</h3>
                <p className="text-sm text-gray-600 mt-1">Envía correos masivos a usuarios</p>
              </div>
              <button
                onClick={() => setModalOpen("correo")}
                className="flex items-center gap-2 px-4 py-2 bg-dorado-600 text-white rounded-lg hover:bg-dorado-700 transition-colors font-display"
              >
                <Mail className="h-5 w-5" />
                Enviar Correo
              </button>
            </div>
            <div className="bg-dorado-50 border border-dorado-200 rounded-lg p-4">
              <p className="text-sm text-dorado-800">
                Los correos se enviarán a las direcciones registradas en el sistema.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Localidad */}
      {modalOpen === "localidad" && (
        <div className={`${styles.modalOverlay} animate-fadeIn`}>
          <div className={`${styles.modalPanel} ${styles.modalSm} transform transition-all animate-slideUp`}>
            <div className={`bg-gradient-to-r from-guinda-700 to-guinda-800 rounded-t-xl ${styles.modalHeader}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-white">Nueva Localidad</h2>
                </div>
                <button onClick={() => setModalOpen(null)} className="text-white/80 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleSubmitLocalidad} className="space-y-5">
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Nombre de la Localidad *
                  </label>
                  <input
                    type="text"
                    value={nombreLocalidad}
                    onChange={(e) => setNombreLocalidad(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    placeholder="Ej: Centro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Municipio *
                  </label>
                  <input
                    type="text"
                    value={municipioLocalidad}
                    onChange={(e) => setMunicipioLocalidad(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    placeholder="Ej: Pachuca"
                  />
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-display font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-guinda-700 to-guinda-800 text-white rounded-lg hover:from-guinda-800 hover:to-guinda-900 transition-all font-display font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Crear Localidad
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Plantilla */}
      {modalOpen === "plantilla" && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalPanel} ${styles.modalSm} transform transition-all`}>
            <div className={`bg-gradient-to-r from-guinda-700 to-guinda-800 rounded-t-2xl ${styles.modalHeader}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-white">Nueva Plantilla PDF</h2>
                </div>
                <button 
                  onClick={() => setModalOpen(null)} 
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleSubmitPlantilla} className="space-y-5">
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Nombre de la Plantilla *
                  </label>
                  <input
                    type="text"
                    value={nombrePlantilla}
                    onChange={(e) => setNombrePlantilla(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    placeholder="Ej: Reporte Trimestral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={tipoPlantilla}
                    onChange={(e) => setTipoPlantilla(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                  >
                    <option value="BITACORA">📋 Bitácora</option>
                    <option value="REPORTE">📊 Reporte</option>
                    <option value="CERTIFICADO">🎓 Certificado</option>
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-display font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-guinda-700 to-guinda-800 text-white rounded-lg hover:from-guinda-800 hover:to-guinda-900 transition-all font-display font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Crear Plantilla
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Formato */}
      {modalOpen === "formato" && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalPanel} ${styles.modalSm} transform transition-all`}>
            <div className={`bg-gradient-to-r from-guinda-700 to-guinda-800 rounded-t-2xl ${styles.modalHeader}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-white">Nuevo Formato de Archivo</h2>
                </div>
                <button 
                  onClick={() => setModalOpen(null)} 
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleSubmitFormato} className="space-y-5">
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Nombre del Formato *
                  </label>
                  <input
                    type="text"
                    value={nombreFormato}
                    onChange={(e) => setNombreFormato(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    placeholder="Ej: Documento Legal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Extensiones Permitidas *
                  </label>
                  <input
                    type="text"
                    value={extensionFormato}
                    onChange={(e) => setExtensionFormato(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    placeholder="Ej: .pdf, .doc, .docx"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separa múltiples extensiones con comas</p>
                </div>
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Tamaño Máximo *
                  </label>
                  <input
                    type="text"
                    value={maxSizeFormato}
                    onChange={(e) => setMaxSizeFormato(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    placeholder="Ej: 5MB"
                  />
                  <p className="text-xs text-gray-500 mt-1">Especifica el tamaño en MB o GB</p>
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-display font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-guinda-700 to-guinda-800 text-white rounded-lg hover:from-guinda-800 hover:to-guinda-900 transition-all font-display font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Crear Formato
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar Notificación */}
      {modalOpen === "notificacion" && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalPanel} ${styles.modalLg} transform transition-all`}>
            {/* Header con gradiente */}
            <div className={`bg-gradient-to-r from-guinda-700 to-guinda-800 rounded-t-2xl ${styles.modalHeader}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">Enviar Notificación</h2>
                </div>
                <button 
                  onClick={() => setModalOpen(null)} 
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body del modal */}
            <div className={styles.modalBody}>
              <form onSubmit={handleEnviarNotificacion} className="space-y-5">
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={tituloNotif}
                    onChange={(e) => setTituloNotif(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    placeholder="Ej: Actualización del sistema"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    value={mensajeNotif}
                    onChange={(e) => setMensajeNotif(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all resize-none"
                    placeholder="Escribe el contenido de la notificación..."
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      value={tipoNotif}
                      onChange={(e) => setTipoNotif(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    >
                      <option value="INFO">📋 Información</option>
                      <option value="ALERTA">⚠️ Alerta</option>
                      <option value="TAREA">✅ Tarea</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                      Destinatarios *
                    </label>
                    <select
                      value={usuariosNotif}
                      onChange={(e) => setUsuariosNotif(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-guinda-500 focus:border-guinda-500 transition-all"
                    >
                      <option value="todos">👥 Todos los usuarios</option>
                      <option value="tecnicos">🔧 Solo técnicos</option>
                      <option value="coordinadores">👔 Solo coordinadores</option>
                      <option value="admins">⚙️ Solo administradores</option>
                    </select>
                  </div>
                </div>

                {/* Checkbox para push notification */}
                <div className="bg-gradient-to-r from-guinda-50 to-dorado-50 border-2 border-guinda-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={enviarPush}
                        onChange={(e) => setEnviarPush(e.target.checked)}
                        className="w-5 h-5 text-guinda-700 border-2 border-gray-300 rounded focus:ring-2 focus:ring-guinda-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display font-semibold text-guinda-900">
                          Enviar notificación push a la app móvil
                        </span>
                        <span className="px-2 py-0.5 bg-guinda-700 text-white text-xs font-semibold rounded-full">
                          NUEVO
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Los usuarios recibirán una alerta en su dispositivo móvil además del registro en el sistema
                      </p>
                    </div>
                  </label>
                </div>

                {/* Botones de acción */}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-display font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-guinda-700 to-guinda-800 text-white rounded-lg hover:from-guinda-800 hover:to-guinda-900 transition-all font-display font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Enviar Notificación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar Correo */}
      {modalOpen === "correo" && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalPanel} ${styles.modalLg} transform transition-all`}>
            {/* Header con gradiente */}
            <div className={`bg-gradient-to-r from-dorado-600 to-dorado-700 rounded-t-2xl ${styles.modalHeader}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">Enviar Correo Electrónico</h2>
                </div>
                <button 
                  onClick={() => setModalOpen(null)} 
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body del modal */}
            <div className={styles.modalBody}>
              <form onSubmit={handleEnviarCorreo} className="space-y-5">
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={asuntoCorreo}
                    onChange={(e) => setAsuntoCorreo(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-dorado-500 focus:border-dorado-500 transition-all"
                    placeholder="Ej: Reporte mensual de actividades"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    value={mensajeCorreo}
                    onChange={(e) => setMensajeCorreo(e.target.value)}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-dorado-500 focus:border-dorado-500 transition-all resize-none"
                    placeholder="Escribe el contenido del correo (se enviará en formato HTML)..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Puedes usar HTML básico para dar formato al mensaje</p>
                </div>
                
                <div>
                  <label className="block text-sm font-display font-semibold text-gray-700 mb-2">
                    Destinatarios *
                  </label>
                  <select
                    value={destinatarios}
                    onChange={(e) => {
                      setDestinatarios(e.target.value);
                      if (e.target.value !== "separado") {
                        setEmailPersonalizado("");
                      }
                    }}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-dorado-500 focus:border-dorado-500 transition-all"
                  >
                    <option value="">Seleccionar destinatarios</option>
                    <option value="todos">👥 Todos los usuarios activos</option>
                    <option value="tecnicos">🔧 Solo técnicos</option>
                    <option value="coordinadores">👔 Solo coordinadores</option>
                    <option value="admins">⚙️ Solo administradores</option>
                    <option value="separado">✉️ Usuario específico (email personalizado)</option>
                  </select>
                </div>

                {/* Campo de email personalizado (aparece solo cuando se selecciona "separado") */}
                {destinatarios === "separado" && (
                  <div className="bg-gradient-to-r from-dorado-50 to-amber-50 border-2 border-dorado-300 rounded-xl p-4 animate-fadeIn">
                    <label className="block text-sm font-display font-semibold text-dorado-900 mb-2">
                      Correo electrónico del destinatario *
                    </label>
                    <input
                      type="email"
                      value={emailPersonalizado}
                      onChange={(e) => setEmailPersonalizado(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-dorado-300 rounded-lg focus:ring-2 focus:ring-dorado-500 focus:border-dorado-500 transition-all bg-white"
                      placeholder="usuario@ejemplo.com"
                    />
                    <p className="text-xs text-dorado-700 mt-2 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      El correo se enviará únicamente a esta dirección de email
                    </p>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-dorado-50 to-amber-50 border-2 border-dorado-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-dorado-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dorado-900 mb-1">Nota importante:</p>
                      <p className="text-sm text-dorado-800">
                        El correo se enviará desde la cuenta oficial del sistema. Asegúrate de revisar el contenido antes de enviar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all font-display font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-dorado-600 to-dorado-700 text-white rounded-lg hover:from-dorado-700 hover:to-dorado-800 transition-all font-display font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Enviar Correo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
