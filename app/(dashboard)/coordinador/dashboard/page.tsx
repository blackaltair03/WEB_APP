import type { Metadata } from "next";
import { db } from "@/lib/db";
import { usuarios, beneficiarios, bitacoras, asignaciones } from "@/lib/schema";
import { count, eq, and, gte, sql } from "drizzle-orm";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Users, UserCheck, BookOpen, CheckCircle2,
  TrendingUp, AlertTriangle, MapPin, Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard Coordinador" };

export const revalidate = 60; // Revalidate every 60 seconds

async function getCoordinadorStats(idCoordinador: number) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

  // Get técnicos assigned to this coordinador
  const tecnicosAsignados = await db
    .select({ id_usuario: usuarios.id_usuario })
    .from(usuarios)
    .where(and(eq(usuarios.rol, "TECNICO"), eq(usuarios.activo, true)));

  const tecnicoIds = tecnicosAsignados.map(t => t.id_usuario);

  const [
    [{ totalTecnicos }],
    [{ totalBeneficiarios }],
    [{ beneficiariosEstaSemana }],
    [{ totalBitacoras }],
    [{ bitacorasEsteMes }],
    [{ pendientes }],
    [{ completadas }],
  ] = await Promise.all([
    db.select({ totalTecnicos: count() }).from(usuarios).where(eq(usuarios.rol, "TECNICO")),
    db.select({ totalBeneficiarios: count() }).from(beneficiarios),
    db.select({ beneficiariosEstaSemana: count() }).from(beneficiarios).where(gte(beneficiarios.fecha_registro, startOfWeek)),
    db.select({ totalBitacoras: count() }).from(bitacoras),
    db.select({ bitacorasEsteMes: count() }).from(bitacoras).where(gte(bitacoras.fecha_registro_servidor, startOfMonth)),
    db.select({ pendientes: count() }).from(asignaciones).where(eq(asignaciones.completado, false)),
    db.select({ completadas: count() }).from(asignaciones).where(eq(asignaciones.completado, true)),
  ]);

  const total = Number(pendientes) + Number(completadas);
  const porcentaje = total > 0 ? Math.round((Number(completadas) / total) * 100) : 0;

  return {
    totalTecnicos: Number(totalTecnicos),
    totalBeneficiarios: Number(totalBeneficiarios),
    beneficiariosEstaSemana: Number(beneficiariosEstaSemana),
    totalBitacoras: Number(totalBitacoras),
    bitacorasEsteMes: Number(bitacorasEsteMes),
    asignacionesPendientes: Number(pendientes),
    porcentajeCumplimiento: porcentaje,
  };
}

async function getRecentActivity(idCoordinador: number) {
  return db
    .select({
      id_bitacora: bitacoras.id_bitacora,
      tipo_bitacora: bitacoras.tipo_bitacora,
      fecha_hora_inicio: bitacoras.fecha_hora_inicio,
      latitud: bitacoras.latitud,
      longitud: bitacoras.longitud,
      estatus_sincronizacion: bitacoras.estatus_sincronizacion,
      nombre_tecnico: usuarios.nombre_completo,
    })
    .from(bitacoras)
    .leftJoin(usuarios, eq(bitacoras.id_usuario, usuarios.id_usuario))
    .orderBy(sql`${bitacoras.fecha_registro_servidor} DESC`)
    .limit(5);
}

export default async function CoordinadorDashboard() {
  const session = await getSession();
  if (!session || session.rol !== "COORDINADOR") redirect("/login");

  const [stats, recentActivity] = await Promise.all([
    getCoordinadorStats(session.id_usuario),
    getRecentActivity(session.id_usuario),
  ]);

  const today = formatDate(new Date(), "EEEE, d 'de' MMMM yyyy");

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title={`Bienvenido, ${session.nombre_completo}`}
        subtitle={`Hoy es ${today}`}
      >
        <div className="flex items-center gap-2 text-sm">
          <div className="status-dot active" />
          <span className="text-muted-foreground">Activo</span>
        </div>
      </PageHeader>

      <div className="p-8 space-y-6 bg-gray-50">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Técnicos"
            value={stats.totalTecnicos}
            subtitle="en tu región"
            icon={<Users className="w-6 h-6" />}
            color="guinda"
            delay={0}
          />
          <StatsCard
            title="Beneficiarios"
            value={stats.totalBeneficiarios}
            icon={<UserCheck className="w-6 h-6" />}
            color="dorado"
            change={{ value: `+${stats.beneficiariosEstaSemana}`, label: "esta semana", type: "up" }}
            delay={100}
          />
          <StatsCard
            title="Bitácoras"
            value={stats.totalBitacoras}
            icon={<BookOpen className="w-6 h-6" />}
            color="guinda"
            change={{ value: `+${stats.bitacorasEsteMes}`, label: "este mes", type: stats.bitacorasEsteMes > 0 ? "up" : "neutral" }}
            delay={200}
          />
          <StatsCard
            title="Cumplimiento"
            value={`${stats.porcentajeCumplimiento}%`}
            subtitle={`${stats.asignacionesPendientes} pendientes`}
            icon={<CheckCircle2 className="w-6 h-6" />}
            color={stats.porcentajeCumplimiento >= 70 ? "guinda" : stats.porcentajeCumplimiento >= 40 ? "dorado" : "red"}
            animated={false}
            delay={300}
          />
        </div>

        {/* Alert: pending assignments */}
        {stats.asignacionesPendientes > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-l-4 border-l-amber-600 border-amber-200 bg-amber-50">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 font-display">
                {stats.asignacionesPendientes} asignaciones pendientes
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Revisa las asignaciones sin completar y contacta a tus técnicos.
              </p>
            </div>
          </div>
        )}

        {/* Two column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-guinda-900 font-display">Actividad Reciente</h3>
                <p className="text-xs text-gray-500 mt-1">Últimas bitácoras registradas</p>
              </div>
              <Calendar className="w-5 h-5 text-dorado-600" />
            </div>
            
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => {
                  const statusColors = {
                    SINCRONIZADO: "bg-green-100 text-green-700 border-green-200",
                    PENDIENTE: "bg-yellow-100 text-yellow-700 border-yellow-200",
                    ERROR: "bg-red-100 text-red-700 border-red-200",
                  };
                  
                  return (
                    <div
                      key={item.id_bitacora}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-guinda-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-guinda-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-guinda-900">
                              {item.tipo_bitacora || "Bitácora"}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {item.nombre_tecnico || "Técnico"}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              statusColors[item.estatus_sincronizacion as keyof typeof statusColors] || statusColors.PENDIENTE
                            }`}
                          >
                            {item.estatus_sincronizacion}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(new Date(item.fecha_hora_inicio), "d MMM, HH:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-guinda-900 font-display">Acciones Rápidas</h3>
                <p className="text-xs text-gray-500 mt-1">Tareas frecuentes</p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="/coordinador/beneficiarios"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-guinda-300 hover:bg-guinda-50/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-guinda-100 flex items-center justify-center group-hover:bg-guinda-200 transition-colors">
                  <UserCheck className="w-5 h-5 text-guinda-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-guinda-900">Ver Beneficiarios</p>
                  <p className="text-xs text-gray-600">Consulta el padrón completo</p>
                </div>
              </a>

              <a
                href="/coordinador/bitacoras"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-dorado-300 hover:bg-amber-50/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <BookOpen className="w-5 h-5 text-dorado-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-guinda-900">Bitácoras</p>
                  <p className="text-xs text-gray-600">Revisa registros de campo</p>
                </div>
              </a>

              <a
                href="/coordinador/tecnicos"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-guinda-300 hover:bg-guinda-50/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-guinda-100 flex items-center justify-center group-hover:bg-guinda-200 transition-colors">
                  <Users className="w-5 h-5 text-guinda-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-guinda-900">Técnicos</p>
                  <p className="text-xs text-gray-600">Gestiona tu equipo</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg border border-guinda-200 bg-guinda-50">
          <div className="w-10 h-10 rounded-lg bg-guinda-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-guinda-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-guinda-900 font-display">
              Rendimiento del equipo
            </p>
            <p className="text-xs text-guinda-700 mt-1">
              El cumplimiento de asignaciones está en {stats.porcentajeCumplimiento}%. 
              {stats.porcentajeCumplimiento >= 70 
                ? " ¡Excelente trabajo! Mantén el ritmo."
                : " Considera revisar el seguimiento con tus técnicos."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
