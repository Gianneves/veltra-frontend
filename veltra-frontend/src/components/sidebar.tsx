"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Activity,
  BarChart3,
  GitCompareArrows,
  Target,
  Award,
  Lightbulb,
  MessageSquareText,
  UserRound,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training-plan", label: "Plano de Treino", icon: Calendar },
  { href: "/activities", label: "Atividades", icon: Activity },
  { href: "/analytics", label: "Análises", icon: BarChart3 },
  { href: "/comparison", label: "Comparação", icon: GitCompareArrows },
  { href: "/goal", label: "Minha Meta", icon: Target },
  { href: "/achievements", label: "Conquistas", icon: Award },
  { href: "/coach/insights", label: "Insights", icon: Lightbulb },
  { href: "/coach/chat", label: "Coach", icon: MessageSquareText },
  { href: "/profile", label: "Perfil", icon: UserRound },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-surface-container-high bg-surface-container-low">
      <div className="flex justify-center px-4 py-5 border-b border-surface-container-high">
        <img
          src="/images/veltra-wordmark-compact.svg"
          alt="Veltra"
          className="mx-auto block h-14 w-auto max-w-full"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-container/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-container-high px-4 py-4">
        <div className="flex items-center gap-3 px-2">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full bg-surface-container-highest object-cover"
            />
          ) : (
            <img
              src="/images/veltra-icon-light-bg.svg"
              alt="Avatar"
              className="h-8 w-8 rounded-full bg-surface-container-highest p-1"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">{user?.name}</p>
          </div>
          <button
            onClick={signOut}
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
