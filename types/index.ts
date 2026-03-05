export type UserRole = "SUPER_ADMIN" | "COORDINADOR" | "TECNICO";
export type Especialidad = "AGRICOLA" | "AGROPECUARIO" | "ACTIVIDAD_GENERAL";
export type CadenaProductiva = "AGRICOLA" | "AGROPECUARIO";
export type OrigenRegistro = "WEB" | "MOVIL";
export type EstatusSync = "LOCAL" | "RECIBIDO" | "SINCRONIZADO";
export type TipoAsignacion = "BENEFICIARIO" | "ACTIVIDAD";
export type TipoBitacora = "BENEFICIARIO" | "ACTIVIDAD_GENERAL";
export type TipoNotificacion = "ALERTA" | "INFO" | "TAREA";
export type TipoArchivoEvidencia = "FOTO" | "VIDEO" | "DOCUMENTO";

export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  rol: UserRole;
  especialidad?: Especialidad;
  id_zona?: number;
  activo: boolean;
  puede_registrar_beneficiarios: boolean;
  bloqueado_revision: boolean;
  fecha_creacion: string;
  zona?: Zona;
}

export interface Zona {
  id_zona: number;
  nombre: string;
}

export interface Beneficiario {
  id_beneficiario: number;
  folio_saderh?: string;
  curp?: string;
  nombre_completo: string;
  municipio: string;
  localidad: string;
  cadena_productiva?: CadenaProductiva;
  telefono_contacto?: string;
  latitud_predio?: string;
  longitud_predio?: string;
  id_usuario_registro?: number;
  origen_registro: OrigenRegistro;
  estatus_sync: EstatusSync;
  documentos: Record<string, unknown>;
  fecha_registro: string;
  registradoPor?: Pick<Usuario, "id_usuario" | "nombre_completo">;
}

export interface Asignacion {
  id_asignacion: number;
  id_tecnico: number;
  id_beneficiario?: number;
  tipo_asignacion: TipoAsignacion;
  descripcion_actividad?: string;
  fecha_limite: string;
  completado: boolean;
  fecha_completado?: string;
  fecha_creacion: string;
  tecnico?: Pick<Usuario, "id_usuario" | "nombre_completo" | "especialidad">;
  beneficiario?: Pick<Beneficiario, "id_beneficiario" | "nombre_completo" | "municipio">;
}

export interface Bitacora {
  id_bitacora: number;
  uuid_movil: string;
  id_usuario: number;
  id_asignacion?: number;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  latitud: string;
  longitud: string;
  precision_gps?: string;
  latitud_fin?: string;
  longitud_fin?: string;
  tipo_bitacora: TipoBitacora;
  id_periodo?: number;
  datos_extendidos: Record<string, unknown>;
  estatus_sincronizacion: EstatusSync;
  dispositivo_info: Record<string, unknown>;
  fecha_registro_servidor: string;
  usuario?: Pick<Usuario, "id_usuario" | "nombre_completo" | "especialidad">;
  evidencias?: Evidencia[];
}

export interface Evidencia {
  id_evidencia: number;
  id_bitacora: number;
  url_archivo: string;
  tipo_archivo?: TipoArchivoEvidencia;
  descripcion?: string;
  fecha_subida: string;
}

export interface Notificacion {
  id_notificacion: number;
  id_usuario?: number;
  titulo: string;
  mensaje: string;
  tipo?: TipoNotificacion;
  leida: boolean;
  fecha_creacion: string;
  fecha_lectura?: string;
}

export interface PeriodoCierre {
  id_periodo: number;
  anio: number;
  mes: number;
  cerrado: boolean;
  fecha_cierre?: string;
  notas?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalTecnicos: number;
  tecnicosActivos: number;
  totalBeneficiarios: number;
  beneficiariosEstesMes: number;
  totalBitacoras: number;
  bitacorasHoy: number;
  asignacionesPendientes: number;
  porcentajeCumplimiento: number;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
