import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null, fmt = "dd/MM/yyyy"): string {
  if (!date) return "—";
  return format(new Date(date), fmt, { locale: es });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
}

export function timeAgo(date: Date | string | null): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function getRolLabel(rol: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    COORDINADOR: "Coordinador",
    TECNICO: "Técnico",
  };
  return labels[rol] ?? rol;
}

export function getEspecialidadLabel(esp: string | null): string {
  const labels: Record<string, string> = {
    AGRICOLA: "Agrícola",
    AGROPECUARIO: "Agropecuario",
    ACTIVIDAD_GENERAL: "Actividad General",
  };
  return esp ? (labels[esp] ?? esp) : "—";
}

export function getCadenaLabel(cadena: string | null): string {
  const labels: Record<string, string> = {
    AGRICOLA: "Agrícola",
    AGROPECUARIO: "Agropecuario",
  };
  return cadena ? (labels[cadena] ?? cadena) : "—";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function formatGPS(lat: string | number | null, lng: string | number | null): string {
  if (!lat || !lng) return "Sin coordenadas";
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
}

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const MUNICIPIOS_HIDALGO = [
  "Actopan","Acaxochitlán","Atotonilco de Tula","Cardonal","Cuautepec de Hinojosa",
  "Epazoyucan","Francisco I. Madero","Huejutla de Reyes","Ixmiquilpan","Jacala de Ledezma",
  "Metepec","Mineral del Monte","Mixquiahuala de Juárez","Molango de Escamilla",
  "Omitlán de Juárez","Pachuca de Soto","Progreso de Obregón","San Agustín Tlaxiaca",
  "Tasquillo","Tepeapulco","Tepehuacán de Guerrero","Tizayuca","Tlahuelilpan",
  "Tlaxcoapan","Tolcayuca","Tula de Allende","Tulancingo de Bravo","Xochiatipan",
  "Zempoala","Zimapán",
];
