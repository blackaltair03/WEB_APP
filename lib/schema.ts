import {
  pgTable, serial, varchar, boolean, timestamp, integer,
  decimal, text, jsonb, uuid, date, index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ZONAS ───────────────────────────────────────────────────────────────────
export const zonas = pgTable("zonas", {
  id_zona: serial("id_zona").primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull().unique(),
});

// ─── USUARIOS ────────────────────────────────────────────────────────────────
export const usuarios = pgTable("usuarios", {
  id_usuario: serial("id_usuario").primaryKey(),
  nombre_completo: varchar("nombre_completo", { length: 150 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  codigo_acceso: varchar("codigo_acceso", { length: 20 }).notNull(),
  password_hash: varchar("codigo_acceso_hash", { length: 255 }).notNull(),
  rol: varchar("rol", { length: 20 }).notNull().default("TECNICO"),
  especialidad: varchar("especialidad", { length: 30 }),
  id_zona: integer("id_zona").references(() => zonas.id_zona),
  activo: boolean("activo").notNull().default(true),
  puede_registrar_beneficiarios: boolean("puede_registrar_beneficiarios").notNull().default(false),
  bloqueado_revision: boolean("bloqueado_revision").notNull().default(false),
  fecha_creacion: timestamp("fecha_creacion").notNull().defaultNow(),
}, (t) => ({
  emailIdx: uniqueIndex("usuarios_email_idx").on(t.email),
  rolIdx: index("usuarios_rol_idx").on(t.rol),
  activoIdx: index("usuarios_activo_idx").on(t.activo),
  rolActivoIdx: index("usuarios_rol_activo_idx").on(t.rol, t.activo),
}));

// ─── BENEFICIARIOS ───────────────────────────────────────────────────────────
export const beneficiarios = pgTable("beneficiarios", {
  id_beneficiario: serial("id_beneficiario").primaryKey(),
  folio_saderh: varchar("folio_saderh", { length: 50 }).unique(),
  curp: varchar("curp", { length: 18 }).unique(),
  nombre_completo: varchar("nombre_completo", { length: 150 }).notNull(),
  municipio: varchar("municipio", { length: 100 }).notNull(),
  localidad: varchar("localidad", { length: 100 }).notNull(),
  cadena_productiva: varchar("cadena_productiva", { length: 30 }),
  telefono_contacto: varchar("telefono_contacto", { length: 20 }),
  latitud_predio: decimal("latitud_predio", { precision: 10, scale: 8 }),
  longitud_predio: decimal("longitud_predio", { precision: 11, scale: 8 }),
  id_usuario_registro: integer("id_usuario_registro").references(() => usuarios.id_usuario),
  origen_registro: varchar("origen_registro", { length: 20 }).notNull().default("WEB"),
  uuid_movil_registro: uuid("uuid_movil_registro"),
  estatus_sync: varchar("estatus_sync", { length: 20 }).notNull().default("SINCRONIZADO"),
  documentos: jsonb("documentos").notNull().default({}),
  fecha_registro: timestamp("fecha_registro").notNull().defaultNow(),
}, (t) => ({
  folioIdx: index("beneficiarios_folio_idx").on(t.folio_saderh),
  municipioIdx: index("beneficiarios_municipio_idx").on(t.municipio),
  cadenaIdx: index("beneficiarios_cadena_idx").on(t.cadena_productiva),
  fechaRegistroIdx: index("beneficiarios_fecha_registro_idx").on(t.fecha_registro),
}));

// ─── ASIGNACIONES ────────────────────────────────────────────────────────────
export const asignaciones = pgTable("asignaciones", {
  id_asignacion: serial("id_asignacion").primaryKey(),
  id_tecnico: integer("id_tecnico").notNull().references(() => usuarios.id_usuario),
  id_beneficiario: integer("id_beneficiario").references(() => beneficiarios.id_beneficiario),
  tipo_asignacion: varchar("tipo_asignacion", { length: 20 }).notNull(),
  descripcion_actividad: text("descripcion_actividad"),
  fecha_limite: date("fecha_limite").notNull(),
  completado: boolean("completado").notNull().default(false),
  fecha_completado: timestamp("fecha_completado"),
  fecha_creacion: timestamp("fecha_creacion").notNull().defaultNow(),
}, (t) => ({
  tecnicoIdx: index("asignaciones_tecnico_idx").on(t.id_tecnico),
  completadoIdx: index("asignaciones_completado_idx").on(t.completado),
  beneficiarioIdx: index("asignaciones_beneficiario_idx").on(t.id_beneficiario),
  fechaLimiteIdx: index("asignaciones_fecha_limite_idx").on(t.fecha_limite),
}));

// ─── PERIODOS DE CIERRE ──────────────────────────────────────────────────────
export const periodos_cierre = pgTable("periodos_cierre", {
  id_periodo: serial("id_periodo").primaryKey(),
  anio: integer("anio").notNull(),
  mes: integer("mes").notNull(),
  cerrado: boolean("cerrado").notNull().default(false),
  fecha_cierre: timestamp("fecha_cierre"),
  id_usuario_cerro: integer("id_usuario_cerro").references(() => usuarios.id_usuario),
  notas: text("notas"),
});

// ─── BITÁCORAS ───────────────────────────────────────────────────────────────
export const bitacoras = pgTable("bitacoras", {
  id_bitacora: serial("id_bitacora").primaryKey(),
  uuid_movil: uuid("uuid_movil").notNull().unique(),
  id_usuario: integer("id_usuario").notNull().references(() => usuarios.id_usuario),
  id_asignacion: integer("id_asignacion").references(() => asignaciones.id_asignacion),
  fecha_hora_inicio: timestamp("fecha_hora_inicio").notNull(),
  fecha_hora_fin: timestamp("fecha_hora_fin"),
  latitud: decimal("latitud", { precision: 10, scale: 8 }).notNull(),
  longitud: decimal("longitud", { precision: 11, scale: 8 }).notNull(),
  precision_gps: decimal("precision_gps", { precision: 5, scale: 2 }),
  latitud_fin: decimal("latitud_fin", { precision: 10, scale: 8 }),
  longitud_fin: decimal("longitud_fin", { precision: 11, scale: 8 }),
  precision_gps_fin: decimal("precision_gps_fin", { precision: 5, scale: 2 }),
  tipo_bitacora: varchar("tipo_bitacora", { length: 20 }).notNull().default("BENEFICIARIO"),
  id_periodo: integer("id_periodo").references(() => periodos_cierre.id_periodo),
  datos_extendidos: jsonb("datos_extendidos").notNull().default({}),
  estatus_sincronizacion: varchar("estatus_sincronizacion", { length: 20 }).notNull().default("RECIBIDO"),
  dispositivo_info: jsonb("dispositivo_info").notNull().default({}),
  fecha_registro_servidor: timestamp("fecha_registro_servidor").notNull().defaultNow(),
}, (t) => ({
  usuarioIdx: index("bitacoras_usuario_idx").on(t.id_usuario),
  fechaIdx: index("bitacoras_fecha_idx").on(t.fecha_hora_inicio),
  fechaRegistroIdx: index("bitacoras_fecha_registro_idx").on(t.fecha_registro_servidor),
  estatusIdx: index("bitacoras_estatus_idx").on(t.estatus_sincronizacion),
  asignacionIdx: index("bitacoras_asignacion_idx").on(t.id_asignacion),
}));

// ─── EVIDENCIAS ──────────────────────────────────────────────────────────────
export const evidencias = pgTable("evidencias", {
  id_evidencia: serial("id_evidencia").primaryKey(),
  id_bitacora: integer("id_bitacora").notNull().references(() => bitacoras.id_bitacora, { onDelete: "cascade" }),
  url_archivo: varchar("url_archivo", { length: 500 }).notNull(),
  tipo_archivo: varchar("tipo_archivo", { length: 20 }),
  descripcion: text("descripcion"),
  fecha_subida: timestamp("fecha_subida").notNull().defaultNow(),
}, (t) => ({
  bitacoraIdx: index("evidencias_bitacora_idx").on(t.id_bitacora),
}));

// ─── NOTIFICACIONES ──────────────────────────────────────────────────────────
export const notificaciones = pgTable("notificaciones", {
  id_notificacion: serial("id_notificacion").primaryKey(),
  id_usuario: integer("id_usuario").references(() => usuarios.id_usuario),
  titulo: varchar("titulo", { length: 150 }).notNull(),
  mensaje: text("mensaje").notNull(),
  tipo: varchar("tipo", { length: 20 }),
  leida: boolean("leida").notNull().default(false),
  fecha_creacion: timestamp("fecha_creacion").notNull().defaultNow(),
  fecha_lectura: timestamp("fecha_lectura"),
}, (t) => ({
  usuarioIdx: index("notif_usuario_idx").on(t.id_usuario),
  leidaIdx: index("notif_leida_idx").on(t.leida),
}));

// ─── API KEYS ────────────────────────────────────────────────────────────────
export const api_keys = pgTable("api_keys", {
  id_api_key: serial("id_api_key").primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  id_usuario: integer("id_usuario").notNull().references(() => usuarios.id_usuario),
  activo: boolean("activo").notNull().default(true),
  fecha_creacion: timestamp("fecha_creacion").notNull().defaultNow(),
});

// ─── SYNC LOG ────────────────────────────────────────────────────────────────
export const sync_log = pgTable("sync_log", {
  id_sync: serial("id_sync").primaryKey(),
  uuid_movil: uuid("uuid_movil").notNull(),
  tipo_registro: varchar("tipo_registro", { length: 20 }).notNull().default("BITACORA"),
  id_usuario: integer("id_usuario").references(() => usuarios.id_usuario),
  fecha_intento: timestamp("fecha_intento").notNull().defaultNow(),
  resultado: varchar("resultado", { length: 20 }),
  detalle: text("detalle"),
});

// ─── AUDITORÍA ───────────────────────────────────────────────────────────────
export const auditoria = pgTable("auditoria", {
  id_auditoria: serial("id_auditoria").primaryKey(),
  id_usuario: integer("id_usuario").notNull().references(() => usuarios.id_usuario),
  tabla: varchar("tabla", { length: 50 }).notNull(),
  id_registro: integer("id_registro"),
  accion: varchar("accion", { length: 20 }),
  antes: jsonb("antes"),
  despues: jsonb("despues"),
  fecha_accion: timestamp("fecha_accion").notNull().defaultNow(),
  ip_address: varchar("ip_address", { length: 45 }),
}, (t) => ({
  fechaIdx: index("auditoria_fecha_idx").on(t.fecha_accion),
  tablaIdx: index("auditoria_tabla_idx").on(t.tabla),
}));

// ─── CONFIGURACIÓN SISTEMA ───────────────────────────────────────────────────
export const configuracion_sistema = pgTable("configuracion_sistema", {
  id_config: serial("id_config").primaryKey(),
  clave: varchar("clave", { length: 100 }).notNull().unique(),
  valor: text("valor"),
  tipo: varchar("tipo", { length: 20 }),
  descripcion: varchar("descripcion", { length: 255 }),
  fecha_actualizacion: timestamp("fecha_actualizacion").notNull().defaultNow(),
  id_usuario_modifico: integer("id_usuario_modifico").references(() => usuarios.id_usuario),
});

// ─── CONFIGURACIÓN APP ───────────────────────────────────────────────────────
export const configuracion_app = pgTable("configuracion_app", {
  id_config_app: serial("id_config_app").primaryKey(),
  seccion: varchar("seccion", { length: 50 }).notNull(),
  elemento: varchar("elemento", { length: 100 }).notNull(),
  etiqueta: varchar("etiqueta", { length: 150 }),
  visible: boolean("visible").notNull().default(true),
  requerido: boolean("requerido").notNull().default(false),
  orden: integer("orden").notNull().default(0),
  opciones: jsonb("opciones").notNull().default({}),
  fecha_actualizacion: timestamp("fecha_actualizacion").notNull().defaultNow(),
});

// ─── PLANTILLAS PDF ──────────────────────────────────────────────────────────
export const plantillas_pdf = pgTable("plantillas_pdf", {
  id_plantilla: serial("id_plantilla").primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  tipo: varchar("tipo", { length: 30 }).notNull(),
  configuracion: jsonb("configuracion").notNull().default({}),
  activo: boolean("activo").notNull().default(true),
  fecha_actualizacion: timestamp("fecha_actualizacion").notNull().defaultNow(),
  id_usuario_modifico: integer("id_usuario_modifico").references(() => usuarios.id_usuario),
});

// ─── RELATIONS ───────────────────────────────────────────────────────────────
export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  zona: one(zonas, { fields: [usuarios.id_zona], references: [zonas.id_zona] }),
  bitacoras: many(bitacoras),
  asignaciones: many(asignaciones),
  notificaciones: many(notificaciones),
}));

export const beneficiariosRelations = relations(beneficiarios, ({ one, many }) => ({
  registradoPor: one(usuarios, { fields: [beneficiarios.id_usuario_registro], references: [usuarios.id_usuario] }),
  asignaciones: many(asignaciones),
}));

export const bitacorasRelations = relations(bitacoras, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [bitacoras.id_usuario], references: [usuarios.id_usuario] }),
  asignacion: one(asignaciones, { fields: [bitacoras.id_asignacion], references: [asignaciones.id_asignacion] }),
  periodo: one(periodos_cierre, { fields: [bitacoras.id_periodo], references: [periodos_cierre.id_periodo] }),
  evidencias: many(evidencias),
}));

export const asignacionesRelations = relations(asignaciones, ({ one }) => ({
  tecnico: one(usuarios, { fields: [asignaciones.id_tecnico], references: [usuarios.id_usuario] }),
  beneficiario: one(beneficiarios, { fields: [asignaciones.id_beneficiario], references: [beneficiarios.id_beneficiario] }),
}));

// ─── ERROR LOG ───────────────────────────────────────────────────────────────
export const error_log = pgTable("error_log", {
  id_error: serial("id_error").primaryKey(),
  origen: varchar("origen", { length: 20 }).notNull(),
  entorno: varchar("entorno", { length: 10 }).notNull().default("production"),
  endpoint: varchar("endpoint", { length: 255 }),
  metodo_http: varchar("metodo_http", { length: 10 }),
  mensaje_error: text("mensaje_error").notNull(),
  stack_trace: text("stack_trace"),
  codigo_http: integer("codigo_http"),
  id_usuario: integer("id_usuario").references(() => usuarios.id_usuario, { onDelete: "set null" }),
  uuid_movil: uuid("uuid_movil"),
  payload_entrada: jsonb("payload_entrada").notNull().default({}),
  info_extra: jsonb("info_extra").notNull().default({}),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: varchar("user_agent", { length: 500 }),
  resuelto: boolean("resuelto").notNull().default(false),
  fecha_resolucion: timestamp("fecha_resolucion"),
  notas_resolucion: text("notas_resolucion"),
  fecha_error: timestamp("fecha_error").notNull().defaultNow(),
}, (t) => ({
  fechaIdx: index("idx_error_log_fecha").on(t.fecha_error),
  origenIdx: index("idx_error_log_origen").on(t.origen),
  entornoIdx: index("idx_error_log_entorno").on(t.entorno),
  usuarioIdx: index("idx_error_log_usuario").on(t.id_usuario),
  resueltoIdx: index("idx_error_log_resuelto").on(t.resuelto),
}));

// ─── PASSWORD RESET TOKENS ───────────────────────────────────────────────────
export const password_reset_tokens = pgTable("password_reset_tokens", {
  id_token: serial("id_token").primaryKey(),
  id_usuario: integer("id_usuario").notNull().references(() => usuarios.id_usuario, { onDelete: "cascade" }),
  token: varchar("token", { length: 128 }).unique().notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull().default("EMAIL"),
  usado: boolean("usado").notNull().default(false),
  fecha_expira: timestamp("fecha_expira").notNull(),
  fecha_uso: timestamp("fecha_uso"),
  ip_solicitante: varchar("ip_solicitante", { length: 45 }),
  fecha_creacion: timestamp("fecha_creacion").notNull().defaultNow(),
}, (t) => ({
  tokenIdx: index("idx_prt_token").on(t.token),
  usuarioIdx: index("idx_prt_usuario").on(t.id_usuario),
  expiraIdx: index("idx_prt_expira").on(t.fecha_expira),
}));
