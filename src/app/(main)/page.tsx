import { ExportSyncButton } from "@/components/ExportSyncButton";
import { CalendarDashboard } from "@/components/CalendarDashboard";
import { loadCalendarDashboardData } from "@/lib/calendar-dashboard";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Store,
} from "lucide-react";

const quickLinks = [
  {
    href: "/station",
    title: "Build Station",
    desc: "Up to 10 brands — Marquee, Stylist, Climax, Screen 5. Lock + activate for the live app.",
    icon: Store,
    accent: "from-indigo-500/20 via-violet-500/15 to-fuchsia-500/20",
    iconColor: "#6366f1",
  },
  {
    href: "/settings",
    title: "Theme",
    desc: "Primary color presets and picker — maps to salonx.primaryHex.",
    icon: Palette,
    accent: "from-fuchsia-500/20 via-pink-500/15 to-rose-500/20",
    iconColor: "#c026d3",
  },
  {
    href: "/screen1",
    title: "Stylist media",
    desc: "Upload images for top bar, hero, promo, and curve strip.",
    icon: ImageIcon,
    accent: "from-sky-500/20 via-cyan-500/15 to-emerald-500/20",
    iconColor: "#0284c7",
  },
] as const;

export default async function Home() {
  const calendar = await loadCalendarDashboardData();

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-10 shadow-sm backdrop-blur-md sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.45), rgba(236,72,153,0.0) 70%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.4), rgba(99,102,241,0.0) 70%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)] shadow-sm">
              <Sparkles className="h-3 w-3 text-fuchsia-500" />
              Control Center
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="brand-gradient-text">SalonX</span>{" "}
              <span className="text-[var(--fg-strong)]">Admin Dashboard</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--foreground)]">
              Live calendar, clients, services, and products from{" "}
              <strong className="text-[var(--fg-strong)]">demo-api</strong> — same
              database as salonx-web-v2. Set{" "}
              <code className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--fg-strong)]">
                NEXT_PUBLIC_SALONX_API_ORIGIN
              </code>{" "}
              to wire live data + realtime updates.
            </p>
          </div>
          <Link
            href="/station"
            className="group inline-flex items-center gap-2 rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:shadow-fuchsia-500/50"
          >
            Open Build Station
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <CalendarDashboard data={calendar} />

      <section className="space-y-4">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--fg-strong)]">
              Quick actions
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Jump into the most-used admin tools.
            </p>
          </div>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(({ href, title, desc, icon: Icon, accent, iconColor }) => (
            <Link
              key={href}
              href={href}
              className="surface-card group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${accent}`}
                aria-hidden
              />
              <div className="relative flex items-start gap-4">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--surface-muted)] ring-1 ring-inset ring-black/5 transition-transform group-hover:scale-110 dark:ring-white/10"
                  style={{ color: iconColor }}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-1.5 font-semibold tracking-tight text-[var(--fg-strong)]">
                    {title}
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--fg-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--fg-strong)]" />
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground)]">
                    {desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-card relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-base font-semibold tracking-tight text-[var(--fg-strong)]">
              Push to salonx-web-v2
            </h2>
            <p className="mt-1.5 text-sm text-[var(--fg-muted)]">
              Copy theme + stylist demo snippet for the Vite app.
            </p>
          </div>
          <ExportSyncButton />
        </div>
      </section>
    </div>
  );
}
