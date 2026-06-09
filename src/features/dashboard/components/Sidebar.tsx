"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Images,
  Library,
  CalendarDays,
  Camera,
  ScrollText,
  Settings,
  Plus,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",  label: "Dashboard",     icon: LayoutDashboard },
  { href: "/posts",      label: "Posts",          icon: Images },
  { href: "/media",      label: "Mídia",          icon: Library },
  { href: "/calendar",   label: "Calendário",     icon: CalendarDays },
  { href: "/instagram",  label: "Instagram",      icon: Camera },
  { href: "/logs",       label: "Logs",           icon: ScrollText },
  { href: "/settings",   label: "Configurações",  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Camera className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm">Insta Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3 w-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/posts/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Post
        </Link>
      </div>
    </aside>
  );
}
