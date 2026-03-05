import type { Metadata } from "next";
import { db } from "@/lib/db";
import { usuarios, beneficiarios, bitacoras, asignaciones } from "@/lib/schema";
import { count, eq, and, gte, sql } from "drizzle-orm";
import PageHeader from "@/components/layout/PageHeader";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Users, UserCheck, BookOpen, CheckCircle2,
  TrendingUp, Calendar, MapPin, BarChart3,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Reportes" };
export const revalidate = 60;

async function getReportData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    [{ totalTecnicos }],
    [{ tecnicosActivos }],
    [{ totalBeneficiarios }],
    [{ beneficiariosEsteMes }],
    [{ beneficiariosEstaSemana }],
    [{ totalBitacoras }],
    [{ bitacorasEsteMes }],
    [{ bitacorasEstaSemana }],
    [{ asignacionesTotales }],
    [{ asignacionesCompletadas }],
    [{ asignacionesPendientes }],
  ] = await Promise.all([
    db.select({ totalTecnicos: count() }).from(usuarios).where(eq(usuarios.rol, "TECNICO")),
    db.select({ tecnicosActivos: count() }).from(usuarios).where(and(eq(usuarios.rol, "TECNICO"), eq(usuarios.activo, true))),
    db.select({ totalBeneficiarios: count() }).from(beneficiarios),
    db.select({ beneficiariosEsteMes: count() }).from(beneficiarios).where(gte(beneficiarios.fecha_registro, startOfMonth)),
    db.select({ beneficiariosEstaSemana: count() }).from(beneficiarios).where(gte(beneficiarios.fecha_registro, startOfWeek)),
    db.select({ totalBitacoras: count() }).from(bitacoras),
    db.select({ bitacorasEsteMes: count() }).from(bitacoras).where(gte(bitacoras.fecha_registro_servidor, startOfMonth)),
    db.select({ bitacorasEstaSemana: count() }).from(bitacoras).where(gte(bitacoras.fecha_registro_servidor, startOfWeek)),
    db.select({ asignacionesTotales: count() }).from(asignaciones),
    db.select({ asignacionesCompletadas: count() }).from(asignaciones).where(eq(asignaciones.completado, true)),
    db.select({ asignacionesPendientes: count() }).from(asignaciones).where(eq(asignaciones.completado, false)),
  ]);

  // Bitácoras por tipo
  const bitacorasPorTipo = await db
    .select({
      tipo: bitacoras.tipo_bitacora,
      total: count(),
    })
    .from(bitacoras)
    .groupBy(bitacoras.tipo_bitacora);

  // Beneficiarios por municipio (top 10)
  const beneficiariosPorMunicipio = await db
    .select({
      municipio: beneficiarios.municipio,
      total: count(),
    })
    .from(beneficiarios)
    .groupBy(beneficiarios.municipio)
    .orderBy(sql`count(*) DESC`)
    .limit(10);

  // Técnicos más activos (por bitácoras)
  const tecnicosMasActivos = await db
    .select({
      nombre: usuarios.nombre_completo,
      total: count(),
    })
    .from(bitacoras)
    .leftJoin(usuarios, eq(bitacoras.id_usuario, usuarios.id_usuario))
    .groupBy(usuarios.nombre_completo)
    .orderBy(sql`count(*) DESC`)
    .limit(10);

  const porcentajeCompletado = Number(asignacionesTotales) > 0
    ? Math.round((Number(asignacionesCompletadas) / Number(asignacionesTotales)) * 100)
    : 0;

  return {
    totalTecnicos: Number(totalTecnicos),
    tecnicosActivos: Number(tecnicosActivos),
    totalBeneficiarios: Number(totalBeneficiarios),
    beneficiariosEsteMes: Number(beneficiariosEsteMes),
    beneficiariosEstaSemana: Number(beneficiariosEstaSemana),
    totalBitacoras: Number(totalBitacoras),
    bitacorasEsteMes: Number(bitacorasEsteMes),
    bitacorasEstaSemana: Number(bitacorasEstaSemana),
    asignacionesTotales: Number(asignacionesTotales),
    asignacionesCompletadas: Number(asignacionesCompletadas),
    asignacionesPendientes: Number(asignacionesPendientes),
    porcentajeCompletado,
    bitacorasPorTipo,
    beneficiariosPorMunicipio,
    tecnicosMasActivos,
  };
}

export default async function ReportesPage() {
  const session = await getSession();
  if (!session || session.rol !== "COORDINADOR") redirect("/login");

  const data = await getReportData();
  const today = formatDate(new Date(), "d 'de' MMMM yyyy");

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Reportes y Estadísticas"
        subtitle={`Generado el ${today}`}
      />

      <div className="p-8 space-y-6 bg-gray-50">
        {/* Resumen General */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-guinda-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-guinda-700" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">Técnicos</p>
            <p className="text-3xl font-bold text-guinda-700 font-display">{data.totalTecnicos}</p>
            <p className="text-xs text-green-600 mt-2">{data.tecnicosActivos} activos</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-dorado-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-dorado-700" />
              </div>
              <Calendar className="w-4 h-4 text-dorado-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">Beneficiarios</p>
            <p className="text-3xl font-bold text-guinda-700 font-display">{data.totalBeneficiarios.toLocaleString("es-MX")}</p>
            <p className="text-xs text-gray-600 mt-2">+{data.beneficiariosEsteMes} este mes</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-guinda-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-guinda-700" />
              </div>
              <MapPin className="w-4 h-4 text-guinda-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">Bitácoras</p>
            <p className="text-3xl font-bold text-guinda-700 font-display">{data.totalBitacoras.toLocaleString("es-MX")}</p>
            <p className="text-xs text-gray-600 mt-2">+{data.bitacorasEsteMes} este mes</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-700" />
              </div>
              <BarChart3 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium mb-1">Cumplimiento</p>
            <p className="text-3xl font-bold text-guinda-700 font-display">{data.porcentajeCompletado}%</p>
            <p className="text-xs text-gray-600 mt-2">{data.asignacionesPendientes} pendientes</p>
          </div>
        </div>

        {/* Gráficos y tablas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bitácoras por tipo */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-guinda-900 font-display mb-4">
              Bitácoras por Tipo
            </h3>
            <div className="space-y-3">
              {data.bitacorasPorTipo.map((item) => {
                const total = data.totalBitacoras;
                const porcentaje = total > 0 ? Math.round((Number(item.total) / total) * 100) : 0;
                return (
                  <div key={item.tipo} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.tipo || "Sin tipo"}</span>
                      <span className="text-gray-600">{Number(item.total)} ({porcentaje}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-guinda-700 h-2 rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top municipios */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-guinda-900 font-display mb-4">
              Top 10 Municipios
            </h3>
            <div className="space-y-3">
              {data.beneficiariosPorMunicipio.map((item, idx) => (
                <div key={item.municipio} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-dorado-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-dorado-700">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{item.municipio}</p>
                  </div>
                  <span className="text-sm font-semibold text-guinda-700">{Number(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Técnicos más activos */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
            <h3 className="text-lg font-semibold text-guinda-900 font-display mb-4">
              Técnicos Más Activos (por bitácoras)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {data.tecnicosMasActivos.map((item, idx) => (
                <div key={item.nombre} className="p-4 rounded-lg border border-gray-200 hover:border-guinda-300 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-guinda-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-guinda-700">{idx + 1}</span>
                    </div>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1 line-clamp-2">{item.nombre || "Sin nombre"}</p>
                  <p className="text-2xl font-bold text-guinda-700 font-display">{Number(item.total)}</p>
                  <p className="text-xs text-gray-500">bitácoras</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen semanal */}
        <div className="rounded-lg border border-dorado-200 bg-dorado-50 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-dorado-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-dorado-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-guinda-900 font-display mb-2">
                Resumen de la Semana
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-guinda-700 font-medium">Beneficiarios</p>
                  <p className="text-2xl font-bold text-guinda-900">{data.beneficiariosEstaSemana}</p>
                </div>
                <div>
                  <p className="text-guinda-700 font-medium">Bitácoras</p>
                  <p className="text-2xl font-bold text-guinda-900">{data.bitacorasEstaSemana}</p>
                </div>
                <div>
                  <p className="text-guinda-700 font-medium">Asignaciones Completadas</p>
                  <p className="text-2xl font-bold text-guinda-900">{data.asignacionesCompletadas}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
