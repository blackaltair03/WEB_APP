import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function RootPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const roleRoutes: Record<string, string> = {
    SUPER_ADMIN: "/admin/dashboard",
    COORDINADOR: "/coordinador/dashboard",
    TECNICO: "/tecnico/dashboard",
  };

  redirect(roleRoutes[session.rol] ?? "/login");
}
