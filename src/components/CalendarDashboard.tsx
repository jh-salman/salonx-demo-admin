"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Database,
  Loader2,
  Package,
  Plus,
  Scissors,
  Sparkles,
  Tag,
  Trash2,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import {
  addWaitlistAction,
  removeWaitlistAction,
} from "@/app/actions/calendar-dashboard";
import { useCalendarDashboardRealtime } from "@/hooks/use-calendar-dashboard-realtime";
import type {
  CalendarDashboardData,
  DashboardCatalogClient,
  DashboardCatalogProduct,
  DashboardCatalogService,
} from "@/lib/calendar-dashboard";
import { cn, formatRelative } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { ProductAddDialog } from "@/components/ProductAddDialog";

type IconType = React.ComponentType<{ className?: string }>;

function formatTimeRange(startIso: string, endIso: string) {
  try {
    const f = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    const dayF = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    });
    const s = new Date(startIso);
    const e = new Date(endIso);
    return { day: dayF.format(s), range: `${f.format(s)} – ${f.format(e)}` };
  } catch {
    return { day: startIso, range: "" };
  }
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  gradient,
  iconColor,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: IconType;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className="surface-card group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px"
        style={{ background: gradient }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-50 blur-3xl transition-opacity group-hover:opacity-80"
        style={{ background: gradient }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[var(--fg-strong)]">
            {value.toLocaleString()}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">{hint}</p>
          ) : null}
        </div>
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset ring-black/5 transition-transform group-hover:scale-110 dark:ring-white/10"
          style={{ background: gradient, color: iconColor }}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

type ActionState = { ok: true } | { ok: false; error: string } | null;

function clientById(clients: DashboardCatalogClient[], id: string | undefined) {
  if (!id) return undefined;
  return clients.find((c) => c.id === id);
}
function clientByName(clients: DashboardCatalogClient[], name: string) {
  const key = name?.trim().toLowerCase();
  if (!key) return undefined;
  return clients.find((c) => c.name.trim().toLowerCase() === key);
}
function serviceByName(services: DashboardCatalogService[], name: string) {
  const key = name?.trim().toLowerCase();
  if (!key) return undefined;
  return services.find((s) => s.name.trim().toLowerCase() === key);
}

function WaitlistForm({
  clients,
  services,
}: {
  clients: DashboardCatalogClient[];
  services: DashboardCatalogService[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionState, formData: FormData) => addWaitlistAction(formData),
    null as ActionState,
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  const catalogReady = clients.length > 0 && services.length > 0;

  return (
    <form action={formAction} className="space-y-4">
      {!catalogReady ? (
        <div className="flex gap-2 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Add clients and services in the calendar app before using the waiting list.
          </span>
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <Label className="mb-1.5 block">Client</Label>
          <Select name="clientId" required disabled={!catalogReady || pending} defaultValue="">
            <option value="" disabled>
              Select client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.phone ? ` · ${c.phone}` : ""}
              </option>
            ))}
          </Select>
        </label>
        <label className="block">
          <Label className="mb-1.5 block">Service</Label>
          <Select name="serviceId" required disabled={!catalogReady || pending} defaultValue="">
            <option value="" disabled>
              Select service…
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {typeof s.price === "number" ? ` · $${s.price}` : ""}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="gradient" disabled={pending || !catalogReady}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Adding…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add to waiting list
            </>
          )}
        </Button>
        {state && !state.ok ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4" /> {state.error}
          </p>
        ) : null}
        {state?.ok ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Added.
          </p>
        ) : null}
      </div>
    </form>
  );
}

function RemoveWaitlistButton({ id }: { id: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionState, formData: FormData) => removeWaitlistAction(formData),
    null as ActionState,
  );
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Remove from waiting list"
        disabled={pending}
        className="text-[var(--fg-muted)] hover:text-rose-600 dark:hover:text-rose-400"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </form>
  );
}

function sourceLabel(data: CalendarDashboardData) {
  if (data.dataSource === "demo-api" && data.apiOrigin) {
    return { label: "demo-api", detail: data.apiOrigin, tone: "live" as const };
  }
  if (data.dataSource === "local-api" && data.apiOrigin) {
    return { label: "Local Next API", detail: data.apiOrigin, tone: "info" as const };
  }
  if (data.dataSource === "prisma") {
    return { label: "Prisma", detail: "DATABASE_URL", tone: "info" as const };
  }
  return null;
}

function SectionCard({
  title,
  count,
  icon: Icon,
  iconColor,
  iconBg,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  count?: number;
  icon: IconType;
  iconColor: string;
  iconBg: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "surface-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm",
        className,
      )}
    >
      <header className="mb-5 flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10"
          style={{ background: iconBg, color: iconColor }}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-[var(--fg-strong)]">
              {title}
            </h2>
            {typeof count === "number" ? (
              <Badge variant="default">{count.toLocaleString()}</Badge>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1 text-sm text-[var(--fg-muted)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--fg-muted)]">
      {text}
    </p>
  );
}

function WaitlistRow({
  item,
  clients,
  services,
}: {
  item: CalendarDashboardData["waitlist"][number];
  clients: DashboardCatalogClient[];
  services: DashboardCatalogService[];
}) {
  const client = clientByName(clients, item.title);
  const service = serviceByName(services, item.service);
  return (
    <li className="group flex items-center gap-3 rounded-xl border border-fuchsia-200/40 bg-gradient-to-br from-fuchsia-50/80 to-pink-50/60 p-3 transition-all hover:border-fuchsia-300/70 hover:shadow-sm dark:border-fuchsia-900/30 dark:from-fuchsia-950/30 dark:to-pink-950/20">
      <Avatar src={client?.avatar} name={item.title} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-[var(--fg-strong)]">{item.title}</p>
          {client?.phone ? (
            <span className="hidden text-xs text-[var(--fg-muted)] sm:inline">
              · {client.phone}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {item.service ? (
            <Badge variant="brand" className="gap-1">
              <Scissors className="h-3 w-3" />
              {item.service}
              {typeof service?.price === "number" ? (
                <span className="font-medium opacity-70">· ${service.price}</span>
              ) : null}
            </Badge>
          ) : (
            <Badge variant="outline">No service</Badge>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-[var(--fg-muted)]">
            <Clock className="h-3 w-3" /> {formatRelative(item.waitlistAddedAt)}
          </span>
        </div>
      </div>
      <RemoveWaitlistButton id={item.id} />
    </li>
  );
}

function AppointmentRow({
  appt,
  clients,
  services,
}: {
  appt: CalendarDashboardData["upcomingAppointments"][number];
  clients: DashboardCatalogClient[];
  services: DashboardCatalogService[];
}) {
  const client = clientByName(clients, appt.clientName);
  const service = serviceByName(services, appt.service);
  const { day, range } = formatTimeRange(appt.start, appt.end);
  return (
    <li className="group flex items-center gap-3 rounded-xl border border-transparent bg-[var(--surface-muted)] p-3 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface)]">
      <Avatar src={client?.avatar} name={appt.clientName} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: appt.color || "#6366f1" }}
            aria-hidden
          />
          <p className="truncate font-semibold text-[var(--fg-strong)]">{appt.clientName}</p>
        </div>
        <p className="mt-0.5 truncate text-xs text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--foreground)]">
            {appt.service || "—"}
          </span>
          {typeof service?.price === "number" ? ` · $${service.price}` : ""}
          <span className="mx-1.5">·</span>
          {day}, {range}
        </p>
      </div>
      {service?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={service.image}
          alt=""
          className="hidden h-10 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/5 dark:ring-white/10 sm:block"
          loading="lazy"
        />
      ) : null}
    </li>
  );
}

function ServiceCard({ s }: { s: DashboardCatalogService }) {
  return (
    <div className="surface-card group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--surface-muted)]">
        {s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[var(--fg-muted)]">
            <Scissors className="h-8 w-8" />
          </div>
        )}
        {typeof s.price === "number" ? (
          <span className="absolute right-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
            ${s.price}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[var(--fg-strong)]">{s.name}</p>
        {s.kind ? (
          <p className="mt-0.5 truncate text-xs text-[var(--fg-muted)]">{s.kind}</p>
        ) : null}
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: DashboardCatalogProduct }) {
  return (
    <div className="surface-card group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ background: p.color || "var(--surface-muted)" }}
      >
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/70">
            <Package className="h-8 w-8" />
          </div>
        )}
        {p.stationTag ? (
          <Badge
            variant="default"
            className="absolute left-2 top-2 bg-zinc-900/80 text-white ring-white/20 backdrop-blur-sm"
          >
            <Tag className="h-3 w-3" /> {p.stationTag}
          </Badge>
        ) : null}
        {typeof p.price === "number" ? (
          <span className="absolute right-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
            ${p.price}
          </span>
        ) : null}
      </div>
      <div className="p-3">
        {p.brand ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--fg-muted)]">
            {p.brand}
          </p>
        ) : null}
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-[var(--fg-strong)]">
          {p.name}
        </p>
      </div>
    </div>
  );
}

export function CalendarDashboard({ data }: { data: CalendarDashboardData }) {
  const useRealtime =
    data.dbConfigured && data.dataSource === "demo-api" && Boolean(data.apiOrigin);
  const { connected } = useCalendarDashboardRealtime(
    useRealtime ? data.apiOrigin : undefined,
  );

  if (!data.dbConfigured) {
    return (
      <section className="surface-card rounded-2xl border border-amber-300/40 bg-amber-50/70 p-6 dark:border-amber-900/40 dark:bg-amber-950/40">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Calendar data unavailable
            </p>
            <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
              Set{" "}
              <code className="rounded bg-amber-100/80 px-1 text-xs dark:bg-amber-900/60">
                NEXT_PUBLIC_SALONX_API_ORIGIN
              </code>{" "}
              to your demo-api URL, or configure{" "}
              <code className="rounded bg-amber-100/80 px-1 text-xs dark:bg-amber-900/60">
                DATABASE_URL
              </code>{" "}
              and run migrations.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { counts } = data;
  const source = sourceLabel(data);

  return (
    <div className="space-y-8">
      {source ? (
        <div className="flex flex-wrap items-center gap-2.5 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-medium text-[var(--fg-strong)] shadow-sm">
            <Database className="h-3.5 w-3.5 text-indigo-500" />
            {source.label}
          </span>
          <span className="truncate text-xs text-[var(--fg-muted)]">{source.detail}</span>
          {useRealtime ? (
            <Badge
              variant={connected ? "success" : "warning"}
              className="gap-1.5 px-2.5 py-1"
            >
              {connected ? (
                <>
                  <span
                    className="pulse-live h-1.5 w-1.5 rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  <Wifi className="h-3 w-3" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" /> Reconnecting…
                </>
              )}
            </Badge>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Appointments"
          value={counts.appointments}
          hint="In loaded range"
          icon={CalendarDays}
          gradient="linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))"
          iconColor="#6366f1"
        />
        <StatCard
          label="Waiting list"
          value={counts.waitlist}
          hint="Toolbar queue"
          icon={Clock}
          gradient="linear-gradient(135deg, rgba(250,27,254,0.22), rgba(250,27,254,0.05))"
          iconColor="#c026d3"
        />
        <StatCard
          label="Parked"
          value={counts.parked}
          hint="Park toolbar"
          icon={Zap}
          gradient="linear-gradient(135deg, rgba(37,175,255,0.22), rgba(37,175,255,0.05))"
          iconColor="#0284c7"
        />
        <StatCard
          label="Clients"
          value={counts.clients}
          hint="Picker catalog"
          icon={Users}
          gradient="linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))"
          iconColor="#059669"
        />
        <StatCard
          label="Services"
          value={counts.services}
          hint="Service catalog"
          icon={Scissors}
          gradient="linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))"
          iconColor="#d97706"
        />
        <StatCard
          label="Products"
          value={counts.products}
          hint="Product catalog"
          icon={Package}
          gradient="linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))"
          iconColor="#9333ea"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Add to waiting list"
          icon={Sparkles}
          iconColor="#c026d3"
          iconBg="linear-gradient(135deg, rgba(250,27,254,0.18), rgba(250,27,254,0.04))"
          description="Pick client and service from the catalog. Stylists can drag entries onto the day grid."
        >
          <WaitlistForm clients={data.catalogClients} services={data.catalogServices} />
        </SectionCard>

        <SectionCard
          title="Upcoming appointments"
          count={data.upcomingAppointments.length}
          icon={CalendarDays}
          iconColor="#6366f1"
          iconBg="linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.04))"
        >
          {data.upcomingAppointments.length === 0 ? (
            <EmptyState text="No upcoming appointments in range." />
          ) : (
            <ul className="fancy-scroll max-h-96 space-y-2 overflow-y-auto pr-1">
              {data.upcomingAppointments.map((a) => (
                <AppointmentRow
                  key={a.id}
                  appt={a}
                  clients={data.catalogClients}
                  services={data.catalogServices}
                />
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Waiting list"
          count={data.waitlist.length}
          icon={Clock}
          iconColor="#c026d3"
          iconBg="linear-gradient(135deg, rgba(250,27,254,0.18), rgba(250,27,254,0.04))"
        >
          {data.waitlist.length === 0 ? (
            <EmptyState text="Empty — add clients above." />
          ) : (
            <ul className="fancy-scroll max-h-80 space-y-2 overflow-y-auto pr-1">
              {data.waitlist.map((w) => (
                <WaitlistRow
                  key={w.id}
                  item={w}
                  clients={data.catalogClients}
                  services={data.catalogServices}
                />
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Parked"
          count={data.parked.length}
          icon={Zap}
          iconColor="#0284c7"
          iconBg="linear-gradient(135deg, rgba(37,175,255,0.18), rgba(37,175,255,0.04))"
        >
          {data.parked.length === 0 ? (
            <EmptyState text="No parked appointments." />
          ) : (
            <ul className="fancy-scroll max-h-80 space-y-2 overflow-y-auto pr-1">
              {data.parked.map((p) => {
                const client = clientByName(data.catalogClients, p.title);
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-sky-200/40 bg-gradient-to-br from-sky-50/80 to-cyan-50/60 p-3 transition hover:border-sky-300/70 hover:shadow-sm dark:border-sky-900/30 dark:from-sky-950/30 dark:to-cyan-950/20"
                  >
                    <Avatar src={client?.avatar} name={p.title} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[var(--fg-strong)]">
                        {p.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[var(--fg-muted)]">
                        <Badge variant="info" className="mr-1.5">
                          {p.service || "Parked"}
                        </Badge>
                        {p.fromMove ? "from calendar" : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recent clients"
          count={counts.clients}
          icon={Users}
          iconColor="#059669"
          iconBg="linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.04))"
        >
          {data.recentClients.length === 0 ? (
            <EmptyState text="No clients in catalog yet." />
          ) : (
            <ul className="fancy-scroll max-h-80 space-y-2 overflow-y-auto pr-1">
              {data.recentClients.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 transition hover:bg-[var(--surface)]"
                >
                  <Avatar src={c.avatar} name={c.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--fg-strong)]">{c.name}</p>
                    <p className="truncate text-xs text-[var(--fg-muted)]">
                      {c.phone || c.email || "No contact info"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Service catalog"
        count={data.catalogServices.length}
        icon={Scissors}
        iconColor="#d97706"
        iconBg="linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.04))"
        description="Same catalog as salonx-web-v2 calendar picker. Edit from the Vite app or `/api/service-catalog`."
      >
        {data.catalogServices.length === 0 ? (
          <EmptyState text="No services yet." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {data.catalogServices.slice(0, 18).map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Product catalog"
        count={data.catalogProducts.length}
        icon={Package}
        iconColor="#9333ea"
        iconBg="linear-gradient(135deg, rgba(168,85,247,0.18), rgba(168,85,247,0.04))"
        description="Mirrors mockProducts in Postgres + realtime to Screen 2 (LOOK)."
        actions={<ProductAddDialog />}
      >
        {data.catalogProducts.length === 0 ? (
          <EmptyState text="No products yet — add the first one." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {data.catalogProducts.slice(0, 18).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
