import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyWebToken } from "./lib/auth";

const PUBLIC_PATHS = ["/login"];
const STATIC_PATHS = ["/_next/static", "/_next/image", "/favicon.ico", "/logo", "/icons"];

const ROLE_PATHS: Record<string, string[]> = {
  SUPER_ADMIN: ["/admin", "/coordinador", "/tecnico"],
  COORDINADOR: ["/coordinador"],
  TECNICO: ["/tecnico"],
};

// Rutas bloqueadas específicamente por rol
const BLOCKED_PATHS: Record<string, string[]> = {
  COORDINADOR: [
    "/coordinador/tecnicos/nuevo",
    "/coordinador/beneficiarios",
  ],
  TECNICO: [],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets (fastest check first)
  if (STATIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check web session cookie
  const token = request.cookies.get("campo_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifyWebToken(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("campo_session");
    return response;
  }

  // Role-based access
  const allowedPaths = ROLE_PATHS[session.rol] ?? [];
  const hasAccess = allowedPaths.some((p) => pathname.startsWith(p));

  if (!hasAccess) {
    const roleHome: Record<string, string> = {
      SUPER_ADMIN: "/admin/dashboard",
      COORDINADOR: "/coordinador/dashboard",
      TECNICO: "/tecnico/dashboard",
    };
    return NextResponse.redirect(new URL(roleHome[session.rol] ?? "/login", request.url));
  }

  // Check blocked paths for specific roles
  const blockedPaths = BLOCKED_PATHS[session.rol];
  if (blockedPaths && blockedPaths.some((p) => pathname.startsWith(p))) {
    const roleHome: Record<string, string> = {
      SUPER_ADMIN: "/admin/dashboard",
      COORDINADOR: "/coordinador/dashboard",
      TECNICO: "/tecnico/dashboard",
    };
    return NextResponse.redirect(new URL(roleHome[session.rol] ?? "/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
};
