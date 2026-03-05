"use client";

import { useState } from "react";
import { PlusCircle, Mail, Shield, CheckCircle, XCircle, MapPin, X } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import styles from "./UsuariosClient.module.css";

interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  rol: string;
  especialidad: string | null;
  activo: boolean;
  fecha_creacion: string;
  zona: { id_zona: number; nombre: string } | null;
}

interface Props {
  usuarios: Usuario[];
  total: number;
  currentPage: number;
  limit: number;
}

export default function UsuariosClient({ usuarios, total, currentPage, limit }: Props) {
  const { error, success } = useToast();
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("TODOS");
  const [modalOpen, setModalOpen] = useState(false);

  // Estados del formulario
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("TECNICO");
  const [especialidad, setEspecialidad] = useState("");
  const [idZona, setIdZona] = useState("");
  const [puedeRegistrarBeneficiarios, setPuedeRegistrarBeneficiarios] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (rolFilter !== "TODOS") params.set("rol", rolFilter);
    window.location.href = `/admin/usuarios?${params.toString()}`;
  };

  // Activar/Desactivar usuario
  const toggleUsuario = async (id: number, actualActivo: boolean) => {
    const accion = actualActivo ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de ${accion} este usuario?`)) return;

    try {
      const response = await fetch(`/api/usuarios/${id}/toggle`, {
        method: "POST",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        error(err?.message ?? `No se pudo ${accion} el usuario`);
        return;
      }

      success(
        actualActivo ? "Usuario desactivado" : "Usuario activado",
        { description: `El usuario ha sido ${actualActivo ? "desactivado" : "activado"} correctamente` }
      );
      window.location.reload();
    } catch {
      error("Error de red", { description: "No se pudo conectar con el servidor" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre_completo: nombreCompleto,
      email,
      password,
      rol,
      especialidad: especialidad || undefined,
      id_zona: idZona ? parseInt(idZona, 10) : undefined,
      puede_registrar_beneficiarios: puedeRegistrarBeneficiarios,
    };

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        error(err?.message ?? "No se pudo crear el usuario");
        return;
      }

      success("Usuario creado", { description: "El usuario ha sido dado de alta correctamente" });
      setModalOpen(false);
      setNombreCompleto("");
      setEmail("");
      setPassword("");
      setRol("TECNICO");
      setEspecialidad("");
      setIdZona("");
      setPuedeRegistrarBeneficiarios(false);
      window.location.reload();
    } catch {
      error("Error de red", { description: "No se pudo conectar con el servidor" });
    }
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "COORDINADOR":
        return "bg-guinda-100 text-guinda-700 border-guinda-200";
      case "TECNICO":
        return "bg-dorado-100 text-dorado-700 border-dorado-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "COORDINADOR":
        return "Coordinador";
      case "TECNICO":
        return "Técnico";
      default:
        return rol;
    }
  };

  return (
    <>
      {/* Filtros y Búsqueda */}
      <div className={styles.filtersCard}>
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700 transition-colors"
            />
            <select
              value={rolFilter}
              onChange={(e) => setRolFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700 transition-colors"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="COORDINADOR">Coordinador</option>
              <option value="TECNICO">Técnico</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
            >
              Buscar
            </button>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display whitespace-nowrap"
          >
            <PlusCircle className="h-5 w-5" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className={styles.tableCard}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-guinda-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-display font-semibold text-guinda-900 uppercase tracking-wider">
                  Especialidad / Zona
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
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario} className="hover:bg-guinda-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-guinda-900">{usuario.nombre_completo}</div>
                      <div className="text-xs text-gray-500">
                        ID: {usuario.id_usuario}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Mail className="h-4 w-4 mr-1.5 text-gray-400" />
                        {usuario.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getRolBadge(
                          usuario.rol
                        )}`}
                      >
                        <Shield className="h-3.5 w-3.5 mr-1" />
                        {getRolLabel(usuario.rol)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {usuario.especialidad && (
                        <div className="text-sm text-gray-700">{usuario.especialidad}</div>
                      )}
                      {usuario.zona && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {usuario.zona.nombre}
                        </div>
                      )}
                      {!usuario.especialidad && !usuario.zona && (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {usuario.activo ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button 
                        onClick={() => {
                          // TODO: Implementar edición
                          alert("Función de edición en desarrollo");
                        }}
                        className="text-guinda-700 hover:text-guinda-900 hover:underline"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => toggleUsuario(usuario.id_usuario, usuario.activo)}
                        className="text-red-600 hover:text-red-800 hover:underline"
                      >
                        {usuario.activo ? "Desactivar" : "Activar"}
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
              usuarios
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

      {/* Modal de Crear Usuario */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalPanel}>
            <div className={styles.modalBody}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-guinda-900">Dar de Alta Usuario</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Personal */}
                <div className="bg-guinda-50 border border-guinda-100 rounded-lg p-4">
                  <h3 className="text-lg font-display font-semibold text-guinda-900 mb-3">
                    Información Personal
                  </h3>
                  <div className="space-y-4">
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
                        placeholder="Ej: Juan Pérez García"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                        placeholder="Ej: usuario@hidalgo.gob.mx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                  </div>
                </div>

                {/* Información del Sistema */}
                <div className="bg-dorado-50 border border-dorado-100 rounded-lg p-4">
                  <h3 className="text-lg font-display font-semibold text-guinda-900 mb-3">
                    Información del Sistema
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        Rol *
                      </label>
                      <select
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                      >
                        <option value="TECNICO">Técnico</option>
                        <option value="COORDINADOR">Coordinador</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </div>

                    {(rol === "TECNICO" || rol === "COORDINADOR") && (
                      <div>
                        <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                          Especialidad
                        </label>
                        <select
                          value={especialidad}
                          onChange={(e) => setEspecialidad(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                        >
                          <option value="">Sin especialidad</option>
                          <option value="AGRICOLA">Agrícola</option>
                          <option value="AGROPECUARIO">Agropecuario</option>
                          <option value="ACTIVIDAD_GENERAL">Actividad General</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-display font-medium text-guinda-900 mb-2">
                        Zona
                      </label>
                      <select
                        value={idZona}
                        onChange={(e) => setIdZona(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-guinda-700 focus:border-guinda-700"
                      >
                        <option value="">Sin zona asignada</option>
                        <option value="1">Zona Norte</option>
                        <option value="2">Zona Sur</option>
                        <option value="3">Zona Centro</option>
                        <option value="4">Zona Este</option>
                        <option value="5">Zona Oeste</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Permisos */}
                {rol === "TECNICO" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-display font-semibold text-guinda-900 mb-3">
                      Permisos Especiales
                    </h3>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={puedeRegistrarBeneficiarios}
                        onChange={(e) => setPuedeRegistrarBeneficiarios(e.target.checked)}
                        className="rounded border-gray-300 text-guinda-700 focus:ring-guinda-700 h-5 w-5"
                      />
                      <span className="text-sm text-gray-700">
                        Puede registrar nuevos beneficiarios
                      </span>
                    </label>
                  </div>
                )}

                {/* Botones */}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-display"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-guinda-700 text-white rounded-lg hover:bg-guinda-800 transition-colors font-display"
                  >
                    Crear Usuario
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
