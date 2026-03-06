import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { db } from "@/lib/db";
import { notificaciones } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Unread notifications count
  const [{ value: notifCount }] = await db
    .select({ value: count() })
    .from(notificaciones)
    .where(
      and(
        eq(notificaciones.id_usuario, session.id_usuario),
        eq(notificaciones.leida, false)
      )
    );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        userRol={session.rol}
        userName={session.nombre_completo}
        userEmail={session.email}
        notifCount={Number(notifCount)}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
