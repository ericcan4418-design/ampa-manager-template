"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Trophy,
  Users,
  UsersRound,
  DollarSign,
  MessageSquare,
  BookUser,
  Settings,
  Menu,
  X,
  LogOut,
  GitBranch,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/",           icon: LayoutGrid },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Reps",        href: "/reps",        icon: Users },
  { label: "Teams",       href: "/teams",       icon: UsersRound },
  { label: "Pipeline",    href: "/pipeline",    icon: GitBranch },
  { label: "Revenue",     href: "/revenue",     icon: DollarSign },
  { label: "Messages",    href: "/messages",    icon: MessageSquare },
  { label: "Contacts",    href: "/contacts",    icon: BookUser },
  { label: "Settings",    href: "/settings",    icon: Settings },
];

const MANAGER_NAME     = "Eric Canche";
const MANAGER_ROLE     = "Manager";
const MANAGER_INITIALS = "EC";

function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[#475569] hover:bg-[#1A2942]/60 hover:text-[#9CA3AF] transition-colors mt-2"
    >
      <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
      Sign out
    </button>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col bg-[#0D1525] lg:flex">
        {/* Logo */}
        <div className="px-6 pb-4 pt-7">
          <div className="flex items-center gap-2">
            <span className="text-[22px] font-bold tracking-tight text-white">AMPA</span>
          </div>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-[#475569]">
            Manager Platform
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3 pt-2">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon   = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "group flex flex-shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[#1A2942] text-white"
                    : "text-[#9CA3AF] hover:bg-[#1A2942]/60 hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.5} />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-white/[0.08]" />

        {/* User card */}
        <div className="px-4 pb-5 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2942] text-xs font-bold text-white">
                {MANAGER_INITIALS}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{MANAGER_NAME}</p>
              <p className="truncate text-[11px] text-[#9CA3AF]">{MANAGER_ROLE}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-[#0D1525] px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-white">AMPA</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          title={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#1A2942] hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-[240px] flex-col bg-[#0D1525] pt-14">
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3 pt-2">
              {NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon   = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex flex-shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-[#1A2942] text-white"
                        : "text-[#9CA3AF] hover:bg-[#1A2942]/60 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/[0.08] px-4 pb-5 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A2942] text-xs font-bold text-white">
                    {MANAGER_INITIALS}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{MANAGER_NAME}</p>
                  <p className="truncate text-[11px] text-[#9CA3AF]">{MANAGER_ROLE}</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
