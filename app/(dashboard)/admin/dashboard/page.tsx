import type { Metadata } from "next";
import { db } from "@/lib/db";
import { usuarios, beneficiarios, bitacoras, asignaciones, evidencias } from "@/lib/schema";
import { count, eq, and, gte, sql } from "drizzle-orm";
import PageHeader from "@/components/layout/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentBitacoras from "./RecentBitacoras";
import { ActivityChartClient, SatisfactionChartClient } from "./ChartsClient";
import styles from "./DashboardPage.module.css";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Users, UserCheck, BookOpen, ClipboardList,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export const revalidate = 60; // Revalidate every 60 seconds

async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Ejecutar en paralelo con índices optimizados
  const [
    [{ totalTecnicos }],
    [{ tecnicosActivos }],
    [{ totalBeneficiarios }],
    [{ beneficiariosEstesMes }],
    [{ totalBitacoras }],
    [{ bitacorasHoy }],
    [{ pendientes }],
    [{ completadas }],
  ] = await Promise.all([
    db.select({ totalTecnicos: count() }).from(usuarios).where(eq(usuarios.rol, "TECNICO")),
    db.select({ tecnicosActivos: count() }).from(usuarios).where(and(eq(usuarios.rol, "TECNICO"), eq(usuarios.activo, true))),
    db.select({ totalBeneficiarios: count() }).from(beneficiarios),
    db.select({ beneficiariosEstesMes: count() }).from(beneficiarios).where(gte(beneficiarios.fecha_registro, startOfMonth)),
    db.select({ totalBitacoras: count() }).from(bitacoras),
    db.select({ bitacorasHoy: count() }).from(bitacoras).where(gte(bitacoras.fecha_registro_servidor, startOfToday)),
    db.select({ pendientes: count() }).from(asignaciones).where(eq(asignaciones.completado, false)),
    db.select({ completadas: count() }).from(asignaciones).where(eq(asignaciones.completado, true)),
  ]);

  const total = Number(pendientes) + Number(completadas);
  const porcentaje = total > 0 ? Math.round((Number(completadas) / total) * 100) : 0;

  return {
    totalTecnicos: Number(totalTecnicos),
    tecnicosActivos: Number(tecnicosActivos),
    totalBeneficiarios: Number(totalBeneficiarios),
    beneficiariosEstesMes: Number(beneficiariosEstesMes),
    totalBitacoras: Number(totalBitacoras),
    bitacorasHoy: Number(bitacorasHoy),
    asignacionesPendientes: Number(pendientes),
    porcentajeCumplimiento: porcentaje,
  };
}

async function getSatisfactionData() {
  // Optimización: Una sola consulta con LEFT JOIN y agregación
  const bitacorasData = await db
    .select({
      id_bitacora: bitacoras.id_bitacora,
      datos_extendidos: bitacoras.datos_extendidos,
      estatus_sincronizacion: bitacoras.estatus_sincronizacion,
      cantidad_evidencias: sql<number>`CAST(COUNT(${evidencias.id_evidencia}) AS INTEGER)`,
    })
    .from(bitacoras)
    .leftJoin(evidencias, eq(bitacoras.id_bitacora, evidencias.id_bitacora))
    .groupBy(bitacoras.id_bitacora, bitacoras.datos_extendidos, bitacoras.estatus_sincronizacion);

  // Categorizar bitácoras por satisfacción
  let excelente = 0; // Con datos_extendidos completos y evidencias
  let bueno = 0;     // Con datos_extendidos y al menos 1 evidencia
  let regular = 0;   // Con datos_extendidos o sin errores
  let malo = 0;      // Errores de sincronización o incompletas

  for (const b of bitacorasData) {
    const tieneEvidencias = Number(b.cantidad_evidencias) > 0;
    const tieneDatosExtendidos = b.datos_extendidos && Object.keys(b.datos_extendidos).length > 0;
    const tieneError = b.estatus_sincronizacion === "ERROR" || b.estatus_sincronizacion === "FALLO";

    if (tieneError) {
      malo++;
    } else if (tieneDatosExtendidos && tieneEvidencias) {
      excelente++;
    } else if (tieneDatosExtendidos || tieneEvidencias) {
      bueno++;
    } else {
      regular++;
    }
  }

  const total = excelente + bueno + regular + malo;

  return [
    {
      nivel: "EXCELENTE",
      cantidad: excelente,
      porcentaje: total > 0 ? Math.round((excelente / total) * 100) : 0,
    },
    {
      nivel: "BUENO",
      cantidad: bueno,
      porcentaje: total > 0 ? Math.round((bueno / total) * 100) : 0,
    },
    {
      nivel: "REGULAR",
      cantidad: regular,
      porcentaje: total > 0 ? Math.round((regular / total) * 100) : 0,
    },
    {
      nivel: "MALO",
      cantidad: malo,
      porcentaje: total > 0 ? Math.round((malo / total) * 100) : 0,
    },
  ];
}

async function getRecentBitacoras() {
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
    .limit(8);
}

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.rol !== "SUPER_ADMIN") redirect("/login");

  const [stats, recentBitacoras, satisfactionData] = await Promise.all([
    getDashboardStats(),
    getRecentBitacoras(),
    getSatisfactionData(),
  ]);

  const today = formatDate(new Date(), "EEEE, d 'de' MMMM yyyy");

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Panel de Control"
        subtitle={`Hoy es ${today}`}
      >
        <div className="flex items-center gap-2 text-sm">
          <div className="status-dot active" />
          <span className="text-muted-foreground">Sistema operativo</span>
        </div>
      </PageHeader>

      <div className={styles.content}>
        {/* Stats grid */}
        <div className={styles.statsGrid}>
          <StatsCard
            title="Total Técnicos"
            value={stats.totalTecnicos}
            subtitle={`${stats.tecnicosActivos} activos`}
            icon={<Users className="w-6 h-6" />}
            color="guinda"
            change={{ value: stats.tecnicosActivos, label: "activos", type: "up" }}
            delay={0}
          />
          <StatsCard
            title="Beneficiarios"
            value={stats.totalBeneficiarios}
            icon={<UserCheck className="w-6 h-6" />}
            color="dorado"
            change={{ value: `+${stats.beneficiariosEstesMes}`, label: "este mes", type: "up" }}
            delay={100}
          />
          <StatsCard
            title="Bitácoras"
            value={stats.totalBitacoras}
            icon={<BookOpen className="w-6 h-6" />}
            color="guinda"
            change={{ value: stats.bitacorasHoy, label: "hoy", type: stats.bitacorasHoy > 0 ? "up" : "neutral" }}
            delay={200}
          />
          <StatsCard
            title="Cumplimiento"
            value={`${stats.porcentajeCumplimiento}%`}
            subtitle={`${stats.asignacionesPendientes} asignaciones pendientes`}
            icon={<CheckCircle2 className="w-6 h-6" />}
            color={stats.porcentajeCumplimiento >= 70 ? "guinda" : stats.porcentajeCumplimiento >= 40 ? "dorado" : "red"}
            animated={false}
            delay={300}
          />
        </div>

        {/* Two column layout */}
        <div className={styles.mainGrid}>
          {/* Chart — 2/3 */}
          <div className={styles.wideCol}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h3 className={styles.panelTitle}>Actividad del mes</h3>
                  <p className={styles.panelSubtext}>Bitácoras registradas por día</p>
                </div>
                <div className={styles.panelMeta}>
                  <TrendingUp className="w-4 h-4 text-dorado-600" />
                  <span>Últimos 30 días</span>
                </div>
              </div>
              <ActivityChartClient />
            </div>
          </div>

          {/* Recent bitacoras — 1/3 */}
          <div>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Últimas bitácoras</h3>
                <span className={styles.panelSubtext}>{recentBitacoras.length} registros</span>
              </div>
              <RecentBitacoras items={recentBitacoras as any} />
            </div>
          </div>
        </div>

        {/* Satisfaction Chart */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle}>Calidad de Bitácoras</h3>
              <p className={styles.panelSubtext}>Distribución de satisfacción/calidad</p>
            </div>
            <div className={styles.panelMeta}>
              <CheckCircle2 className="w-4 h-4 text-guinda-600" />
              <span>Total: {satisfactionData.reduce((sum, s) => sum + s.cantidad, 0)} bitácoras</span>
            </div>
          </div>
          <SatisfactionChartClient data={satisfactionData as any} />
        </div>

        {/* Alert: pending assignments */}
        {stats.asignacionesPendientes > 0 && (
          <div className={styles.alert}>
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 font-display">
                {stats.asignacionesPendientes} asignaciones pendientes
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Revisa las asignaciones sin completar y contacta a los técnicos correspondientes.
              </p>
            </div>
            <a
              href="/admin/asignaciones"
              className={styles.alertLink}
            >
              Ver todas →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
