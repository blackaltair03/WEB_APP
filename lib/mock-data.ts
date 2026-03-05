/**
 * Sistema de datos simulados para desarrollo local
 * Usa localStorage para persistir datos en el navegador
 * 
 * Este módulo proporciona datos de ejemplo cuando la base de datos
 * no está disponible o no está configurada correctamente.
 */

import { MUNICIPIOS_HIDALGO } from "./utils";

// Localidades por municipio (datos de ejemplo)
const LOCALIDADES_HIDALGO: Record<string, string[]> = {
  "Pachuca de Soto": ["Centro", "San José", "Venta Prieta", "Carboneras", "Pachuquilla"],
  "Tula de Allende": ["Centro", "San Marcos", "San Miguel", "El Llano", "San Lorenzo"],
  "Tulancingo de Bravo": ["Centro", "San Miguel", "Santiago", "La Lagunilla", "Juárez"],
  "Huejutla de Reyes": ["Centro", "Acoxhuapan", "Chalahuiyapa", "Huejutla", "Ilamatl"],
  "Ixmiquilpan": ["Centro", "El Décimo", "San Juanico", "Dios Padre", "Julian Villagran"],
  "Actopan": ["Centro", "San Andrés", "La Trinidad", "San Juan", "Santo Domingo"],
  "Tepeapulco": ["Centro", "San Juan Ehxtla", "San Lorenzo", "Santo Domingo", "Zototlán"],
  "Tizayuca": ["Centro", "Progreso", "Jilotzingo", "Zimbrones", "Techo de Moctezuma"],
  "Apam": ["Centro", "San Juan Tizahuapan", "San Mateo", "La Purisima", "San Lorenzo"],
  "Cuautepec de Hinojosa": ["Centro", "Cuautepec", "San Antonio", "Santiago", "San Miguel"],
  "Zimapán": ["Centro", "San Miguel", "La Ladera", "El Banco", "San Juanico"],
  "Mixquiahuala de Juárez": ["Centro", "Doxey", "Sánsalvador", "Mixquiahuala", "Santa María Ilucan"],
  "Francisco I. Madero": ["Centro", "Santa María", "San Juan", "La Providencia", "Benito Juárez"],
  "San Agustín Tlaxiaca": ["Centro", "San Agustín", "San Juan", "Santa María", "San Miguel"],
  "Progreso de Obregón": ["Centro", "San José", "El Saucillo", "El Tendido", "Venta de Hule"],
};

// ============================================
// TIPOS
// ============================================

export interface MockUsuario {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  password_hash: string;
  rol: "SUPER_ADMIN" | "COORDINADOR" | "TECNICO";
  especialidad: string | null;
  id_zona: number | null;
  activo: boolean;
  puede_registrar_beneficiarios: boolean;
  bloqueado_revision: boolean;
  fecha_creacion: string;
}

export interface MockBeneficiario {
  id_beneficiario: number;
  folio_saderh: string | null;
  curp: string | null;
  nombre_completo: string;
  municipio: string;
  localidad: string;
  cadena_productiva: "AGRICOLA" | "AGROPECUARIO" | null;
  telefono_contacto: string | null;
  latitud_predio: string | null;
  longitud_predio: string | null;
  id_usuario_registro: number | null;
  origen_registro: "WEB" | "MOVIL";
  uuid_movil_registro: string | null;
  estatus_sync: "SINCRONIZADO" | "PENDIENTE" | "ERROR";
  documentos: Record<string, unknown>;
  fecha_registro: string;
}

export interface MockAsignacion {
  id_asignacion: number;
  id_tecnico: number;
  id_beneficiario: number | null;
  tipo_asignacion: "VISITA" | "SEGUIMIENTO" | "CAPACITACION";
  descripcion_actividad: string | null;
  fecha_limite: string;
  completado: boolean;
  fecha_completado: string | null;
  fecha_creacion: string;
}

export interface MockBitacora {
  id_bitacora: number;
  uuid_movil: string;
  id_usuario: number;
  id_asignacion: number | null;
  fecha_hora_inicio: string;
  fecha_hora_fin: string | null;
  latitud: string;
  longitud: string;
  precision_gps: string | null;
  latitud_fin: string | null;
  longitud_fin: string | null;
  precision_gps_fin: string | null;
  tipo_bitacora: "BENEFICIARIO" | "GENERAL";
  id_periodo: number | null;
  datos_extendidos: Record<string, unknown>;
  estatus_sincronizacion: "RECIBIDO" | "PENDIENTE" | "ERROR";
  dispositivo_info: Record<string, unknown>;
  fecha_registro_servidor: string;
}

export interface MockNotificacion {
  id_notificacion: number;
  id_usuario: number | null;
  titulo: string;
  mensaje: string;
  tipo: "INFO" | "AVISO" | "URGENTE";
  leida: boolean;
  fecha_creacion: string;
  fecha_lectura: string | null;
}

// ============================================
// KEYS PARA LOCALSTORAGE
// ============================================

const STORAGE_KEYS = {
  USUARIOS: "campo_saas_mock_usuarios",
  BENEFICIARIOS: "campo_saas_mock_beneficiarios",
  ASIGNACIONES: "campo_saas_mock_asignaciones",
  BITACORAS: "campo_saas_mock_bitacoras",
  NOTIFICACIONES: "campo_saas_mock_notificaciones",
  INICIALIZADO: "campo_saas_mock_inicializado",
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFolioSaderh(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `SADERH-${year}-${random}`;
}

function generateCURP(): string {
  const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  const numeros = "0123456789";
  let curp = "";
  for (let i = 0; i < 4; i++) curp += letras[Math.floor(Math.random() * letras.length)];
  curp += "MM";
  for (let i = 0; i < 6; i++) curp += numeros[Math.floor(Math.random() * numeros.length)];
  curp += "HN";
  curp += letras[Math.floor(Math.random() * letras.length)];
  curp += "R";
  for (let i = 0; i < 8; i++) curp += numeros[Math.floor(Math.random() * numeros.length)];
  curp += "A";
  return curp;
}

function generatePhone(): string {
  const nums = "0123456789";
  let phone = "77";
  for (let i = 0; i < 8; i++) phone += nums[Math.floor(Math.random() * nums.length)];
  return phone;
}

function generateCoordenadas(municipio: string): { lat: string; lng: string } {
  // Coordenadas aproximadas de Hidalgo
  const baseCoords: Record<string, { lat: number; lng: number }> = {
    "Pachuca de Soto": { lat: 20.1217, lng: -98.7342 },
    "Tula de Allende": { lat: 20.0545, lng: -99.3436 },
    "Tulancingo de Bravo": { lat: 20.0853, lng: -98.3629 },
    "Huejutla de Reyes": { lat: 21.1161, lng: -98.4164 },
    "Ixmiquilpan": { lat: 20.4788, lng: -99.2162 },
    "Actopan": { lat: 20.2683, lng: -98.9386 },
    "Apam": { lat: 20.1581, lng: -98.4133 },
    "Tepeapulco": { lat: 19.8289, lng: -98.5767 },
  };

  const base = baseCoords[municipio] || { lat: 20.1, lng: -98.7 };
  return {
    lat: (base.lat + (Math.random() - 0.5) * 0.1).toFixed(6),
    lng: (base.lng + (Math.random() - 0.5) * 0.1).toFixed(6),
  };
}

function getRandomLocalidad(municipio: string): string {
  const localidades = LOCALIDADES_HIDALGO[municipio];
  if (localidades && localidades.length > 0) {
    return getRandomElement(localidades);
  }
  return "Centro";
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================
// DATOS DE EJEMPLO
// ============================================

const nombresEjemplo = [
  "Juan Hernández García",
  "María López Rodríguez",
  "Pedro Martínez Sánchez",
  "Ana González Fernández",
  "Carlos Ramírez Torres",
  "Laura Cruz Morales",
  "José Luis Rivera Díaz",
  "Patricia Jiménez Castillo",
  "Miguel Ángel Vargas Romero",
  "Rosa María López Ortega",
  "Francisco Javier Mendoza Gutiérrez",
  "Elizabeth Hernández Valdez",
  "Roberto Carlos Álvarez Pérez",
  "Sandra Rodríguez Muñoz",
  "Antonio Martínez Silva",
  "Carmen Gloria López Flores",
  "José María Torres Reyes",
  "María Elena Cruz Bautista",
  "Alejandro Díaz Serrano",
  "Gloria Patricia Ramos Medina",
];

const tecnicosNombres = [
  "Ing. Fernando Sánchez Pérez",
  "Ing. Alejandro Rivera Hernández",
  "Ing. Mariana González López",
  "Ing. Roberto Carlos Mendoza",
  "Ing. Patricia Flores Díaz",
  "Ing. José Luis Torres Ruiz",
  "Ing. Laura Martínez Cruz",
  "Ing. Mario Alberto Vargas",
];

const especializaciones = ["AGRICOLA", "AGROPECUARIO"];

function generateMockUsuarios(): MockUsuario[] {
  const now = new Date().toISOString();
  return [
    {
      id_usuario: 1,
      nombre_completo: "Administrador Sistema",
      email: "admin@campo.com",
      password_hash: "$2a$10$mockhash123456789",
      rol: "SUPER_ADMIN",
      especialidad: null,
      id_zona: null,
      activo: true,
      puede_registrar_beneficiarios: true,
      bloqueado_revision: false,
      fecha_creacion: now,
    },
    {
      id_usuario: 2,
      nombre_completo: "Coordinador Regional",
      email: "coordinador@campo.com",
      password_hash: "$2a$10$mockhash123456789",
      rol: "COORDINADOR",
      especialidad: null,
      id_zona: 1,
      activo: true,
      puede_registrar_beneficiarios: true,
      bloqueado_revision: false,
      fecha_creacion: now,
    },
    ...tecnicosNombres.map((nombre, idx) => ({
      id_usuario: idx + 3,
      nombre_completo: nombre,
      email: `tecnico${idx + 1}@campo.com`,
      password_hash: "$2a$10$mockhash123456789",
      rol: "TECNICO" as const,
      especialidad: getRandomElement(especializaciones),
      id_zona: 1,
      activo: true,
      puede_registrar_beneficiarios: true,
      bloqueado_revision: false,
      fecha_creacion: now,
    })),
  ];
}

function generateMockBeneficiarios(count: number = 50): MockBeneficiario[] {
  const now = new Date();
  const beneficiaries: MockBeneficiario[] = [];

  for (let i = 1; i <= count; i++) {
    const municipio = getRandomElement(Object.keys(MUNICIPIOS_HIDALGO));
    const coords = generateCoordenadas(municipio);
    const cadena = getRandomElement(["AGRICOLA", "AGROPECUARIO"]);
    
    const fecha = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);

    beneficiaries.push({
      id_beneficiario: i,
      folio_saderh: generateFolioSaderh(),
      curp: generateCURP(),
      nombre_completo: getRandomElement(nombresEjemplo),
      municipio,
      localidad: getRandomLocalidad(municipio),
      cadena_productiva: cadena as "AGRICOLA" | "AGROPECUARIO",
      telefono_contacto: generatePhone(),
      latitud_predio: coords.lat,
      longitud_predio: coords.lng,
      id_usuario_registro: Math.floor(Math.random() * 6) + 3,
      origen_registro: Math.random() > 0.3 ? "WEB" : "MOVIL",
      uuid_movil_registro: Math.random() > 0.5 ? generateUUID() : null,
      estatus_sync: getRandomElement(["SINCRONIZADO", "SINCRONIZADO", "SINCRONIZADO", "PENDIENTE"]),
      documentos: {},
      fecha_registro: fecha.toISOString(),
    });
  }

  return beneficiaries;
}

function generateMockAsignaciones(
  beneficiarios: MockBeneficiario[],
  usuarios: MockUsuario[]
): MockAsignacion[] {
  const now = new Date();
  const asignaciones: MockAsignacion[] = [];
  const tecnicos = usuarios.filter((u) => u.rol === "TECNICO");

  const actividades = [
    "Primera visita de diagnóstico",
    "Seguimiento de cultivo",
    "Verificación de sembradíos",
    "Capacitación en técnicas agrícolas",
    "Evaluación de daños por plaga",
    "Asesoría técnica especializada",
    "Inspección de parcela",
    "Registro de beneficiarios",
  ];

  let id = 1;
  tecnicos.forEach((tecnico) => {
    const numAsignaciones = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numAsignaciones; i++) {
      const beneficiario = getRandomElement(beneficiarios);
      const fechaLimite = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const completado = Math.random() > 0.6;
      const fechaCompletado = completado
        ? new Date(fechaLimite.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000)
        : null;

      asignaciones.push({
        id_asignacion: id++,
        id_tecnico: tecnico.id_usuario,
        id_beneficiario: beneficiario.id_beneficiario,
        tipo_asignacion: getRandomElement(["VISITA", "SEGUIMIENTO", "CAPACITACION"]),
        descripcion_actividad: getRandomElement(actividades),
        fecha_limite: fechaLimite.toISOString().split("T")[0],
        completado,
        fecha_completado: fechaCompletado?.toISOString() || null,
        fecha_creacion: new Date(now.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  return asignaciones;
}

function generateMockBitacoras(
  asignaciones: MockAsignacion[],
  usuarios: MockUsuario[]
): MockBitacora[] {
  const now = new Date();
  const bitacoras: MockBitacora[] = [];
  const tecnicos = usuarios.filter((u) => u.rol === "TECNICO");

  tecnicos.forEach((tecnico) => {
    const numBitacoras = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < numBitacoras; i++) {
      const asignacion = getRandomElement(asignaciones.filter((a) => a.id_tecnico === tecnico.id_usuario));
      const fechaInicio = new Date(now.getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000);
      const duracion = Math.floor(Math.random() * 4) + 1;
      const fechaFin = new Date(fechaInicio.getTime() + duracion * 60 * 60 * 1000);

      const coords = {
        lat: (20.0 + Math.random()).toFixed(6),
        lng: (-99.0 + Math.random()).toFixed(6),
      };

      bitacoras.push({
        id_bitacora: i + 1,
        uuid_movil: generateUUID(),
        id_usuario: tecnico.id_usuario,
        id_asignacion: asignacion?.id_asignacion || null,
        fecha_hora_inicio: fechaInicio.toISOString(),
        fecha_hora_fin: fechaFin.toISOString(),
        latitud: coords.lat,
        longitud: coords.lng,
        precision_gps: (Math.random() * 10 + 5).toFixed(2),
        latitud_fin: coords.lat,
        longitud_fin: coords.lng,
        precision_gps_fin: (Math.random() * 10 + 5).toFixed(2),
        tipo_bitacora: "BENEFICIARIO",
        id_periodo: null,
        datos_extendidos: {},
        estatus_sincronizacion: "RECIBIDO",
        dispositivo_info: {
          modelo: "Samsung Galaxy A54",
          version: "Android 13",
        },
        fecha_registro_servidor: fechaFin.toISOString(),
      });
    }
  });

  return bitacoras;
}

function generateMockNotificaciones(): MockNotificacion[] {
  const now = new Date();
  const notificaciones: MockNotificacion[] = [
    {
      id_notificacion: 1,
      id_usuario: 2,
      titulo: "Bienvenido al Sistema",
      mensaje: "Gracias por usar el sistema de gestión de beneficiarios SADERH.",
      tipo: "INFO",
      leida: true,
      fecha_creacion: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_lectura: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id_notificacion: 2,
      id_usuario: 2,
      titulo: "Nueva asignación creada",
      mensaje: "Se han asignado 5 nuevos beneficiarios para seguimiento.",
      tipo: "AVISO",
      leida: false,
      fecha_creacion: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_lectura: null,
    },
    {
      id_notificacion: 3,
      id_usuario: null,
      titulo: "Mantenimiento programado",
      mensaje: "El sistema tendrá mantenimiento el próximo domingo de 2:00 a 4:00 AM.",
      tipo: "URGENTE",
      leida: false,
      fecha_creacion: now.toISOString(),
      fecha_lectura: null,
    },
  ];
  return notificaciones;
}

// ============================================
// FUNCIONES PÚBLICAS
// ============================================

/**
 * Inicializa los datos simulados en localStorage
 * Solo se ejecuta una vez
 */
export function initializeMockData(): void {
  if (typeof window === "undefined") return;
  
  const yaInicializado = localStorage.getItem(STORAGE_KEYS.INICIALIZADO);
  if (yaInicializado) return;

  // Generar datos
  const usuarios = generateMockUsuarios();
  const beneficiarios = generateMockBeneficiarios(50);
  const asignaciones = generateMockAsignaciones(beneficiarios, usuarios);
  const bitacoras = generateMockBitacoras(asignaciones, usuarios);
  const notificaciones = generateMockNotificaciones();

  // Guardar en localStorage
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
  localStorage.setItem(STORAGE_KEYS.BENEFICIARIOS, JSON.stringify(beneficiarios));
  localStorage.setItem(STORAGE_KEYS.ASIGNACIONES, JSON.stringify(asignaciones));
  localStorage.setItem(STORAGE_KEYS.BITACORAS, JSON.stringify(bitacoras));
  localStorage.setItem(STORAGE_KEYS.NOTIFICACIONES, JSON.stringify(notificaciones));
  localStorage.setItem(STORAGE_KEYS.INICIALIZADO, "true");

  console.log("✅ Datos simulados inicializados en localStorage");
}

/**
 * Obtiene los usuarios simulados
 */
export function getMockUsuarios(): MockUsuario[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
  return data ? JSON.parse(data) : [];
}

/**
 * Obtiene los beneficiarios simulados
 */
export function getMockBeneficiarios(): MockBeneficiario[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.BENEFICIARIOS);
  return data ? JSON.parse(data) : [];
}

/**
 * Obtiene las asignaciones simuladas
 */
export function getMockAsignaciones(): MockAsignacion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.ASIGNACIONES);
  return data ? JSON.parse(data) : [];
}

/**
 * Obtiene las bitácoras simuladas
 */
export function getMockBitacoras(): MockBitacora[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.BITACORAS);
  return data ? JSON.parse(data) : [];
}

/**
 * Obtiene las notificaciones simuladas
 */
export function getMockNotificaciones(): MockNotificacion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICACIONES);
  return data ? JSON.parse(data) : [];
}

/**
 * Agrega un nuevo beneficiario simulado
 */
export function addMockBeneficiario(beneficiario: Omit<MockBeneficiario, "id_beneficiario">): MockBeneficiario {
  const beneficiarios = getMockBeneficiarios();
  const newId = Math.max(...beneficiarios.map((b) => b.id_beneficiario), 0) + 1;
  const nuevo = { ...beneficiario, id_beneficiario: newId };
  beneficiarios.push(nuevo);
  localStorage.setItem(STORAGE_KEYS.BENEFICIARIOS, JSON.stringify(beneficiarios));
  return nuevo;
}

/**
 * Agrega una nueva asignación simulada
 */
export function addMockAsignacion(asignacion: Omit<MockAsignacion, "id_asignacion">): MockAsignacion {
  const asignaciones = getMockAsignaciones();
  const newId = Math.max(...asignaciones.map((a) => a.id_asignacion), 0) + 1;
  const nueva = { ...asignacion, id_asignacion: newId };
  asignaciones.push(nueva);
  localStorage.setItem(STORAGE_KEYS.ASIGNACIONES, JSON.stringify(asignaciones));
  return nueva;
}

/**
 * Resetea todos los datos simulados
 */
export function resetMockData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.INICIALIZADO);
  localStorage.removeItem(STORAGE_KEYS.USUARIOS);
  localStorage.removeItem(STORAGE_KEYS.BENEFICIARIOS);
  localStorage.removeItem(STORAGE_KEYS.ASIGNACIONES);
  localStorage.removeItem(STORAGE_KEYS.BITACORAS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICACIONES);
  console.log("🗑️ Datos simulados eliminados");
  initializeMockData();
}

/**
 * Verifica si los datos simulados están inicializados
 */
export function isMockDataInitialized(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.INICIALIZADO) === "true";
}
