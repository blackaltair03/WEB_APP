"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, UserCheck, ClipboardList, BookOpen,
  MapPin, Settings, Bell, BarChart3, ChevronLeft, ChevronRight,
  Wheat, LogOut, Calendar, Shield,
} from "lucide-react";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard",      icon: LayoutDashboard, roles: ["SUPER_ADMIN"] },
  { label: "Dashboard", href: "/coordinador/dashboard",icon: LayoutDashboard, roles: ["COORDINADOR"] },
  { label: "Técnicos",  href: "/admin/usuarios",       icon: Users,           roles: ["SUPER_ADMIN"] },
  { label: "Beneficiarios", href: "/admin/beneficiarios", icon: UserCheck,    roles: ["SUPER_ADMIN"] },
  { label: "Asignaciones",  href: "/admin/asignaciones",  icon: ClipboardList, roles: ["SUPER_ADMIN"] },
  { label: "Asignaciones",  href: "/coordinador/asignaciones", icon: ClipboardList, roles: ["COORDINADOR"] },
  { label: "Bitácoras",    href: "/coordinador/bitacoras", icon: BookOpen,     roles: ["COORDINADOR"] },
  { label: "Reportes",   href: "/admin/reportes",       icon: BarChart3,       roles: ["SUPER_ADMIN"] },
  { label: "Reportes",   href: "/coordinador/reportes", icon: BarChart3,       roles: ["COORDINADOR"] },
  { label: "Configuración", href: "/admin/configuracion",   icon: Settings,        roles: ["SUPER_ADMIN"] },
  { label: "Técnicos",  href: "/coordinador/tecnicos",      icon: Users,          roles: ["COORDINADOR"] },
];

interface SidebarProps {
  userRol: UserRole;
  userName: string;
  userEmail: string;
  notifCount?: number;
}

function Sidebar({ userRol, userName, userEmail, notifCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  const toggle = () => {
    setCollapsed((v) => {
      localStorage.setItem("sidebar-collapsed", String(!v));
      return !v;
    });
  };

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(userRol));
  const initials = userName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out border-r z-30",
        "bg-guinda-700 text-white border-guinda-800",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-guinda-800",
        collapsed && "justify-center px-2"
      )}>
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-dorado-600 flex items-center justify-center shadow-lg">
          <Wheat className="w-5 h-5 text-white font-bold" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight tracking-wide">
              SADERH
            </p>
            <p className="text-white/60 text-xs truncate">
              Gestión de Campo
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-guinda-800 text-dorado-300 shadow-sm"
                  : "text-white/65 hover:bg-guinda-600 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-dorado-600 rounded-r-full" />
              )}
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-dorado-400" : "text-white/50 group-hover:text-white"
              )} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-auto text-xs bg-dorado-600 text-guinda-900 font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-guinda-800 p-3 space-y-2">
        {/* Notifications */}
        {!collapsed && (
          <Link
            href="/notificaciones"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-guinda-600 hover:text-white transition-colors"
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </div>
            <span>Notificaciones</span>
            {notifCount > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                {notifCount}
              </span>
            )}
          </Link>
        )}

        {/* User pill */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-guinda-800">
            <div className="w-7 h-7 rounded-full bg-dorado-600 flex items-center justify-center text-xs font-bold text-guinda-900 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-white/60 truncate">{userEmail}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className={cn(
              "flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-red-900/30 hover:text-red-300 transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </form>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs text-white/40 hover:text-white/70 hover:bg-guinda-600 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
