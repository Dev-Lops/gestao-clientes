"use client";

import { Button } from "@/components/ui/button";
import { can, type AppRole } from "@/services/auth/rbac";

import { cn } from "@/lib/utils";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";

type NavLink = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  minRole: Exclude<AppRole, "guest">;
};

type Props = {
  children: ReactNode;
  userName?: string;
  role?: AppRole;
};

// Links e rótulos
const NAV_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    label: "Visão geral",
    icon: LayoutDashboard,
    minRole: "client",
  },
  { href: "/calendar", label: "Calendário", icon: Calendar, minRole: "client" },
  { href: "/clients", label: "Clientes", icon: Users, minRole: "staff" },
  {
    href: "/admin/members",
    label: "Administração",
    icon: ShieldCheck,
    minRole: "owner",
  },
];

const ROLE_LABEL: Record<AppRole, string> = {
  guest: "Convidado",
  client: "Cliente",
  staff: "Equipe",
  owner: "Proprietário",
};

// -----------------------------------------------------

export function SidebarWithTopbar({
  children,
  userName = "Usuário",
  role = "guest",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Logout seguro
  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao encerrar sessão");
    } finally {
      router.replace("/auth/login");
    }
  }

  // Links filtrados pelo papel
  const availableLinks = useMemo(
    () => NAV_LINKS.filter((link) => can(role, link.minRole)),
    [role],
  );

  // -----------------------------------------------------
  // Layout principal
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* SIDEBAR FIXA */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl transition-transform lg:translate-x-0 lg:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3 text-lg font-semibold text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              GM
            </span>
            Gestão+
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </Button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {availableLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                    : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900",
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 px-7 py-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex flex-1 flex-col lg:ml-72">
        {/* TOPBAR FIXA */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Bem-vinda(o)
              </p>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                {userName}
              </h1>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
              role === "guest"
                ? "bg-slate-300 text-slate-700"
                : "bg-slate-900 text-white",
            )}
          >
            {ROLE_LABEL[role]}
          </span>
        </header>

        {/* ÁREA ROLÁVEL */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
