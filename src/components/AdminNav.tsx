"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Palette, ImageIcon, Smartphone, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/station", label: "Build Station", icon: Store },
  { href: "/settings", label: "Theme", icon: Palette },
  { href: "/screen1", label: "Stylist media", icon: ImageIcon },
  { href: "/mockup/s1", label: "Stylist mockup", icon: Smartphone },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_75%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="relative grid h-9 w-9 place-items-center rounded-xl brand-gradient text-white shadow-lg shadow-fuchsia-500/30"
            aria-hidden
          >
            <span className="text-base font-black tracking-tight">S</span>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[var(--background)]" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--fg-muted)]">
              SalonX
            </span>
            <span className="text-sm font-semibold tracking-tight text-[var(--fg-strong)]">
              v2 Admin
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                  active
                    ? "bg-[var(--fg-strong)] text-[var(--background)] shadow-sm"
                    : "text-[var(--foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--fg-strong)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <nav className="flex items-center gap-1 md:hidden">
          {links.slice(0, 4).map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full transition-colors",
                  active
                    ? "bg-[var(--fg-strong)] text-[var(--background)]"
                    : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
                )}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
